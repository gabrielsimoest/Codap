import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, outboxOf, withNodeEnv } from '../../helper'
import { TEST_EMAIL } from '../../../src/utils/testAccount'

type App = Awaited<ReturnType<typeof build>>

async function registerUser (app: App) {
  const email = `change-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Change Email', email, password: 'senha1234' }
  })
  assert.equal(res.statusCode, 201)
  await app.mailer.flush()
  return { email, ...JSON.parse(res.payload) }
}

async function cleanupUser (app: App, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

function changeEmail (app: App, accessToken: string, email: string) {
  return app.inject({
    method: 'POST',
    url: '/auth/change-email',
    headers: { authorization: `Bearer ${accessToken}` },
    payload: { email }
  })
}

function tokenFrom (text: string | undefined): string {
  const match = /token=([^\s&]+)/.exec(text ?? '')
  assert.ok(match, 'o e-mail deveria trazer um link com token')
  return decodeURIComponent(match[1])
}

test('POST /auth/change-email requires authentication', async (t) => {
  const app = await build(t)
  const res = await app.inject({ method: 'POST', url: '/auth/change-email', payload: { email: 'novo@example.com' } })
  assert.equal(res.statusCode, 401)
})

test('POST /auth/change-email fixes an unconfirmed email and sends the confirmation to the new address only', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const oldToken = tokenFrom(outboxOf(app)[0].text)
  const newEmail = `corrigido-${randomUUID()}@example.com`

  const res = await changeEmail(app, registered.accessToken, newEmail)
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.user.email, newEmail)
  assert.equal(body.user.email_verified_at, null)
  assert.equal('password' in body.user, false)

  await app.mailer.flush()
  const mail = outboxOf(app).at(-1)
  assert.equal(mail?.to, newEmail)
  assert.match(mail?.subject ?? '', /Confirme seu e-mail/)

  // O link do endereço antigo morreu; o do novo confirma.
  const stale = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token: oldToken } })
  assert.equal(stale.statusCode, 400)
  const confirm = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token: tokenFrom(mail?.text) } })
  assert.equal(confirm.statusCode, 200)

  // O login passa a valer só com o e-mail novo.
  const withNew = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: newEmail, password: 'senha1234' } })
  const withOld = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: registered.email, password: 'senha1234' } })
  assert.equal(withNew.statusCode, 200)
  assert.equal(withOld.statusCode, 401)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/change-email refuses to change an email that is already confirmed', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  await app.prisma.users.update({ where: { id: registered.user.id }, data: { email_verified_at: new Date() } })

  const res = await changeEmail(app, registered.accessToken, `outro-${randomUUID()}@example.com`)
  assert.equal(res.statusCode, 403)

  const user = await app.prisma.users.findUnique({ where: { id: registered.user.id } })
  assert.equal(user?.email, registered.email)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/change-email rejects an email used by another account with 409', async (t) => {
  const app = await build(t)
  const first = await registerUser(app)
  const second = await registerUser(app)

  const res = await changeEmail(app, second.accessToken, first.email)
  assert.equal(res.statusCode, 409)

  await cleanupUser(app, first.user.id)
  await cleanupUser(app, second.user.id)
})

test('POST /auth/change-email rejects the current email and an invalid body with 400', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const same = await changeEmail(app, registered.accessToken, registered.email.toUpperCase())
  assert.equal(same.statusCode, 400)
  assert.match(JSON.parse(same.payload).message, /já é o e-mail/)

  const invalid = await changeEmail(app, registered.accessToken, 'nao-e-email')
  assert.equal(invalid.statusCode, 400)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/change-email refuses the test account email outside development', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const res = await changeEmail(app, registered.accessToken, TEST_EMAIL)
  assert.equal(res.statusCode, 400)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/change-email refuses a domain that looks like a typo, but only outside development', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const local = `typo-${randomUUID()}`

  const refused = await changeEmail(app, registered.accessToken, `${local}@gmial.com`)
  assert.equal(refused.statusCode, 400)
  const error = JSON.parse(refused.payload)
  assert.match(error.message, new RegExp(`${local}@gmail\\.com`))
  assert.equal(error.code, 'email_typo')
  assert.equal(error.suggestion, `${local}@gmail.com`)

  const accepted = await withNodeEnv('development', () => changeEmail(app, registered.accessToken, `${local}@gmial.com`))
  assert.equal(accepted.statusCode, 200)

  await cleanupUser(app, registered.user.id)
})
