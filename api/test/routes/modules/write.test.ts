import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, useDevelopmentEnv } from '../../helper'
import { scratchArea } from '../../contentFixtures'

test('POST /modules creates a module with both translations', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/modules',
    payload: {
      areaId: area.id,
      translations: {
        pt: { name: 'Módulo 1', subtitle: 'Conceitos' },
        en: { name: 'Module 1', subtitle: 'Concepts' }
      }
    }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.areaId, area.id)
  assert.equal(body.index, 0)
  assert.deepEqual(body.translations.pt, { name: 'Módulo 1', subtitle: 'Conceitos' })
  assert.deepEqual(body.translations.en, { name: 'Module 1', subtitle: 'Concepts' })
})

test('POST /modules accepts a single locale and omits the missing one', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/modules',
    payload: { areaId: area.id, translations: { pt: { name: 'Só português' } } }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.translations.pt.name, 'Só português')
  assert.equal(body.translations.pt.subtitle, null)
  assert.ok(!('en' in body.translations), 'a missing locale must be absent, not empty')
})

test('POST /modules appends to the end when index is omitted', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  await app.prisma.modules.create({ data: { area_id: area.id, index: 1 } })

  const res = await app.inject({
    method: 'POST',
    url: '/modules',
    payload: { areaId: area.id, translations: { pt: { name: 'Terceiro' } } }
  })

  assert.equal(res.statusCode, 201)
  assert.equal(JSON.parse(res.payload).index, 2)
})

test('POST /modules returns 404 for an unknown area', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/modules',
    payload: { areaId: 2147483647, translations: { pt: { name: 'x' } } }
  })
  assert.equal(res.statusCode, 404)
})

test('POST /modules rejects an empty translations map with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/modules',
    payload: { areaId: area.id, translations: {} }
  })
  assert.equal(res.statusCode, 400)
})

test('PATCH /modules/:id updates one locale without touching the other', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const created = await app.inject({
    method: 'POST',
    url: '/modules',
    payload: {
      areaId: area.id,
      translations: { pt: { name: 'Antigo' }, en: { name: 'Old' } }
    }
  })
  const moduleId = JSON.parse(created.payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: `/modules/${moduleId}`,
    payload: { translations: { pt: { name: 'Novo', subtitle: 'Sub' } } }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body.translations.pt, { name: 'Novo', subtitle: 'Sub' })
  assert.equal(body.translations.en.name, 'Old', 'the untouched locale must survive')
})

test('PATCH /modules/:id returns 404 for an unknown module', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({
    method: 'PATCH',
    url: '/modules/2147483647',
    payload: { translations: { pt: { name: 'x' } } }
  })
  assert.equal(res.statusCode, 404)
})

test('DELETE /modules/:id cascades to lessons, activities and translations', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const locale = await app.prisma.locales.findFirst({ where: { locale: 'pt' } })
  assert.ok(locale)

  const module = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  await app.prisma.module_translations.create({
    data: { module_id: module.id, locale_id: locale.id, name: 'Módulo 1' }
  })
  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.create({
    data: { activity_id: activity.id, locale_id: locale.id, content: { firstParagraph: 'x' } }
  })

  const res = await app.inject({ method: 'DELETE', url: `/modules/${module.id}` })
  assert.equal(res.statusCode, 204)

  assert.equal(await app.prisma.modules.count({ where: { id: module.id } }), 0)
  assert.equal(await app.prisma.module_translations.count({ where: { module_id: module.id } }), 0)
  assert.equal(await app.prisma.lessons.count({ where: { id: lesson.id } }), 0)
  assert.equal(await app.prisma.activities.count({ where: { id: activity.id } }), 0)
  assert.equal(await app.prisma.activity_translations.count({ where: { activity_id: activity.id } }), 0)
  // A área continua de pé: a cascata sobe até o módulo, nunca além.
  assert.equal(await app.prisma.areas.count({ where: { id: area.id } }), 1)
})

test('DELETE /modules/:id refuses with 409 when a lesson has user progress', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const module = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  const user = await app.prisma.users.create({
    data: { name: 'Progress User', email: `${randomUUID()}@test.dev`, password: 'x' }
  })
  await app.prisma.user_lessons.create({
    data: { user_id: user.id, lesson_id: lesson.id, completed_at: new Date() }
  })

  t.after(async () => {
    await app.prisma.users.deleteMany({ where: { id: user.id } })
  })

  const res = await app.inject({ method: 'DELETE', url: `/modules/${module.id}` })
  assert.equal(res.statusCode, 409)
  assert.equal(await app.prisma.modules.count({ where: { id: module.id } }), 1)
})

test('PATCH /modules/reorder renumbers indexes to 0..n-1', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const first = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  const second = await app.prisma.modules.create({ data: { area_id: area.id, index: 1 } })
  const third = await app.prisma.modules.create({ data: { area_id: area.id, index: 2 } })

  const res = await app.inject({
    method: 'PATCH',
    url: '/modules/reorder',
    payload: { areaId: area.id, orderedIds: [third.id, first.id, second.id] }
  })
  assert.equal(res.statusCode, 204)

  const reordered = await app.prisma.modules.findMany({
    where: { area_id: area.id },
    select: { id: true, index: true },
    orderBy: { index: 'asc' }
  })
  assert.deepEqual(reordered.map((m) => m.id), [third.id, first.id, second.id])
  assert.deepEqual(reordered.map((m) => m.index), [0, 1, 2])
})

test('PATCH /modules/reorder rejects a partial id set with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const first = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  await app.prisma.modules.create({ data: { area_id: area.id, index: 1 } })

  const res = await app.inject({
    method: 'PATCH',
    url: '/modules/reorder',
    payload: { areaId: area.id, orderedIds: [first.id] }
  })
  assert.equal(res.statusCode, 400)
})

test('PATCH /modules/reorder rejects duplicated ids with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const area = await scratchArea(app, t)

  const first = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  await app.prisma.modules.create({ data: { area_id: area.id, index: 1 } })

  const res = await app.inject({
    method: 'PATCH',
    url: '/modules/reorder',
    payload: { areaId: area.id, orderedIds: [first.id, first.id] }
  })
  assert.equal(res.statusCode, 400)
})

test('module write routes are not registered outside of development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'test'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)

  const created = await app.inject({
    method: 'POST',
    url: '/modules',
    payload: { areaId: 1, translations: { pt: { name: 'x' } } }
  })
  assert.equal(created.statusCode, 404)

  const reordered = await app.inject({
    method: 'PATCH',
    url: '/modules/reorder',
    payload: { areaId: 1, orderedIds: [] }
  })
  assert.equal(reordered.statusCode, 404)

  const removed = await app.inject({ method: 'DELETE', url: '/modules/1' })
  assert.equal(removed.statusCode, 404)
})
