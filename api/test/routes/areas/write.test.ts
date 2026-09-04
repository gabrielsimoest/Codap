import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, useDevelopmentEnv } from '../../helper'

test('POST /areas creates an area', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const name = `Test Area ${randomUUID()}`
  const createdIds: number[] = []
  t.after(async () => {
    await app.prisma.areas.deleteMany({ where: { id: { in: createdIds } } })
  })

  const res = await app.inject({ method: 'POST', url: '/areas', payload: { name } })
  assert.equal(res.statusCode, 201)

  const body = JSON.parse(res.payload)
  createdIds.push(body.id)
  assert.equal(body.name, name)
  assert.deepEqual(Object.keys(body).sort(), ['id', 'name'])
})

test('POST /areas rejects a duplicate name with 409', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const name = `Test Area ${randomUUID()}`
  const area = await app.prisma.areas.create({ data: { name } })
  t.after(async () => {
    await app.prisma.areas.delete({ where: { id: area.id } })
  })

  const res = await app.inject({ method: 'POST', url: '/areas', payload: { name } })
  assert.equal(res.statusCode, 409)
})

test('POST /areas rejects an empty name with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({ method: 'POST', url: '/areas', payload: { name: '' } })
  assert.equal(res.statusCode, 400)
})

test('PATCH /areas/:id updates the name', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const area = await app.prisma.areas.create({ data: { name: `Test Area ${randomUUID()}` } })
  t.after(async () => {
    await app.prisma.areas.delete({ where: { id: area.id } })
  })

  const name = `Renamed ${randomUUID()}`
  const res = await app.inject({ method: 'PATCH', url: `/areas/${area.id}`, payload: { name } })
  assert.equal(res.statusCode, 200)
  assert.equal(JSON.parse(res.payload).name, name)

  const stored = await app.prisma.areas.findUnique({ where: { id: area.id } })
  assert.equal(stored?.name, name)
})

test('PATCH /areas/:id returns 404 for an unknown area', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({ method: 'PATCH', url: '/areas/2147483647', payload: { name: 'x' } })
  assert.equal(res.statusCode, 404)
})

test('PATCH /areas/:id rejects an empty body with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const area = await app.prisma.areas.create({ data: { name: `Test Area ${randomUUID()}` } })
  t.after(async () => {
    await app.prisma.areas.delete({ where: { id: area.id } })
  })

  const res = await app.inject({ method: 'PATCH', url: `/areas/${area.id}`, payload: {} })
  assert.equal(res.statusCode, 400)
})

test('DELETE /areas/:id cascades to modules, lessons, activities and translations', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const locale = await app.prisma.locales.findFirst({ where: { locale: 'pt' } })
  assert.ok(locale, 'the pt locale must be seeded')

  const area = await app.prisma.areas.create({ data: { name: `Test Area ${randomUUID()}` } })
  const module = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  await app.prisma.module_translations.create({
    data: { module_id: module.id, locale_id: locale.id, name: 'Módulo 1' }
  })
  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  await app.prisma.lesson_translations.create({
    data: { lesson_id: lesson.id, locale_id: locale.id, name: 'Lição 1' }
  })
  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.create({
    data: { activity_id: activity.id, locale_id: locale.id, content: { firstParagraph: 'x' } }
  })

  const res = await app.inject({ method: 'DELETE', url: `/areas/${area.id}` })
  assert.equal(res.statusCode, 204)

  assert.equal(await app.prisma.areas.count({ where: { id: area.id } }), 0)
  assert.equal(await app.prisma.modules.count({ where: { id: module.id } }), 0)
  assert.equal(await app.prisma.module_translations.count({ where: { module_id: module.id } }), 0)
  assert.equal(await app.prisma.lessons.count({ where: { id: lesson.id } }), 0)
  assert.equal(await app.prisma.lesson_translations.count({ where: { lesson_id: lesson.id } }), 0)
  assert.equal(await app.prisma.activities.count({ where: { id: activity.id } }), 0)
  assert.equal(await app.prisma.activity_translations.count({ where: { activity_id: activity.id } }), 0)
})

test('DELETE /areas/:id refuses with 409 when a lesson has user progress', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const area = await app.prisma.areas.create({ data: { name: `Test Area ${randomUUID()}` } })
  const module = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  const user = await app.prisma.users.create({
    data: { name: 'Progress User', email: `${randomUUID()}@test.dev`, password: 'x' }
  })
  const progress = await app.prisma.user_lessons.create({
    data: { user_id: user.id, lesson_id: lesson.id, completed_at: new Date() }
  })

  t.after(async () => {
    await app.prisma.user_lessons.delete({ where: { id: progress.id } })
    await app.prisma.users.delete({ where: { id: user.id } })
    await app.prisma.lessons.delete({ where: { id: lesson.id } })
    await app.prisma.modules.delete({ where: { id: module.id } })
    await app.prisma.areas.delete({ where: { id: area.id } })
  })

  const res = await app.inject({ method: 'DELETE', url: `/areas/${area.id}` })
  assert.equal(res.statusCode, 409)

  // Nada pode ter sido apagado: a checagem acontece antes da transação.
  assert.equal(await app.prisma.areas.count({ where: { id: area.id } }), 1)
  assert.equal(await app.prisma.lessons.count({ where: { id: lesson.id } }), 1)
})

test('DELETE /areas/:id returns 404 for an unknown area', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({ method: 'DELETE', url: '/areas/2147483647' })
  assert.equal(res.statusCode, 404)
})

test('area write routes are not registered outside of development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'test'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)

  const created = await app.inject({ method: 'POST', url: '/areas', payload: { name: 'x' } })
  assert.equal(created.statusCode, 404)

  const updated = await app.inject({ method: 'PATCH', url: '/areas/1', payload: { name: 'x' } })
  assert.equal(updated.statusCode, 404)

  const removed = await app.inject({ method: 'DELETE', url: '/areas/1' })
  assert.equal(removed.statusCode, 404)

  // A leitura continua disponível em qualquer ambiente.
  const listed = await app.inject({ url: '/areas' })
  assert.equal(listed.statusCode, 200)
})
