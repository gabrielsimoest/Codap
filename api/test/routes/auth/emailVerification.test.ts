import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, outboxOf } from '../../helper'

type App = Awaited<ReturnType<typeof build>>

async function registerUser (app: App) {
  const email = `verify-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Verify <Test>', email, password: 'senha1234' }
  })
  assert.equal(res.statusCode, 201)
  await app.mailer.flush()
  return { email, ...JSON.parse(res.payload) }
}

async function cleanupUser (app: App, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

function tokenFromEmail (text: string): string {
  const match = /token=([^\s&]+)/.exec(text)
  assert.ok(match, 'o e-mail deveria trazer um link com token')
  return decodeURIComponent(match[1])
}

test('POST /auth/register sends one verification email with a working link and leaves the email unverified', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  assert.equal(registered.user.email_verified_at, null)

  const outbox = outboxOf(app)
  assert.equal(outbox.length, 1)
  assert.equal(outbox[0].to, registered.email)
  assert.match(outbox[0].subject, /Confirme seu e-mail/)
  assert.match(outbox[0].text, /\/auth\/verify-email\?token=/)
  // O nome do usuário é escapado no HTML (não vira marcação).
  assert.ok(outbox[0].html.includes('Verify &lt;Test&gt;'))
  assert.equal(outbox[0].html.includes('Verify <Test>'), false)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/verify-email confirms the email and the token cannot be reused', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = tokenFromEmail(outboxOf(app)[0].text)

  const res = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token } })
  assert.equal(res.statusCode, 200)

  const user = await app.prisma.users.findUnique({ where: { id: registered.user.id } })
  assert.ok(user?.email_verified_at)

  const again = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token } })
  assert.equal(again.statusCode, 400)

  // O login passa a devolver a data de confirmação.
  const login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: registered.email, password: 'senha1234' }
  })
  assert.ok(JSON.parse(login.payload).user.email_verified_at)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/verify-email rejects unknown, expired and wrong-type tokens with 400', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = tokenFromEmail(outboxOf(app)[0].text)

  const unknown = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token: 'nao-existe' } })
  assert.equal(unknown.statusCode, 400)

  await app.prisma.auth_tokens.updateMany({
    where: { user_id: registered.user.id },
    data: { expires_at: new Date(Date.now() - 1000) }
  })
  const expired = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token } })
  assert.equal(expired.statusCode, 400)
  const user = await app.prisma.users.findUnique({ where: { id: registered.user.id } })
  assert.equal(user?.email_verified_at, null)

  // Um token de redefinição de senha não confirma e-mail. (A redefinição só existe
  // para conta confirmada, então o e-mail é confirmado direto no banco para gerar um.)
  await app.prisma.users.update({ where: { id: registered.user.id }, data: { email_verified_at: new Date() } })
  await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: registered.email } })
  await app.mailer.flush()
  const resetToken = tokenFromEmail(outboxOf(app)[1].text)
  const wrongType = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token: resetToken } })
  assert.equal(wrongType.statusCode, 400)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/verify-email rejects a body without token with 400', async (t) => {
  const app = await build(t)
  const res = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: {} })
  assert.equal(res.statusCode, 400)
})

test('GET /auth/verify-email serves the confirmation page without consuming the token', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = tokenFromEmail(outboxOf(app)[0].text)

  const res = await app.inject({ method: 'GET', url: `/auth/verify-email?token=${encodeURIComponent(token)}` })
  assert.equal(res.statusCode, 200)
  assert.match(String(res.headers['content-type']), /text\/html/)
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.equal(res.headers['referrer-policy'], 'no-referrer')
  // O token vai só na URL: não é ecoado no HTML.
  assert.equal(res.payload.includes(token), false)

  // Abrir a página (o que um scanner de e-mail faz) não gasta o token.
  const user = await app.prisma.users.findUnique({ where: { id: registered.user.id } })
  assert.equal(user?.email_verified_at, null)
  const confirm = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token } })
  assert.equal(confirm.statusCode, 200)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/resend-verification requires authentication', async (t) => {
  const app = await build(t)
  const res = await app.inject({ method: 'POST', url: '/auth/resend-verification' })
  assert.equal(res.statusCode, 401)
})

test('POST /auth/resend-verification respects the cooldown, then sends a new link that replaces the old one', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const oldToken = tokenFromEmail(outboxOf(app)[0].text)
  const auth = { authorization: `Bearer ${registered.accessToken}` }

  // O e-mail do cadastro acabou de sair: pedir outro agora é cedo demais.
  const early = await app.inject({ method: 'POST', url: '/auth/resend-verification', headers: auth })
  assert.equal(early.statusCode, 429)

  // Simula o intervalo de 1 minuto já cumprido.
  await app.prisma.auth_tokens.updateMany({
    where: { user_id: registered.user.id },
    data: { created_at: new Date(Date.now() - 2 * 60 * 1000) }
  })
  const res = await app.inject({ method: 'POST', url: '/auth/resend-verification', headers: auth })
  assert.equal(res.statusCode, 200)
  await app.mailer.flush()

  const outbox = outboxOf(app)
  assert.equal(outbox.length, 2)
  const newToken = tokenFromEmail(outbox[1].text)
  assert.notEqual(newToken, oldToken)

  const oldAttempt = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token: oldToken } })
  assert.equal(oldAttempt.statusCode, 400)
  const newAttempt = await app.inject({ method: 'POST', url: '/auth/verify-email', payload: { token: newToken } })
  assert.equal(newAttempt.statusCode, 200)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/resend-verification returns 409 when the email is already confirmed', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  await app.prisma.users.update({ where: { id: registered.user.id }, data: { email_verified_at: new Date() } })

  const res = await app.inject({
    method: 'POST',
    url: '/auth/resend-verification',
    headers: { authorization: `Bearer ${registered.accessToken}` }
  })
  assert.equal(res.statusCode, 409)
  assert.equal(outboxOf(app).length, 1)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/resend-verification answers 503 when the email cannot be prepared', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  await app.prisma.auth_tokens.deleteMany({ where: { user_id: registered.user.id } })

  // Sem PUBLIC_URL (fora de desenvolvimento) não há como montar o link.
  const publicUrl = process.env.PUBLIC_URL
  delete process.env.PUBLIC_URL
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/resend-verification',
      headers: { authorization: `Bearer ${registered.accessToken}` }
    })
    assert.equal(res.statusCode, 503)
  } finally {
    process.env.PUBLIC_URL = publicUrl
  }

  await cleanupUser(app, registered.user.id)
})
