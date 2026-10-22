import { test } from 'node:test'
import * as assert from 'node:assert'
import { build, useDevelopmentEnv } from '../../helper'
import { localeIds, scratchLesson } from '../../contentFixtures'
import { violatesCodyRule } from '../../../src/utils/theoryRules'

type App = Awaited<ReturnType<typeof build>>

/** Teoria no modelo novo; só a persona muda entre os testes. */
function theory (persona: 'cody' | 'neutral', title = 'Título') {
  return {
    introduction: { title, text: 'Texto da introdução.', persona },
    highlight: [],
    codeLanguage: 'HTML',
    code: '<h1>Oi</h1>'
  }
}

/** Atividade prática de cada tipo do app, com um conteúdo mínimo qualquer. */
const PRACTICE_TYPES = [
  'option', 'code_blank', 'fill_blank', 'reorder', 'matching', 'code_playground', 'code_editor'
]

async function postActivity (
  app: App,
  lessonId: number,
  type: string,
  content: unknown,
  index?: number
) {
  return await app.inject({
    method: 'POST',
    url: '/activities',
    payload: { lessonId, type, content: { pt: content, en: content }, ...(index !== undefined ? { index } : {}) }
  })
}

/** Grava direto no banco, sem passar pela regra: monta estados que a rota recusaria. */
async function seedActivity (app: App, lessonId: number, index: number, type: string, content: unknown) {
  const ids = await localeIds(app)
  const activity = await app.prisma.activities.create({ data: { lesson_id: lessonId, index, type } })
  await app.prisma.activity_translations.createMany({
    data: [
      { activity_id: activity.id, locale_id: ids.pt, content: content as object },
      { activity_id: activity.id, locale_id: ids.en, content: content as object }
    ]
  })
  return activity.id
}

async function lessonOrder (app: App, lessonId: number): Promise<number[]> {
  const rows = await app.prisma.activities.findMany({
    where: { lesson_id: lessonId },
    orderBy: { index: 'asc' },
    select: { id: true }
  })
  return rows.map((row) => row.id)
}

// ---------------------------------------------------------------- regra pura

test('violatesCodyRule only flags an introduction that declares a persona other than Cody', () => {
  assert.equal(violatesCodyRule(theory('cody')), false)
  assert.equal(violatesCodyRule(theory('neutral')), true)
  // Introdução sem persona (ou com uma persona desconhecida) não é Cody.
  assert.equal(violatesCodyRule({ introduction: { text: 'x' } }), true)
  // O que a regra não entende nunca conta como violação.
  assert.equal(violatesCodyRule({ firstParagraph: 'formato antigo' }), false)
  assert.equal(violatesCodyRule({}), false)
  assert.equal(violatesCodyRule(null), false)
  assert.equal(violatesCodyRule('texto'), false)
})

// -------------------------------------------------------------------- criar

test('POST /activities accepts a Cody theory as the first and refuses a neutral one, persisting nothing', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const neutral = await postActivity(app, lesson.id, 'theory', theory('neutral'))
  assert.equal(neutral.statusCode, 422)
  assert.match(JSON.parse(neutral.payload).message, /Cody/)
  assert.deepEqual(await lessonOrder(app, lesson.id), [], 'a transação precisa desfazer a criação')

  const cody = await postActivity(app, lesson.id, 'theory', theory('cody'))
  assert.equal(cody.statusCode, 201)
})

test('POST /activities lets later theories choose either persona', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  assert.equal((await postActivity(app, lesson.id, 'theory', theory('cody'))).statusCode, 201)
  assert.equal((await postActivity(app, lesson.id, 'theory', theory('neutral'))).statusCode, 201)
  assert.equal((await postActivity(app, lesson.id, 'theory', theory('cody'))).statusCode, 201)
})

test('the rule counts theories of the lesson only: practice activities before the first theory do not matter', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  // Uma prática na posição 0 não faz da teoria seguinte "a segunda atividade".
  assert.equal((await postActivity(app, lesson.id, 'option', { question: 'Q' })).statusCode, 201)
  const neutral = await postActivity(app, lesson.id, 'theory', theory('neutral'))
  assert.equal(neutral.statusCode, 422, 'é a primeira TEORIA da lição, então precisa ser Cody')
  assert.equal((await postActivity(app, lesson.id, 'theory', theory('cody'))).statusCode, 201)
})

test('POST /activities refuses a neutral theory inserted before the current first one', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  // A primeira teoria está no índice 1, então um índice 0 a deixaria para trás.
  const first = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('cody'), 1)).payload)
  const before = await lessonOrder(app, lesson.id)

  const res = await postActivity(app, lesson.id, 'theory', theory('neutral'), 0)
  assert.equal(res.statusCode, 422)
  assert.deepEqual(await lessonOrder(app, lesson.id), before)
  assert.equal(before[0], first.id)
})

// ------------------------------------------------------------------- editar

test('PATCH /activities refuses turning the first theory neutral but allows it for a later one', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const first = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('cody'))).payload)
  const second = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('cody'))).payload)

  const bad = await app.inject({
    method: 'PATCH',
    url: `/activities/${first.id}`,
    payload: { content: { pt: theory('neutral') } }
  })
  assert.equal(bad.statusCode, 422)
  const stored = await app.prisma.activity_translations.findMany({ where: { activity_id: first.id } })
  assert.ok(stored.every((row) => (row.content as { introduction: { persona: string } }).introduction.persona === 'cody'))

  const ok = await app.inject({
    method: 'PATCH',
    url: `/activities/${second.id}`,
    payload: { content: { pt: theory('neutral'), en: theory('neutral') } }
  })
  assert.equal(ok.statusCode, 200)
})

