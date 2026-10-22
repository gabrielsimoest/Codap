import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

type App = Awaited<ReturnType<typeof build>>

async function registerUser (app: App) {
  const email = `me-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Me Test', email, password: 'senha1234' }
  })
  assert.equal(res.statusCode, 201)
  return { email, ...JSON.parse(res.payload) }
}

async function cleanupUser (app: App, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

test('GET /auth/me requires authentication', async (t) => {
  const app = await build(t)

  const missing = await app.inject({ method: 'GET', url: '/auth/me' })
  const invalid = await app.inject({ method: 'GET', url: '/auth/me', headers: { authorization: 'Bearer token-invalido' } })

  assert.equal(missing.statusCode, 401)
  assert.equal(invalid.statusCode, 401)
})

test('GET /auth/me returns the account, with the email unconfirmed until it is confirmed', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)
  const auth = { authorization: `Bearer ${registered.accessToken}` }

  const before = await app.inject({ method: 'GET', url: '/auth/me', headers: auth })
  assert.equal(before.statusCode, 200)
  const body = JSON.parse(before.payload)
  assert.equal(body.user.id, registered.user.id)
  assert.equal(body.user.email, registered.email)
  assert.equal(body.user.email_verified_at, null)
  assert.equal('password' in body.user, false)

  // A confirmação acontece no navegador: o app só a vê relendo `/auth/me`.
  await app.prisma.users.update({ where: { id: registered.user.id }, data: { email_verified_at: new Date() } })
  const after = await app.inject({ method: 'GET', url: '/auth/me', headers: auth })
  assert.ok(JSON.parse(after.payload).user.email_verified_at)

  await cleanupUser(app, registered.user.id)
})
