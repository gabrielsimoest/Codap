import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../../helper'
import { chestRandom } from '../../../src/utils/shop'
import { createChestLessons, registerShopUser, revealAllChestLessons } from '../../shopFixtures'

type App = Awaited<ReturnType<typeof build>>

/** Troca o gerador do baú por uma sequência fixa durante o teste (o último valor se repete). */
function fixRandom (t: { after: (fn: () => void) => void }, ...values: number[]) {
  const original = chestRandom.current
  let index = 0
  chestRandom.current = () => values[Math.min(index++, values.length - 1)]
  t.after(() => { chestRandom.current = original })
}

const buyChest = (app: App, headers: Record<string, string>, extra: Record<string, unknown> = {}) =>
  app.inject({ method: 'POST', url: '/shop/purchase', headers, payload: { item: 'chest', ...extra } })

/** Revela, para o usuário, todas as aulas do baú do banco exceto as informadas: só estas ficam disponíveis. */
async function leaveOnly (app: App, userId: string, keepIds: number[]) {
  const others = await app.prisma.lessons.findMany({ where: { is_chest: true, id: { notIn: keepIds } }, select: { id: true } })
  await app.prisma.user_chest_lessons.createMany({ data: others.map((l) => ({ user_id: userId, lesson_id: l.id })) })
}

test('POST /shop/purchase chest reveals an unrevealed lesson, records it once and charges 500', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 2)
  const user = await registerShopUser(app, { bits: 600 })
  fixRandom(t, 0, 0) // categoria "aula", primeira aula restante

  const res = await buyChest(app, user.headers)

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.item, 'chest')
  assert.equal(body.bits, 100)
  assert.equal(body.chest.kind, 'lesson')

  const rows = await app.prisma.user_chest_lessons.findMany({ where: { user_id: user.userId } })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].lesson_id, body.chest.lesson.id)
  const lesson = await app.prisma.lessons.findUniqueOrThrow({ where: { id: body.chest.lesson.id }, include: { module: true } })
  assert.equal(lesson.is_chest, true)
  assert.equal(body.chest.lesson.moduleId, lesson.module_id)
  assert.equal(body.chest.lesson.areaId, lesson.module.area_id)
  assert.ok(body.chest.lesson.name.length > 0)
  assert.equal((await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })).chest_misses, 0)

  await user.cleanup()
  await fixture.cleanup()
})

test('POST /shop/purchase chest names the revealed lesson in the requested locale', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 1)
  const user = await registerShopUser(app, { bits: 500 })
  await leaveOnly(app, user.userId, [fixture.lessons[0].id])
  fixRandom(t, 0, 0)

  const res = await buyChest(app, user.headers, { locale: 'en' })

  assert.equal(JSON.parse(res.payload).chest.lesson.name, fixture.lessons[0].nameEn)

  await user.cleanup()
  await fixture.cleanup()
})

test('POST /shop/purchase chest after two misses always reveals a lesson', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 1)
  const user = await registerShopUser(app, { bits: 500, chestMisses: 2 })
  fixRandom(t, 0.9) // sem a garantia, 0.9 seria o reembolso em Bits

  const res = await buyChest(app, user.headers)

  assert.equal(JSON.parse(res.payload).chest.kind, 'lesson')
  assert.equal((await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })).chest_misses, 0)

  await user.cleanup()
  await fixture.cleanup()
})

test('POST /shop/purchase chest delivers a hint, a boost or a refund, and counts a miss', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 1)

  const hintUser = await registerShopUser(app, { bits: 500 })
  fixRandom(t, 0.5)
  const hint = JSON.parse((await buyChest(app, hintUser.headers)).payload)
  assert.equal(hint.chest.kind, 'instant_hint')
  assert.equal(hint.instantHints, 1)
  assert.equal(hint.bits, 0)
  assert.equal((await app.prisma.users.findUniqueOrThrow({ where: { id: hintUser.userId } })).chest_misses, 1)

  const boostUser = await registerShopUser(app, { bits: 500 })
  fixRandom(t, 0.7)
  const boost = JSON.parse((await buyChest(app, boostUser.headers)).payload)
  assert.equal(boost.chest.kind, 'double_xp')
  assert.equal(boost.chest.endsAt, boost.doubleXpEndsAt)
  assert.equal(await app.prisma.xp_boosts.count({ where: { user_id: boostUser.userId } }), 1)

  const bitsUser = await registerShopUser(app, { bits: 500 })
  fixRandom(t, 0.9)
  const refund = JSON.parse((await buyChest(app, bitsUser.headers)).payload)
  assert.deepEqual(refund.chest, { kind: 'bits', amount: 250 })
  assert.equal(refund.bits, 250)

  await hintUser.cleanup()
  await boostUser.cleanup()
  await bitsUser.cleanup()
  await fixture.cleanup()
})

