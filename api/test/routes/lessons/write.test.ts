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

async function createLessonVia (app: Awaited<ReturnType<typeof build>>, moduleId: number, extra: Record<string, unknown> = {}) {
  const res = await app.inject({
    method: 'POST',
    url: '/lessons',
    payload: { moduleId, translations: { pt: { name: 'Aula' }, en: { name: 'Lesson' } }, ...extra }
  })
  return res
}

test('POST /lessons stores minLevel and xpReward, and defaults both to null', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  const deepening = await createLessonVia(app, module.id, { minLevel: 8, xpReward: 30 })
  assert.equal(deepening.statusCode, 201)
  const body = JSON.parse(deepening.payload)
  assert.equal(body.minLevel, 8)
  assert.equal(body.xpReward, 30)
  const row = await app.prisma.lessons.findUniqueOrThrow({ where: { id: body.id } })
  assert.equal(row.min_level, 8)
  assert.equal(row.xp_reward, 30)

  const trail = JSON.parse((await createLessonVia(app, module.id)).payload)
  assert.strictEqual(trail.minLevel, null)
  assert.strictEqual(trail.xpReward, null)
})

test('POST /lessons rejects minLevel outside 2..50 and xpReward outside 1..100 with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  for (const extra of [{ minLevel: 1 }, { minLevel: 51 }, { xpReward: 0 }, { xpReward: 101 }]) {
    const res = await createLessonVia(app, module.id, extra)
    assert.equal(res.statusCode, 400, JSON.stringify(extra))
  }
})

test('PATCH /lessons/:id sets minLevel and xpReward without touching the translations', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id)).payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: `/lessons/${lessonId}`,
    payload: { minLevel: 8, xpReward: 30 }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.minLevel, 8)
  assert.equal(body.xpReward, 30)
  assert.equal(body.translations.pt.name, 'Aula')
  assert.equal(body.translations.en.name, 'Lesson')
})

test('PATCH /lessons/:id with minLevel null clears it and leaves xpReward alone', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id, { minLevel: 8, xpReward: 30 })).payload).id

  const res = await app.inject({ method: 'PATCH', url: `/lessons/${lessonId}`, payload: { minLevel: null } })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.minLevel, null)
  assert.equal(body.xpReward, 30)
})

test('PATCH /lessons/:id without minLevel or xpReward leaves them as they were', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id, { minLevel: 8, xpReward: 30 })).payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: `/lessons/${lessonId}`,
    payload: { translations: { pt: { name: 'Renomeada' } } }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.translations.pt.name, 'Renomeada')
  assert.equal(body.minLevel, 8)
  assert.equal(body.xpReward, 30)
})

test('PATCH /lessons/:id rejects an empty body and out-of-range values with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id)).payload).id

  for (const payload of [{}, { minLevel: 1 }, { minLevel: 51 }, { xpReward: 0 }, { xpReward: 101 }]) {
    const res = await app.inject({ method: 'PATCH', url: `/lessons/${lessonId}`, payload })
    assert.equal(res.statusCode, 400, JSON.stringify(payload))
  }
})

test('PATCH /lessons/:id with the dashboard payload turns an optional lesson back into a trail lesson', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id, { minLevel: 8, xpReward: 30 })).payload).id

  // É exatamente o que o formulário envia ao desligar "Aula de aprofundamento".
  const res = await app.inject({
    method: 'PATCH',
    url: `/lessons/${lessonId}`,
    payload: { translations: { pt: { name: 'Aula' }, en: { name: 'Lesson' } }, minLevel: null, xpReward: null }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.minLevel, null)
  assert.strictEqual(body.xpReward, null)
  const row = await app.prisma.lessons.findUniqueOrThrow({ where: { id: lessonId } })
  assert.strictEqual(row.min_level, null)
  assert.strictEqual(row.xp_reward, null)
})

test('PATCH /lessons/:id with xpReward null alone clears only the xpReward', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id, { minLevel: 8, xpReward: 30 })).payload).id

  const res = await app.inject({ method: 'PATCH', url: `/lessons/${lessonId}`, payload: { xpReward: null } })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.minLevel, 8)
  assert.strictEqual(body.xpReward, null)
})

test('POST /lessons with chest true stores is_chest, has no minLevel and answers chest: true', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  const res = await createLessonVia(app, module.id, { chest: true, xpReward: 50 })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.chest, true)
  assert.strictEqual(body.minLevel, null)
  assert.equal(body.xpReward, 50)
  assert.equal((await app.prisma.lessons.findUniqueOrThrow({ where: { id: body.id } })).is_chest, true)
  assert.strictEqual(JSON.parse((await createLessonVia(app, module.id)).payload).chest, false)
})

test('POST /lessons rejects chest together with minLevel with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  assert.equal((await createLessonVia(app, module.id, { chest: true, minLevel: 8 })).statusCode, 400)
})

test('PATCH /lessons/:id chest true clears the minLevel, and a minLevel turns the chest off', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id, { minLevel: 8, xpReward: 30 })).payload).id

  const toChest = await app.inject({ method: 'PATCH', url: `/lessons/${lessonId}`, payload: { chest: true } })
  assert.equal(toChest.statusCode, 200)
  assert.strictEqual(JSON.parse(toChest.payload).chest, true)
  assert.strictEqual(JSON.parse(toChest.payload).minLevel, null)
  assert.equal(JSON.parse(toChest.payload).xpReward, 30)

  const toLevel = await app.inject({ method: 'PATCH', url: `/lessons/${lessonId}`, payload: { minLevel: 9 } })
  assert.strictEqual(JSON.parse(toLevel.payload).chest, false)
  assert.equal(JSON.parse(toLevel.payload).minLevel, 9)

  const off = await app.inject({ method: 'PATCH', url: `/lessons/${lessonId}`, payload: { chest: false, minLevel: null } })
  assert.strictEqual(JSON.parse(off.payload).chest, false)
  assert.strictEqual(JSON.parse(off.payload).minLevel, null)
})

test('PATCH /lessons/:id rejects chest true together with a minLevel with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const lessonId = JSON.parse((await createLessonVia(app, module.id)).payload).id

  const res = await app.inject({ method: 'PATCH', url: `/lessons/${lessonId}`, payload: { chest: true, minLevel: 8 } })

  assert.equal(res.statusCode, 400)
})

test('GET /lessons (admin) returns chest lessons with the chest flag', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)
  const chestId = JSON.parse((await createLessonVia(app, module.id, { chest: true })).payload).id

  const res = await app.inject({ url: `/lessons?moduleId=${module.id}` })

  const lesson = (JSON.parse(res.payload) as Array<{ id: number, chest: boolean }>).find((l) => l.id === chestId)
  assert.strictEqual(lesson?.chest, true)
})

test('DELETE /lessons/:id refuses with 409 when a user already revealed the chest lesson', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module } = await scratchModule(app, t)

  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0, is_chest: true } })
  const user = await app.prisma.users.create({
    data: { name: 'Chest User', email: `${randomUUID()}@test.dev`, password: 'x' }
  })
  await app.prisma.user_chest_lessons.create({ data: { user_id: user.id, lesson_id: lesson.id } })

  t.after(async () => {
    await app.prisma.users.deleteMany({ where: { id: user.id } })
  })

  const res = await app.inject({ method: 'DELETE', url: `/lessons/${lesson.id}` })
  assert.equal(res.statusCode, 409)
  assert.equal(await app.prisma.lessons.count({ where: { id: lesson.id } }), 1)
})