test('PATCH /activities refuses a type change that promotes a neutral theory to first', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const first = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('cody'))).payload)
  await postActivity(app, lesson.id, 'theory', theory('neutral'))

  const res = await app.inject({
    method: 'PATCH',
    url: `/activities/${first.id}`,
    payload: { type: 'option', content: { pt: { question: 'Q' } } }
  })
  assert.equal(res.statusCode, 422)
  const row = await app.prisma.activities.findUnique({ where: { id: first.id } })
  assert.equal(row?.type, 'theory', 'a troca de tipo precisa ser desfeita')
})

// ------------------------------------------------------------------- remover

test('DELETE /activities refuses removing the first theory when a neutral one would take its place', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const first = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('cody'))).payload)
  const second = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('neutral'))).payload)

  const refused = await app.inject({ method: 'DELETE', url: `/activities/${first.id}` })
  assert.equal(refused.statusCode, 422)
  assert.deepEqual(await lessonOrder(app, lesson.id), [first.id, second.id])

  // Depois de a segunda virar Cody, remover a primeira é permitido.
  await app.inject({
    method: 'PATCH',
    url: `/activities/${second.id}`,
    payload: { content: { pt: theory('cody'), en: theory('cody') } }
  })
  const removed = await app.inject({ method: 'DELETE', url: `/activities/${first.id}` })
  assert.equal(removed.statusCode, 204)
})

// ----------------------------------------------------------------- reordenar

test('PATCH /activities/reorder refuses putting a neutral theory first and keeps the order', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const first = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('cody'))).payload)
  const second = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('neutral'))).payload)

  const res = await app.inject({
    method: 'PATCH',
    url: '/activities/reorder',
    payload: { lessonId: lesson.id, orderedIds: [second.id, first.id] }
  })
  assert.equal(res.statusCode, 422)
  assert.deepEqual(await lessonOrder(app, lesson.id), [first.id, second.id])
})

test('PATCH /activities/reorder lets practice activities move around the theory freely', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  const theoryId = JSON.parse((await postActivity(app, lesson.id, 'theory', theory('cody'))).payload).id
  const optionId = JSON.parse((await postActivity(app, lesson.id, 'option', { question: 'Q' })).payload).id
  const blankId = JSON.parse((await postActivity(app, lesson.id, 'code_blank', { question: 'Q' })).payload).id

  const res = await app.inject({
    method: 'PATCH',
    url: '/activities/reorder',
    payload: { lessonId: lesson.id, orderedIds: [blankId, optionId, theoryId] }
  })
  assert.equal(res.statusCode, 204)
  assert.deepEqual(await lessonOrder(app, lesson.id), [blankId, optionId, theoryId])
})

// ------------------------------------------- a regra nunca barra a prática

test('practice activities are never blocked, even in a lesson whose first theory is neutral', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson } = await scratchLesson(app, t)

  // Estado que a rota recusaria, montado direto: a primeira teoria é neutra.
  // Ele pode existir de verdade (conteúdo escrito antes da regra), e nenhuma
  // escrita de PRÁTICA pode ficar presa por causa dele.
  const theoryId = await seedActivity(app, lesson.id, 0, 'theory', theory('neutral'))

  const created: number[] = []
  for (const type of PRACTICE_TYPES) {
    const res = await postActivity(app, lesson.id, type, { question: `Q ${type}` })
    assert.equal(res.statusCode, 201, `criar ${type} foi barrado: ${res.payload}`)
    created.push(JSON.parse(res.payload).id)
  }

  for (const [position, id] of created.entries()) {
    const res = await app.inject({
      method: 'PATCH',
      url: `/activities/${id}`,
      payload: { content: { pt: { question: `Editada ${position}` } } }
    })
    assert.equal(res.statusCode, 200, `editar a atividade ${id} foi barrado: ${res.payload}`)
  }

  const reordered = await app.inject({
    method: 'PATCH',
    url: '/activities/reorder',
    payload: { lessonId: lesson.id, orderedIds: [theoryId, ...[...created].reverse()] }
  })
  assert.equal(reordered.statusCode, 204, `reordenar práticas foi barrado: ${reordered.payload}`)

  for (const id of created) {
    const res = await app.inject({ method: 'DELETE', url: `/activities/${id}` })
    assert.equal(res.statusCode, 204, `remover a atividade ${id} foi barrado: ${res.payload}`)
  }
})

test('lessons with no theory and lessons with legacy-format theory are never blocked', async (t) => {
  useDevelopmentEnv(t)
  const app = await build(t)
  const { lesson: practiceOnly } = await scratchLesson(app, t)
  const { lesson: legacy } = await scratchLesson(app, t)

  for (const type of PRACTICE_TYPES) {
    assert.equal((await postActivity(app, practiceOnly.id, type, { question: 'Q' })).statusCode, 201, type)
  }

  // Teoria no formato antigo (sem `introduction`): a regra não a entende e a ignora.
  const legacyTheory = { firstParagraph: 'Formato antigo.', highlight: [], codeLanguage: 'HTML', code: 'x' }
  await seedActivity(app, legacy.id, 0, 'theory', legacyTheory)
  assert.equal((await postActivity(app, legacy.id, 'option', { question: 'Q' })).statusCode, 201)
  assert.equal((await postActivity(app, legacy.id, 'theory', legacyTheory)).statusCode, 201)
  const order = await lessonOrder(app, legacy.id)
  const reorder = await app.inject({
    method: 'PATCH',
    url: '/activities/reorder',
    payload: { lessonId: legacy.id, orderedIds: [...order].reverse() }
  })
  assert.equal(reorder.statusCode, 204)
})
