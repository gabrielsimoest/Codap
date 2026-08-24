import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

async function cleanupUser (app: Awaited<ReturnType<typeof build>>, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

test('POST /auth/register creates a user and returns an authenticated session', async (t) => {
  const app = await build(t)
  const email = `register-${randomUUID()}@example.com`

  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Register Test', email, password: 'senha1234' }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.user.email, email)
  assert.equal('password' in body.user, false)
  assert.ok(body.accessToken)
  assert.ok(body.refreshToken)
  assert.ok(body.accessTokenExpiresAt)
  assert.ok(body.refreshTokenExpiresAt)

  await cleanupUser(app, body.user.id)
})

test('POST /auth/register with rememberMe: true issues a longer-lived refresh token than the default', async (t) => {
  const app = await build(t)

  const shortEmail = `register-${randomUUID()}@example.com`
  const shortRes = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Short Session', email: shortEmail, password: 'senha1234' }
  })
  const shortBody = JSON.parse(shortRes.payload)

  const longEmail = `register-${randomUUID()}@example.com`
  const longRes = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Long Session', email: longEmail, password: 'senha1234', rememberMe: true }
  })
  const longBody = JSON.parse(longRes.payload)

  const shortTtlMs = new Date(shortBody.refreshTokenExpiresAt).getTime() - Date.now()
  const longTtlMs = new Date(longBody.refreshTokenExpiresAt).getTime() - Date.now()
  assert.ok(longTtlMs > shortTtlMs)

  await cleanupUser(app, shortBody.user.id)
  await cleanupUser(app, longBody.user.id)
})

test('POST /auth/register rejects a duplicate email with 409', async (t) => {
  const app = await build(t)
  const email = `register-${randomUUID()}@example.com`

  const first = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'First', email, password: 'senha1234' }
  })
  assert.equal(first.statusCode, 201)
  const created = JSON.parse(first.payload)

  const second = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Second', email, password: 'outrasenha' }
  })
  assert.equal(second.statusCode, 409)

  await cleanupUser(app, created.user.id)
})

test('POST /auth/register rejects a body missing required fields with 400', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'No email or password' }
  })

  assert.equal(res.statusCode, 400)
})

test('POST /auth/register rejects a password shorter than 8 characters with 400', async (t) => {
  const app = await build(t)
  const email = `register-${randomUUID()}@example.com`

  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Short Password', email, password: '123' }
  })

  assert.equal(res.statusCode, 400)
})
