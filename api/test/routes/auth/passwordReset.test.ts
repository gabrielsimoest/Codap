import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, outboxOf } from '../../helper'

type App = Awaited<ReturnType<typeof build>>

/** Cadastra uma conta e, por padrão, já confirma o e-mail (a regra: sem confirmação não há link de senha). */
async function registerUser (app: App, options: { confirmed?: boolean } = {}) {
  const email = `reset-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Reset Test', email, password: 'senha1234' }
  })
  assert.equal(res.statusCode, 201)
  await app.mailer.flush()
  const body = JSON.parse(res.payload)
  if (options.confirmed ?? true) {
    await app.prisma.users.update({ where: { id: body.user.id }, data: { email_verified_at: new Date() } })
  }
  return { email, ...body }
}

async function cleanupUser (app: App, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

function tokenFrom (text: string | undefined): string {
  const match = /token=([^\s&]+)/.exec(text ?? '')
  assert.ok(match, 'o e-mail deveria trazer um link com token')
  return decodeURIComponent(match[1])
}

/** Pede a redefinição e devolve o token do e-mail mais recente. */
async function requestReset (app: App, email: string): Promise<string> {
  const res = await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email } })
  assert.equal(res.statusCode, 200)
  await app.mailer.flush()
  return tokenFrom(outboxOf(app).at(-1)?.text)
}

test('POST /auth/forgot-password emails a reset link to a confirmed account', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  await requestReset(app, registered.email)

  const outbox = outboxOf(app)
  assert.equal(outbox.length, 2) // 1 = confirmação do cadastro
  assert.equal(outbox[1].to, registered.email)
  assert.match(outbox[1].subject, /Redefina sua senha/)
  assert.match(outbox[1].text, /\/auth\/reset-password\?token=/)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/forgot-password sends nothing when the email is not confirmed, answering the same', async (t) => {
  const app = await build(t)
  const unconfirmed = await registerUser(app, { confirmed: false })
  const confirmed = await registerUser(app)

  const forUnconfirmed = await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: unconfirmed.email } })
  const forConfirmed = await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: confirmed.email } })
  await app.mailer.flush()

  assert.equal(forUnconfirmed.statusCode, 200)
  assert.equal(forUnconfirmed.payload, forConfirmed.payload) // não revela quem está confirmado
  const resets = outboxOf(app).filter((message) => /Redefina sua senha/.test(message.subject))
  assert.equal(resets.length, 1)
  assert.equal(resets[0].to, confirmed.email)
  assert.equal(await app.prisma.auth_tokens.count({ where: { user_id: unconfirmed.user.id, type: 'password_reset' } }), 0)

  await cleanupUser(app, unconfirmed.user.id)
  await cleanupUser(app, confirmed.user.id)
})

test('POST /auth/forgot-password answers the same for an unknown email and sends nothing', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const known = await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: registered.email } })
  const unknown = await app.inject({
    method: 'POST',
    url: '/auth/forgot-password',
    payload: { email: `ninguem-${randomUUID()}@example.com` }
  })
  await app.mailer.flush()

  assert.equal(known.statusCode, 200)
  assert.equal(unknown.statusCode, 200)
  assert.equal(unknown.payload, known.payload)
  assert.equal(outboxOf(app).length, 2) // cadastro + o da conta existente; nada para a inexistente

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/forgot-password sends a second email only after the cooldown', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  await requestReset(app, registered.email)
  const repeated = await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: registered.email } })
  await app.mailer.flush()
  assert.equal(repeated.statusCode, 200) // não revela o intervalo
  assert.equal(outboxOf(app).length, 2)

  await app.prisma.auth_tokens.updateMany({
    where: { user_id: registered.user.id, type: 'password_reset' },
    data: { created_at: new Date(Date.now() - 2 * 60 * 1000) }
  })
  await requestReset(app, registered.email)
  assert.equal(outboxOf(app).length, 3)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/forgot-password rejects an invalid email with 400', async (t) => {
  const app = await build(t)

  const missing = await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: {} })
  const malformed = await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: 'nao-e-email' } })

  assert.equal(missing.statusCode, 400)
  assert.equal(malformed.statusCode, 400)
})

test('POST /auth/reset-password changes the password, ends every session and warns the account by email', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = await requestReset(app, registered.email)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/reset-password',
    payload: { token, password: 'novaSenha99' }
  })
  assert.equal(res.statusCode, 200)
  await app.mailer.flush()

  const notice = outboxOf(app).at(-1)
  assert.equal(notice?.to, registered.email)
  assert.match(notice?.subject ?? '', /senha .* alterada/)

  const oldPassword = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: registered.email, password: 'senha1234' }
  })
  assert.equal(oldPassword.statusCode, 401)

  const newPassword = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: registered.email, password: 'novaSenha99' }
  })
  assert.equal(newPassword.statusCode, 200)

  // O refresh token da sessão antiga morreu junto com a senha.
  const refresh = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: registered.refreshToken }
  })
  assert.equal(refresh.statusCode, 401)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/reset-password does not confirm the email as a side effect', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = await requestReset(app, registered.email)
  const before = await app.prisma.users.findUnique({ where: { id: registered.user.id } })

  await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'novaSenha99' } })

  const after = await app.prisma.users.findUnique({ where: { id: registered.user.id } })
  assert.deepEqual(after?.email_verified_at, before?.email_verified_at)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/reset-password rejects a token whose account is no longer confirmed', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = await requestReset(app, registered.email)
  await app.prisma.users.update({ where: { id: registered.user.id }, data: { email_verified_at: null } })

  const res = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'novaSenha99' } })
  assert.equal(res.statusCode, 400)

  const login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: registered.email, password: 'senha1234' }
  })
  assert.equal(login.statusCode, 200) // a senha não mudou

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/reset-password rejects a token that was already used', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = await requestReset(app, registered.email)

  const first = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'novaSenha99' } })
  assert.equal(first.statusCode, 200)
  const second = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'outraSenha1' } })
  assert.equal(second.statusCode, 400)

  const login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: registered.email, password: 'novaSenha99' }
  })
  assert.equal(login.statusCode, 200)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/reset-password uses a token only once even with two simultaneous requests', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = await requestReset(app, registered.email)

  const [a, b] = await Promise.all([
    app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'senhaUm1234' } }),
    app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'senhaDois123' } })
  ])
  assert.deepEqual([a.statusCode, b.statusCode].sort(), [200, 400])

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/reset-password rejects unknown, expired and wrong-type tokens with 400', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const verificationToken = tokenFrom(outboxOf(app)[0].text)
  const token = await requestReset(app, registered.email)

  const unknown = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token: 'nao-existe', password: 'novaSenha99' } })
  assert.equal(unknown.statusCode, 400)
  assert.match(JSON.parse(unknown.payload).message, /inválido/)

  // Um token de confirmação de e-mail não redefine senha.
  const wrongType = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token: verificationToken, password: 'novaSenha99' } })
  assert.equal(wrongType.statusCode, 400)

  await app.prisma.auth_tokens.updateMany({
    where: { user_id: registered.user.id, type: 'password_reset' },
    data: { expires_at: new Date(Date.now() - 1000) }
  })
  const expired = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'novaSenha99' } })
  assert.equal(expired.statusCode, 400)

  // Nada disso mexeu na senha.
  const login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: registered.email, password: 'senha1234' }
  })
  assert.equal(login.statusCode, 200)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/reset-password rejects a short password or a missing field with 400 and keeps the token valid', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const token = await requestReset(app, registered.email)

  const short = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: '123' } })
  const noToken = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { password: 'novaSenha99' } })
  assert.equal(short.statusCode, 400)
  assert.equal(noToken.statusCode, 400)

  const ok = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { token, password: 'novaSenha99' } })
  assert.equal(ok.statusCode, 200)

  await cleanupUser(app, registered.user.id)
})

test('GET /auth/reset-password serves the new-password page', async (t) => {
  const app = await build(t)

  const res = await app.inject({ method: 'GET', url: '/auth/reset-password?token=qualquer' })
  assert.equal(res.statusCode, 200)
  assert.match(String(res.headers['content-type']), /text\/html/)
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.equal(res.headers['referrer-policy'], 'no-referrer')
  assert.ok(res.payload.includes('type="password"'))
  assert.equal(res.payload.includes('qualquer'), false)
})

test('POST /auth/request-password-change requires authentication', async (t) => {
  const app = await build(t)
  const res = await app.inject({ method: 'POST', url: '/auth/request-password-change' })
  assert.equal(res.statusCode, 401)
})

test('POST /auth/request-password-change refuses an unconfirmed account with 403 and sends nothing', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app, { confirmed: false })

  const res = await app.inject({
    method: 'POST',
    url: '/auth/request-password-change',
    headers: { authorization: `Bearer ${registered.accessToken}` }
  })
  await app.mailer.flush()

  assert.equal(res.statusCode, 403)
  assert.match(JSON.parse(res.payload).message, /Confirme seu e-mail/)
  assert.equal(outboxOf(app).filter((message) => /Redefina sua senha/.test(message.subject)).length, 0)
  assert.equal(await app.prisma.auth_tokens.count({ where: { user_id: registered.user.id, type: 'password_reset' } }), 0)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/request-password-change emails the account its own link, which then changes the password', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const auth = { authorization: `Bearer ${registered.accessToken}` }

  const res = await app.inject({ method: 'POST', url: '/auth/request-password-change', headers: auth })
  assert.equal(res.statusCode, 200)
  await app.mailer.flush()

  const mail = outboxOf(app).at(-1)
  assert.equal(mail?.to, registered.email)
  assert.match(mail?.subject ?? '', /Redefina sua senha/)

  // Pedir de novo dentro do intervalo é 429 (a pessoa está autenticada, então não há o que vazar).
  const early = await app.inject({ method: 'POST', url: '/auth/request-password-change', headers: auth })
  assert.equal(early.statusCode, 429)

  const reset = await app.inject({
    method: 'POST',
    url: '/auth/reset-password',
    payload: { token: tokenFrom(mail?.text), password: 'novaSenha99' }
  })
  assert.equal(reset.statusCode, 200)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/request-password-change answers 503 when the email cannot be prepared', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  // Sem PUBLIC_URL (fora de desenvolvimento) não há como montar o link.
  const publicUrl = process.env.PUBLIC_URL
  delete process.env.PUBLIC_URL
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/request-password-change',
      headers: { authorization: `Bearer ${registered.accessToken}` }
    })
    assert.equal(res.statusCode, 503)
  } finally {
    process.env.PUBLIC_URL = publicUrl
  }
  assert.equal(await app.prisma.auth_tokens.count({ where: { user_id: registered.user.id, type: 'password_reset' } }), 0)

  await cleanupUser(app, registered.user.id)
})
