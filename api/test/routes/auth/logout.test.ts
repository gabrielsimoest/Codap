import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

async function registerUser (app: Awaited<ReturnType<typeof build>>) {
  const email = `logout-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Logout Test', email, password: 'senha1234' }
  })
  return JSON.parse(res.payload)
}

async function cleanupUser (app: Awaited<ReturnType<typeof build>>, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

test('POST /auth/logout revokes the refresh token, blocking further refresh attempts', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const logoutRes = await app.inject({
    method: 'POST',
    url: '/auth/logout',
    payload: { refreshToken: registered.refreshToken }
  })
  assert.equal(logoutRes.statusCode, 204)

  const refreshAttempt = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: registered.refreshToken }
  })
  assert.equal(refreshAttempt.statusCode, 401)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/logout is idempotent — calling it twice still returns 204', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const first = await app.inject({ method: 'POST', url: '/auth/logout', payload: { refreshToken: registered.refreshToken } })
  const second = await app.inject({ method: 'POST', url: '/auth/logout', payload: { refreshToken: registered.refreshToken } })
  assert.equal(first.statusCode, 204)
  assert.equal(second.statusCode, 204)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/logout with a token that never existed still returns 204', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/logout',
    payload: { refreshToken: 'never-existed-token' }
  })

  assert.equal(res.statusCode, 204)
})

test('POST /auth/logout rejects a body missing refreshToken with 400', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/logout',
    payload: {}
  })

  assert.equal(res.statusCode, 400)
})
