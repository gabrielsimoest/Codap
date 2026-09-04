import { test } from 'node:test'
import * as assert from 'node:assert'
import { build, useDevelopmentEnv } from '../../helper'
import { scratchLesson } from '../../contentFixtures'

const THEORY_CONTENT_PT = {
  firstParagraph: 'O HTML estrutura a página.',
  highlight: ['HTML'],
  codeLanguage: 'HTML',
  code: '<h1>Olá</h1>',
  additionalCode: [{ codeLanguage: 'CSS', code: 'h1 { color: blue; }' }],
  onlyCode: false
}

test('POST /activities creates an activity with content in both locales', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: {
      lessonId: lesson.id,
      type: 'theory',
      content: {
        pt: THEORY_CONTENT_PT,
        en: { firstParagraph: 'HTML structures the page.', highlight: ['HTML'] }
      }
    }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.lessonId, lesson.id)
  assert.equal(body.index, 0)
  assert.equal(body.type, 'theory')
  // O JSONB precisa atravessar intacto, com arrays e objetos aninhados. É o
  // mesmo risco silencioso de serialização que o `additionalProperties: true`
  // do schema de GET /modules protege (ver api/CLAUDE.md).
  assert.deepEqual(body.content.pt, THEORY_CONTENT_PT)
  assert.equal(body.content.en.firstParagraph, 'HTML structures the page.')
})

test('POST /activities carries an unknown type and an arbitrary content blob intact', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  // A API transporta o conteúdo fielmente sem conhecer o `type` — quem decide
  // o que sabe renderizar é o cliente. Um tipo futuro do roadmap precisa
  // atravessar sem nenhuma mudança de schema.
  const blob = {
    textBefore: 'Complete: <',
    acceptedAnswers: ['h1', 'H1'],
    wordBank: ['h1', 'p', 'div'],
    nested: { deep: { value: 42 } }
  }

  const res = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId: lesson.id, type: 'fill_blank', content: { pt: blob } }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.type, 'fill_blank')
  assert.deepEqual(body.content.pt, blob)
})

test('POST /activities appends to the end when index is omitted', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  await app.prisma.activities.create({ data: { lesson_id: lesson.id, index: 0, type: 'theory' } })

  const res = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId: lesson.id, type: 'option', content: { pt: { question: 'Qual?' } } }
  })

  assert.equal(res.statusCode, 201)
  assert.equal(JSON.parse(res.payload).index, 1)
})

test('POST /activities returns 404 for an unknown lesson', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId: 2147483647, type: 'theory', content: { pt: {} } }
  })
  assert.equal(res.statusCode, 404)
})

test('POST /activities rejects a type longer than the VarChar(25) column', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId: lesson.id, type: 'x'.repeat(26), content: { pt: {} } }
  })
  assert.equal(res.statusCode, 400)
})

test('POST /activities rejects an empty content map with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const res = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId: lesson.id, type: 'theory', content: {} }
  })
  assert.equal(res.statusCode, 400)
})

test('PATCH /activities/:id updates one locale without touching the other', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const created = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: {
      lessonId: lesson.id,
      type: 'theory',
      content: { pt: { firstParagraph: 'Antigo' }, en: { firstParagraph: 'Old' } }
    }
  })
  const activityId = JSON.parse(created.payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: `/activities/${activityId}`,
    payload: { content: { pt: { firstParagraph: 'Novo' } } }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.content.pt.firstParagraph, 'Novo')
  assert.equal(body.content.en.firstParagraph, 'Old', 'the untouched locale must survive')
})

test('PATCH /activities/:id replaces the whole content of a locale, not a merge', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const created = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: {
      lessonId: lesson.id,
      type: 'theory',
      content: { pt: { firstParagraph: 'A', secondParagraph: 'B' } }
    }
  })
  const activityId = JSON.parse(created.payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: `/activities/${activityId}`,
    payload: { content: { pt: { firstParagraph: 'A' } } }
  })

  assert.equal(res.statusCode, 200)
  // O `content` é um documento inteiro, não um patch de campos: apagar um
  // parágrafo no dashboard precisa realmente removê-lo do banco.
  assert.deepEqual(JSON.parse(res.payload).content.pt, { firstParagraph: 'A' })
})

