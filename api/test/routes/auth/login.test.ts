import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, outboxOf } from '../../helper'

async function registerUser (app: Awaited<ReturnType<typeof build>>, overrides: { email: string; password: string }) {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Login Test', email: overrides.email, password: overrides.password }
  })
  return JSON.parse(res.payload)
}

async function cleanupUser (app: Awaited<ReturnType<typeof build>>, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

test('POST /auth/login authenticates with correct credentials', async (t) => {
  const app = await build(t)
  const email = `login-${randomUUID()}@example.com`
  const registered = await registerUser(app, { email, password: 'senha1234' })

  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password: 'senha1234' }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.user.email, email)
  assert.equal('password' in body.user, false)
  assert.ok(body.accessToken)
  assert.ok(body.refreshToken)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/login with rememberMe: true issues a longer-lived refresh token than the default', async (t) => {
  const app = await build(t)
  const email = `login-${randomUUID()}@example.com`
  const registered = await registerUser(app, { email, password: 'senha1234' })

  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password: 'senha1234', rememberMe: true }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  const registerTtlMs = new Date(registered.refreshTokenExpiresAt).getTime() - Date.now()
  const rememberMeTtlMs = new Date(body.refreshTokenExpiresAt).getTime() - Date.now()
  assert.ok(rememberMeTtlMs > registerTtlMs)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/login rejects a wrong password with 401', async (t) => {
  const app = await build(t)
  const email = `login-${randomUUID()}@example.com`
  const registered = await registerUser(app, { email, password: 'senha1234' })

  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password: 'senhaerrada' }
  })

  assert.equal(res.statusCode, 401)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/login rejects a non-existent email with 401', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: `nobody-${randomUUID()}@example.com`, password: 'senha1234' }
  })

  assert.equal(res.statusCode, 401)
})

test('POST /auth/login rejects a body missing required fields with 400', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'no-password@example.com' }
  })

  assert.equal(res.statusCode, 400)
})

test('POST /auth/login sends the welcome email on the first login only', async (t) => {
  const app = await build(t)
  const email = `welcome-${randomUUID()}@example.com`
  const registered = await registerUser(app, { email, password: 'senha1234' })
  await app.mailer.flush()
  // O cadastro manda só a confirmação de e-mail; a boas-vindas espera o login.
  assert.equal(outboxOf(app).length, 1)
  assert.match(outboxOf(app)[0].subject, /Confirme seu e-mail/)

  const first = await app.inject({ method: 'POST', url: '/auth/login', payload: { email, password: 'senha1234' } })
  assert.equal(first.statusCode, 200)
  await app.mailer.flush()
  assert.equal(outboxOf(app).length, 2)
  assert.equal(outboxOf(app)[1].to, email)
  assert.match(outboxOf(app)[1].subject, /Bem-vindo/)

  const second = await app.inject({ method: 'POST', url: '/auth/login', payload: { email, password: 'senha1234' } })
  assert.equal(second.statusCode, 200)
  await app.mailer.flush()
  assert.equal(outboxOf(app).length, 2)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/login sends a single welcome email when two first logins race', async (t) => {
  const app = await build(t)
  const email = `welcome-race-${randomUUID()}@example.com`
  const registered = await registerUser(app, { email, password: 'senha1234' })

  await Promise.all([
    app.inject({ method: 'POST', url: '/auth/login', payload: { email, password: 'senha1234' } }),
    app.inject({ method: 'POST', url: '/auth/login', payload: { email, password: 'senha1234' } })
  ])
  await app.mailer.flush()

  const welcomes = outboxOf(app).filter((message) => /Bem-vindo/.test(message.subject))
  assert.equal(welcomes.length, 1)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/login does not send a welcome email when the credentials are wrong', async (t) => {
  const app = await build(t)
  const email = `welcome-wrong-${randomUUID()}@example.com`
  const registered = await registerUser(app, { email, password: 'senha1234' })

  const res = await app.inject({ method: 'POST', url: '/auth/login', payload: { email, password: 'errada123' } })
  await app.mailer.flush()

  assert.equal(res.statusCode, 401)
  assert.equal(outboxOf(app).filter((message) => /Bem-vindo/.test(message.subject)).length, 0)

  await cleanupUser(app, registered.user.id)
})
