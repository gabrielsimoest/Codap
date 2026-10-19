import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../../helper'
import { registerShopUser } from '../../shopFixtures'

const FIVE_MINUTES_MS = 5 * 60 * 1000

test('GET /shop requires authentication', async (t) => {
  const app = await build(t)

  const res = await app.inject({ url: '/shop' })

  assert.equal(res.statusCode, 401)
})

test('GET /shop returns the prices, the balance, the hints and no boost', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 120 })

  const res = await app.inject({ url: '/shop', headers: user.headers })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body.prices, { double_xp: 200, instant_hint: 300, chest: 500 })
  assert.equal(body.bits, 120)
  assert.equal(body.instantHints, 0)
  assert.strictEqual(body.doubleXpEndsAt, null)
  assert.equal(body.chest.missesInARow, 0)
  assert.ok(Array.isArray(body.chest.areas))

  await user.cleanup()
})

test('GET /shop treats a null balance as zero', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: null })

  const res = await app.inject({ url: '/shop', headers: user.headers })

  assert.equal(JSON.parse(res.payload).bits, 0)

  await user.cleanup()
})

test('POST /shop/purchase requires authentication', async (t) => {
  const app = await build(t)

  const res = await app.inject({ method: 'POST', url: '/shop/purchase', payload: { item: 'instant_hint' } })

  assert.equal(res.statusCode, 401)
})

test('POST /shop/purchase instant_hint charges 300 and adds one hint', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 350 })

  const res = await app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'instant_hint' } })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.item, 'instant_hint')
  assert.equal(body.bits, 50)
  assert.equal(body.instantHints, 1)

  const row = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(row.bits, 50)
  assert.equal(row.instant_hints, 1)

  await user.cleanup()
})

test('POST /shop/purchase double_xp charges 200 and opens a 5-minute window', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 250 })
  const before = Date.now()

  const res = await app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'double_xp' } })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.bits, 50)
  const endsAt = new Date(body.doubleXpEndsAt).getTime()
  assert.ok(Math.abs(endsAt - (before + FIVE_MINUTES_MS)) < 30_000, 'o fim da janela deve ficar ~5 minutos à frente')

  const boosts = await app.prisma.xp_boosts.findMany({ where: { user_id: user.userId } })
  assert.equal(boosts.length, 1)
  assert.equal(boosts[0].ends_at.getTime() - boosts[0].starts_at.getTime(), FIVE_MINUTES_MS)

  const state = JSON.parse((await app.inject({ url: '/shop', headers: user.headers })).payload)
  assert.equal(state.doubleXpEndsAt, body.doubleXpEndsAt)

  await user.cleanup()
})

test('POST /shop/purchase rejects with 402 and charges nothing when the balance is short', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 100 })

  const res = await app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'instant_hint' } })

  assert.equal(res.statusCode, 402)
  const body = JSON.parse(res.payload)
  assert.equal(body.message, 'insufficient_bits')
  assert.equal(body.bits, 100)

  const row = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(row.bits, 100)
  assert.equal(row.instant_hints, 0)

  await user.cleanup()
})

test('POST /shop/purchase double_xp while a window is active is 409 and charges nothing', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 450 })

  const first = await app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'double_xp' } })
  assert.equal(first.statusCode, 200)
  const second = await app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'double_xp' } })

  assert.equal(second.statusCode, 409)
  assert.equal(JSON.parse(second.payload).message, 'boost_active')
  const row = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(row.bits, 250)
  assert.equal(await app.prisma.xp_boosts.count({ where: { user_id: user.userId } }), 1)

  await user.cleanup()
})

test('POST /shop/purchase with an unknown item is 400', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 1000 })

  const res = await app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'unicorn' } })

  assert.equal(res.statusCode, 400)

  await user.cleanup()
})

test('two simultaneous purchases never spend the same balance', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 300 })

  const [a, b] = await Promise.all([
    app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'instant_hint' } }),
    app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'instant_hint' } })
  ])

  assert.deepEqual([a.statusCode, b.statusCode].sort(), [200, 402])
  const row = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })
  assert.equal(row.bits, 0)
  assert.equal(row.instant_hints, 1)

  await user.cleanup()
})

test('POST /shop/use-hint requires authentication', async (t) => {
  const app = await build(t)

  const res = await app.inject({ method: 'POST', url: '/shop/use-hint' })

  assert.equal(res.statusCode, 401)
})

test('POST /shop/use-hint spends one hint and is 409 when there are none', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { instantHints: 2 })
  const use = () => app.inject({ method: 'POST', url: '/shop/use-hint', headers: user.headers })

  const first = await use()
  assert.equal(first.statusCode, 200)
  assert.equal(JSON.parse(first.payload).instantHints, 1)
  const second = await use()
  assert.equal(JSON.parse(second.payload).instantHints, 0)

  const third = await use()
  assert.equal(third.statusCode, 409)
  assert.equal(JSON.parse(third.payload).message, 'no_hints')
  assert.equal((await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })).instant_hints, 0)

  await user.cleanup()
})