test('PATCH /activities/:id can change only the type', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const created = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId: lesson.id, type: 'theory', content: { pt: { firstParagraph: 'A' } } }
  })
  const activityId = JSON.parse(created.payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: `/activities/${activityId}`,
    payload: { type: 'option' }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.type, 'option')
  assert.deepEqual(body.content.pt, { firstParagraph: 'A' })
})

test('PATCH /activities/:id rejects an empty body with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })

  const res = await app.inject({
    method: 'PATCH',
    url: `/activities/${activity.id}`,
    payload: {}
  })
  assert.equal(res.statusCode, 400)
})

test('PATCH /activities/:id returns 404 for an unknown activity', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({
    method: 'PATCH',
    url: '/activities/2147483647',
    payload: { type: 'theory' }
  })
  assert.equal(res.statusCode, 404)
})

test('DELETE /activities/:id removes the activity and its translations', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson, localeIds } = await scratchLesson(app, t)

  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.create({
    data: { activity_id: activity.id, locale_id: localeIds.pt, content: { firstParagraph: 'x' } }
  })

  const res = await app.inject({ method: 'DELETE', url: `/activities/${activity.id}` })
  assert.equal(res.statusCode, 204)

  assert.equal(await app.prisma.activities.count({ where: { id: activity.id } }), 0)
  assert.equal(await app.prisma.activity_translations.count({ where: { activity_id: activity.id } }), 0)
  assert.equal(await app.prisma.lessons.count({ where: { id: lesson.id } }), 1)
})

test('DELETE /activities/:id succeeds even when the lesson has user progress', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  // Progresso é registrado por lição, nunca por atividade — remover uma
  // atividade não apaga histórico de ninguém, então não há 409 aqui.
  const user = await app.prisma.users.create({
    data: { name: 'Progress User', email: `activity-${Date.now()}@test.dev`, password: 'x' }
  })
  await app.prisma.user_lessons.create({
    data: { user_id: user.id, lesson_id: lesson.id, completed_at: new Date() }
  })
  t.after(async () => {
    await app.prisma.users.deleteMany({ where: { id: user.id } })
  })

  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })

  const res = await app.inject({ method: 'DELETE', url: `/activities/${activity.id}` })
  assert.equal(res.statusCode, 204)
})

test('DELETE /activities/:id returns 404 for an unknown activity', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)

  const res = await app.inject({ method: 'DELETE', url: '/activities/2147483647' })
  assert.equal(res.statusCode, 404)
})

test('PATCH /activities/reorder renumbers indexes to 0..n-1', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const first = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  const second = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 1, type: 'option' }
  })

  const res = await app.inject({
    method: 'PATCH',
    url: '/activities/reorder',
    payload: { lessonId: lesson.id, orderedIds: [second.id, first.id] }
  })
  assert.equal(res.statusCode, 204)

  const reordered = await app.prisma.activities.findMany({
    where: { lesson_id: lesson.id },
    select: { id: true, index: true },
    orderBy: { index: 'asc' }
  })
  assert.deepEqual(reordered.map((a) => a.id), [second.id, first.id])
  assert.deepEqual(reordered.map((a) => a.index), [0, 1])
})

test('PATCH /activities/reorder rejects an id from another lesson with 400', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { module, lesson } = await scratchLesson(app, t)

  const otherLesson = await app.prisma.lessons.create({
    data: { module_id: module.id, index: 1 }
  })
  const mine = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  const theirs = await app.prisma.activities.create({
    data: { lesson_id: otherLesson.id, index: 0, type: 'theory' }
  })

  const res = await app.inject({
    method: 'PATCH',
    url: '/activities/reorder',
    payload: { lessonId: lesson.id, orderedIds: [mine.id, theirs.id] }
  })
  assert.equal(res.statusCode, 400)
})

test('activity routes are not registered outside of development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'test'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)

  const created = await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId: 1, type: 'theory', content: { pt: {} } }
  })
  assert.equal(created.statusCode, 404)

  const removed = await app.inject({ method: 'DELETE', url: '/activities/1' })
  assert.equal(removed.statusCode, 404)
})
