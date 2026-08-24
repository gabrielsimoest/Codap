import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID, createHash } from 'node:crypto'
import { build } from '../../helper'

async function registerUser (app: Awaited<ReturnType<typeof build>>) {
  const email = `refresh-${randomUUID()}@example.com`
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Refresh Test', email, password: 'senha1234' }
  })
  return JSON.parse(res.payload)
}

async function cleanupUser (app: Awaited<ReturnType<typeof build>>, userId: string) {
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
  await app.prisma.users.delete({ where: { id: userId } })
}

test('POST /auth/refresh rotates the token pair and revokes the previous refresh token', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: registered.refreshToken }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.ok(body.accessToken)
  assert.ok(body.refreshToken)
  assert.notEqual(body.refreshToken, registered.refreshToken)

  const oldTokenHash = createHash('sha256').update(registered.refreshToken).digest('hex')
  const oldToken = await app.prisma.refresh_tokens.findUnique({ where: { token_hash: oldTokenHash } })
  assert.ok(oldToken?.revoked_at)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/refresh reusing an already-rotated token revokes the whole family and rejects further use', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const firstRefresh = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: registered.refreshToken }
  })
  assert.equal(firstRefresh.statusCode, 200)
  const rotated = JSON.parse(firstRefresh.payload)

  // Reusing the original (now-revoked) token is a reuse/replay signal.
  const reuseAttempt = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: registered.refreshToken }
  })
  assert.equal(reuseAttempt.statusCode, 401)

  // The whole family — including the token issued by the legitimate first refresh — must now be revoked.
  const followUp = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: rotated.refreshToken }
  })
  assert.equal(followUp.statusCode, 401)

  await cleanupUser(app, registered.user.id)
})

test('POST /auth/refresh rejects an unknown token with 401', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: 'not-a-real-token' }
  })

  assert.equal(res.statusCode, 401)
})

test('POST /auth/refresh rejects a body missing refreshToken with 400', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: {}
  })

  assert.equal(res.statusCode, 400)
})
