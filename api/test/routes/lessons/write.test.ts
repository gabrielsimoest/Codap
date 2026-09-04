import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build, useDevelopmentEnv } from '../../helper'
import { scratchModule } from '../../contentFixtures'

test('GET /lessons returns every translation and the nested activities', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module, localeIds } = await scratchModule(app, t)

  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  await app.prisma.lesson_translations.createMany({
    data: [
      { lesson_id: lesson.id, locale_id: localeIds.pt, name: 'Lição pt' },
      { lesson_id: lesson.id, locale_id: localeIds.en, name: 'Lesson en' }
    ]
  })
  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.create({
    data: {
      activity_id: activity.id,
      locale_id: localeIds.pt,
      content: { firstParagraph: 'Olá', highlight: ['Olá'], code: '<p>x</p>' }
    }
  })

  const res = await app.inject({ url: `/lessons?moduleId=${module.id}` })
  assert.equal(res.statusCode, 200)

  const body = JSON.parse(res.payload)
  assert.equal(body.length, 1)
  assert.equal(body[0].translations.pt.name, 'Lição pt')
  assert.equal(body[0].translations.en.name, 'Lesson en')
  assert.equal(body[0].activities.length, 1)
  // O JSONB precisa atravessar intacto — é o mesmo risco de serialização que o
  // `additionalProperties: true` de GET /modules protege.
  assert.deepEqual(body[0].activities[0].content.pt, {
    firstParagraph: 'Olá',
    highlight: ['Olá'],
    code: '<p>x</p>'
  })
  assert.ok(!('en' in body[0].activities[0].content))
})

test('GET /lessons returns 404 for an unknown module', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({ url: '/lessons?moduleId=2147483647' })
  assert.equal(res.statusCode, 404)
})

test('GET /lessons requires moduleId', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({ url: '/lessons' })
  assert.equal(res.statusCode, 400)
})

test('POST /lessons creates a lesson and appends by default', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })

  const res = await app.inject({
    method: 'POST',
    url: '/lessons',
    payload: {
      moduleId: module.id,
      translations: { pt: { name: 'Nova lição' }, en: { name: 'New lesson' } }
    }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.moduleId, module.id)
  assert.equal(body.index, 1)
  assert.equal(body.translations.pt.name, 'Nova lição')
  assert.equal(body.translations.en.name, 'New lesson')
  assert.deepEqual(body.activities, [])
})

test('POST /lessons returns 404 for an unknown module', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/lessons',
    payload: { moduleId: 2147483647, translations: { pt: { name: 'x' } } }
  })
  assert.equal(res.statusCode, 404)
})

test('POST /lessons rejects an empty translations map with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/lessons',
    payload: { moduleId: module.id, translations: {} }
  })
  assert.equal(res.statusCode, 400)
})

test('PATCH /lessons/:id updates one locale without touching the other', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  const created = await app.inject({
    method: 'POST',
    url: '/lessons',
    payload: {
      moduleId: module.id,
      translations: { pt: { name: 'Antiga' }, en: { name: 'Old' } }
    }
  })
  const lessonId = JSON.parse(created.payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: `/lessons/${lessonId}`,
    payload: { translations: { pt: { name: 'Nova' } } }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.translations.pt.name, 'Nova')
  assert.equal(body.translations.en.name, 'Old', 'the untouched locale must survive')
})

test('PATCH /lessons/:id returns 404 for an unknown lesson', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({
    method: 'PATCH',
    url: '/lessons/2147483647',
    payload: { translations: { pt: { name: 'x' } } }
  })
  assert.equal(res.statusCode, 404)
})

test('DELETE /lessons/:id cascades to activities and translations', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module, localeIds } = await scratchModule(app, t)

  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  await app.prisma.lesson_translations.create({
    data: { lesson_id: lesson.id, locale_id: localeIds.pt, name: 'Lição' }
  })
  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.create({
    data: { activity_id: activity.id, locale_id: localeIds.pt, content: { firstParagraph: 'x' } }
  })

  const res = await app.inject({ method: 'DELETE', url: `/lessons/${lesson.id}` })
  assert.equal(res.statusCode, 204)

  assert.equal(await app.prisma.lessons.count({ where: { id: lesson.id } }), 0)
  assert.equal(await app.prisma.lesson_translations.count({ where: { lesson_id: lesson.id } }), 0)
  assert.equal(await app.prisma.activities.count({ where: { id: activity.id } }), 0)
  assert.equal(await app.prisma.activity_translations.count({ where: { activity_id: activity.id } }), 0)
  // O módulo continua de pé: a cascata sobe até a lição, nunca além.
  assert.equal(await app.prisma.modules.count({ where: { id: module.id } }), 1)
})

test('DELETE /lessons/:id refuses with 409 when the lesson has user progress', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

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

  const res = await app.inject({ method: 'DELETE', url: `/lessons/${lesson.id}` })
  assert.equal(res.statusCode, 409)
  assert.equal(await app.prisma.lessons.count({ where: { id: lesson.id } }), 1)
})

test('DELETE /lessons/:id returns 404 for an unknown lesson', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({ method: 'DELETE', url: '/lessons/2147483647' })
  assert.equal(res.statusCode, 404)
})

test('PATCH /lessons/reorder renumbers indexes to 0..n-1', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  const first = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  const second = await app.prisma.lessons.create({ data: { module_id: module.id, index: 1 } })

  const res = await app.inject({
    method: 'PATCH',
    url: '/lessons/reorder',
    payload: { moduleId: module.id, orderedIds: [second.id, first.id] }
  })
  assert.equal(res.statusCode, 204)

  const reordered = await app.prisma.lessons.findMany({
    where: { module_id: module.id },
    select: { id: true, index: true },
    orderBy: { index: 'asc' }
  })
  assert.deepEqual(reordered.map((l) => l.id), [second.id, first.id])
  assert.deepEqual(reordered.map((l) => l.index), [0, 1])
})

test('PATCH /lessons/reorder rejects a partial id set with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  const first = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  await app.prisma.lessons.create({ data: { module_id: module.id, index: 1 } })

  const res = await app.inject({
    method: 'PATCH',
    url: '/lessons/reorder',
    payload: { moduleId: module.id, orderedIds: [first.id] }
  })
  assert.equal(res.statusCode, 400)
})

test('lesson routes are not registered outside of development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'test'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)

  // Inclusive a leitura: `GET /lessons` é a forma "admin", que só o dashboard usa.
  const listed = await app.inject({ url: '/lessons?moduleId=1' })
  assert.equal(listed.statusCode, 404)

  const created = await app.inject({
    method: 'POST',
    url: '/lessons',
    payload: { moduleId: 1, translations: { pt: { name: 'x' } } }
  })
  assert.equal(created.statusCode, 404)

  const removed = await app.inject({ method: 'DELETE', url: '/lessons/1' })
  assert.equal(removed.statusCode, 404)
})
