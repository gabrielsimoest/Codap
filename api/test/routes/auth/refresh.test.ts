import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID, createHash } from 'node:crypto'
import { build } from '../../helper'
import { createSession, RefreshTokenAlreadyRotatedError } from '../../../src/utils/session'

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

test('POST /auth/refresh with the same token concurrently never leaves two valid tokens in the family', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  const responses = await Promise.all([1, 2].map(() => app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: { refreshToken: registered.refreshToken }
  })))

  // Sobrepostas ou em sequência, o resultado é o mesmo: uma rotaciona e a
  // outra é tratada como reuso, o que revoga a família inteira.
  const statusCodes = responses.map((res) => res.statusCode).sort()
  assert.deepEqual(statusCodes, [200, 401])

  const activeTokens = await app.prisma.refresh_tokens.count({
    where: { user_id: registered.user.id, revoked_at: null }
  })
  assert.equal(activeTokens, 0)

  await cleanupUser(app, registered.user.id)
})

test('createSession refuses to rotate a token that was already revoked and creates nothing', async (t) => {
  const app = await build(t)
  const registered = await registerUser(app)

  // Estado em que a requisição perdedora da corrida chega à transação: o
  // token passou pela checagem de `revoked_at` em refresh.ts, mas outra
  // rotação o revogou antes.
  const tokenHash = createHash('sha256').update(registered.refreshToken).digest('hex')
  const token = await app.prisma.refresh_tokens.update({
    where: { token_hash: tokenHash },
    data: { revoked_at: new Date() }
  })

  await assert.rejects(
    createSession(app, registered.user.id, false, { familyId: token.family_id, supersedesTokenId: token.id }),
    RefreshTokenAlreadyRotatedError
  )

  // A transação foi desfeita: nenhum token novo na família.
  const familyTokens = await app.prisma.refresh_tokens.count({ where: { family_id: token.family_id } })
  assert.equal(familyTokens, 1)

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