test('POST /shop/purchase chest with no lessons left never rolls a lesson', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 500, chestMisses: 9 })
  await revealAllChestLessons(app, user.userId)
  fixRandom(t, 0) // com aulas seria "aula"; sem elas é a primeira categoria restante

  const res = await buyChest(app, user.headers)

  assert.equal(res.statusCode, 200)
  assert.equal(JSON.parse(res.payload).chest.kind, 'instant_hint')

  await user.cleanup()
})

test('POST /shop/purchase chest drops a boost that starts when the active window ends', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 700 })
  const first = JSON.parse((await app.inject({ method: 'POST', url: '/shop/purchase', headers: user.headers, payload: { item: 'double_xp' } })).payload)
  await revealAllChestLessons(app, user.userId)
  fixRandom(t, 0.5) // sem aulas, os pesos são 25/20/15 de 60: 0.5 cai no dobro de XP

  const res = await buyChest(app, user.headers)

  const body = JSON.parse(res.payload)
  assert.equal(body.chest.kind, 'double_xp')
  const boosts = await app.prisma.xp_boosts.findMany({ where: { user_id: user.userId }, orderBy: { id: 'asc' } })
  assert.equal(boosts.length, 2)
  assert.equal(boosts[1].starts_at.toISOString(), first.doubleXpEndsAt)
  assert.equal(body.doubleXpEndsAt, boosts[1].ends_at.toISOString())

  await user.cleanup()
})

test('POST /shop/purchase chest rejects with 402 and charges nothing when the balance is short', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app, { bits: 499 })

  const res = await buyChest(app, user.headers)

  assert.equal(res.statusCode, 402)
  assert.equal(JSON.parse(res.payload).bits, 499)
  assert.equal(await app.prisma.user_chest_lessons.count({ where: { user_id: user.userId } }), 0)
  assert.equal((await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId } })).bits, 499)

  await user.cleanup()
})

test('two simultaneous chests never reveal the same lesson', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 2)
  const user = await registerShopUser(app, { bits: 1000, chestMisses: 2 })
  await leaveOnly(app, user.userId, fixture.lessons.map((l) => l.id))
  fixRandom(t, 0, 0)

  const [a, b] = await Promise.all([buyChest(app, user.headers), buyChest(app, user.headers)])

  assert.deepEqual([a.statusCode, b.statusCode], [200, 200])
  const revealed = (await app.prisma.user_chest_lessons.findMany({
    where: { user_id: user.userId, lesson_id: { in: fixture.lessons.map((l) => l.id) } }
  })).map((r) => r.lesson_id)
  assert.equal(new Set(revealed).size, 2)
  assert.notEqual(JSON.parse(a.payload).chest.lesson.id, JSON.parse(b.payload).chest.lesson.id)

  await user.cleanup()
  await fixture.cleanup()
})

test('GET /shop counts the chest lessons per area without naming them', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 3)
  const user = await registerShopUser(app, { bits: 0 })
  await app.prisma.user_chest_lessons.create({ data: { user_id: user.userId, lesson_id: fixture.lessons[0].id } })

  const res = await app.inject({ url: '/shop', headers: user.headers })

  const areas = JSON.parse(res.payload).chest.areas as Array<{ areaId: number, total: number, revealed: number }>
  assert.deepEqual(areas.find((a) => a.areaId === fixture.areaId), { areaId: fixture.areaId, total: 3, revealed: 1 })
  assert.ok(!res.payload.includes(fixture.lessons[0].namePt), 'o estado da loja nunca diz quais aulas existem')

  await user.cleanup()
  await fixture.cleanup()
})
