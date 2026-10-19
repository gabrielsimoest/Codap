import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../../helper'
import { createChestLessons, registerShopUser } from '../../shopFixtures'

test('GET /collection requires authentication', async (t) => {
  const app = await build(t)

  const res = await app.inject({ url: '/collection?locale=pt' })

  assert.equal(res.statusCode, 401)
})

test('GET /collection requires a valid locale', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app)

  assert.equal((await app.inject({ url: '/collection', headers: user.headers })).statusCode, 400)
  assert.equal((await app.inject({ url: '/collection?locale=fr', headers: user.headers })).statusCode, 400)

  await user.cleanup()
})

test('GET /collection is empty before any lesson is revealed', async (t) => {
  const app = await build(t)
  const user = await registerShopUser(app)

  const res = await app.inject({ url: '/collection?locale=pt', headers: user.headers })

  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload), { lessons: [] })

  await user.cleanup()
})

test('GET /collection returns only the revealed lessons, translated, with their activities', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 2)
  const user = await registerShopUser(app)
  await app.prisma.user_chest_lessons.create({ data: { user_id: user.userId, lesson_id: fixture.lessons[0].id } })

  const pt = JSON.parse((await app.inject({ url: '/collection?locale=pt', headers: user.headers })).payload)
  const en = JSON.parse((await app.inject({ url: '/collection?locale=en', headers: user.headers })).payload)

  assert.equal(pt.lessons.length, 1)
  const lesson = pt.lessons[0]
  assert.equal(lesson.id, fixture.lessons[0].id)
  assert.equal(lesson.name, fixture.lessons[0].namePt)
  assert.equal(lesson.moduleId, fixture.moduleId)
  assert.equal(lesson.areaId, fixture.areaId)
  assert.equal(lesson.chest, true)
  assert.strictEqual(lesson.minLevel, null)
  assert.equal(lesson.xpReward, 50)
  assert.equal(lesson.activities.length, 1)
  assert.equal(lesson.activities[0].type, 'theory')
  assert.equal(lesson.activities[0].content.firstParagraph, 'Texto pt')
  assert.equal(en.lessons[0].name, fixture.lessons[0].nameEn)
  assert.equal(en.lessons[0].activities[0].content.firstParagraph, 'Text en')
  assert.ok(!JSON.stringify(pt).includes(fixture.lessons[1].namePt), 'a aula não revelada nunca aparece')

  await user.cleanup()
  await fixture.cleanup()
})

test('GET /collection never shows what another user revealed', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 1)
  const owner = await registerShopUser(app)
  const other = await registerShopUser(app)
  await app.prisma.user_chest_lessons.create({ data: { user_id: owner.userId, lesson_id: fixture.lessons[0].id } })

  const res = await app.inject({ url: '/collection?locale=pt', headers: other.headers })

  assert.deepEqual(JSON.parse(res.payload), { lessons: [] })

  await owner.cleanup()
  await other.cleanup()
  await fixture.cleanup()
})

test('GET /collection leaves out a revealed lesson that went back to the main track', async (t) => {
  const app = await build(t)
  const fixture = await createChestLessons(app, 1)
  const user = await registerShopUser(app)
  await app.prisma.user_chest_lessons.create({ data: { user_id: user.userId, lesson_id: fixture.lessons[0].id } })
  await app.prisma.lessons.update({ where: { id: fixture.lessons[0].id }, data: { is_chest: false } })

  const res = await app.inject({ url: '/collection?locale=pt', headers: user.headers })

  assert.deepEqual(JSON.parse(res.payload), { lessons: [] })

  await user.cleanup()
  await fixture.cleanup()
})
