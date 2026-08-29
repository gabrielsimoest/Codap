import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

async function ensureLocale (app: Awaited<ReturnType<typeof build>>, code: 'pt' | 'en', name: string) {
  const existing = await app.prisma.locales.findFirst({ where: { locale: code } })
  if (existing) return { id: existing.id, created: false }
  const created = await app.prisma.locales.create({ data: { locale: code, name } })
  return { id: created.id, created: true }
}

const THEORY_CONTENT_PT = {
  firstParagraph: 'Primeiro parágrafo.',
  secondParagraph: 'Segundo parágrafo.',
  endParagraph: 'Parágrafo final.',
  highlight: ['HTML', 'Cody'],
  codeLanguage: 'HTML',
  code: '<html></html>'
}

const THEORY_CONTENT_EN = {
  firstParagraph: 'First paragraph.',
  secondParagraph: 'Second paragraph.',
  endParagraph: 'Closing paragraph.',
  highlight: ['HTML', 'Cody'],
  codeLanguage: 'HTML',
  code: '<html></html>'
}

const OPTION_CONTENT_PT = {
  question: 'Qual é a tag de fechamento?',
  highlight: ['HTML'],
  options: ['<html>', '</html>'],
  correctOption: 2
}

/**
 * Monta area -> module -> lesson (com traduções) e devolve os ids junto de uma
 * função de limpeza na ordem reversa de FK. Os testes rodam contra o NeonDB
 * real, então cada um cria o que precisa com um sufixo único e remove tudo.
 */
async function createModuleFixture (app: Awaited<ReturnType<typeof build>>) {
  const pt = await ensureLocale(app, 'pt', 'Português')
  const en = await ensureLocale(app, 'en', 'English')

  const suffix = randomUUID()
  const area = await app.prisma.areas.create({ data: { name: `Test Area ${suffix}` } })
  const testModule = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  await app.prisma.module_translations.createMany({
    data: [
      { module_id: testModule.id, locale_id: pt.id, name: `Módulo de Teste ${suffix}` },
      { module_id: testModule.id, locale_id: en.id, name: `Test Module ${suffix}` }
    ]
  })
  const lesson = await app.prisma.lessons.create({ data: { module_id: testModule.id, index: 0 } })
  await app.prisma.lesson_translations.createMany({
    data: [
      { lesson_id: lesson.id, locale_id: pt.id, name: `Lição de Teste ${suffix}` },
      { lesson_id: lesson.id, locale_id: en.id, name: `Test Lesson ${suffix}` }
    ]
  })

  const cleanup = async () => {
    await app.prisma.activity_translations.deleteMany({ where: { activity: { lesson_id: lesson.id } } })
    await app.prisma.activities.deleteMany({ where: { lesson_id: lesson.id } })
    await app.prisma.lesson_translations.deleteMany({ where: { lesson_id: lesson.id } })
    await app.prisma.lessons.delete({ where: { id: lesson.id } })
    await app.prisma.module_translations.deleteMany({ where: { module_id: testModule.id } })
    await app.prisma.modules.delete({ where: { id: testModule.id } })
    await app.prisma.areas.delete({ where: { id: area.id } })
    if (pt.created) await app.prisma.locales.delete({ where: { id: pt.id } })
    if (en.created) await app.prisma.locales.delete({ where: { id: en.id } })
  }

  return { pt, en, suffix, area, testModule, lesson, cleanup }
}

test('GET /modules lists the modules, lessons and activities of the given area, translated', async (t) => {
  const app = await build(t)
  const { pt, en, suffix, area, testModule, lesson, cleanup } = await createModuleFixture(app)

  const theory = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.createMany({
    data: [
      { activity_id: theory.id, locale_id: pt.id, content: THEORY_CONTENT_PT },
      { activity_id: theory.id, locale_id: en.id, content: THEORY_CONTENT_EN }
    ]
  })
  const option = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 1, type: 'option' }
  })
  await app.prisma.activity_translations.createMany({
    data: [{ activity_id: option.id, locale_id: pt.id, content: OPTION_CONTENT_PT }]
  })

  t.after(cleanup)

  const res = await app.inject({ url: `/modules?areaId=${area.id}&locale=pt` })
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.length, 1)
  assert.equal(body[0].id, testModule.id)
  assert.equal(body[0].areaId, area.id)
  assert.equal(body[0].index, 0)
  assert.equal(body[0].name, `Módulo de Teste ${suffix}`)
  assert.equal(body[0].lessons.length, 1)
  assert.equal(body[0].lessons[0].id, lesson.id)
  assert.equal(body[0].lessons[0].name, `Lição de Teste ${suffix}`)

  const activities = body[0].lessons[0].activities
  assert.equal(activities.length, 2)
  assert.equal(activities[0].id, theory.id)
  assert.equal(activities[0].index, 0)
  assert.equal(activities[0].type, 'theory')
  assert.equal(activities[1].type, 'option')

  // Asserção de regressão do `additionalProperties: true` no schema de
  // resposta: sem ele o fast-json-stringify apaga todo campo não declarado e
  // `content` chega como {} — silenciosamente, sem erro. Um deepEqual é o que
  // trava isso; comparar só uma chave deixaria o resto passar despercebido.
  assert.deepEqual(activities[0].content, THEORY_CONTENT_PT)
  assert.deepEqual(activities[1].content, OPTION_CONTENT_PT)
})

test('GET /modules translates the activity content by locale', async (t) => {
  const app = await build(t)
  const { pt, en, area, lesson, cleanup } = await createModuleFixture(app)

  const theory = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.createMany({
    data: [
      { activity_id: theory.id, locale_id: pt.id, content: THEORY_CONTENT_PT },
      { activity_id: theory.id, locale_id: en.id, content: THEORY_CONTENT_EN }
    ]
  })

  t.after(cleanup)

  const res = await app.inject({ url: `/modules?areaId=${area.id}&locale=en` })
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body[0].lessons[0].activities[0].content, THEORY_CONTENT_EN)
})

test('GET /modules returns an empty activities array for a lesson with no activities', async (t) => {
  const app = await build(t)
  const { area, cleanup } = await createModuleFixture(app)
  t.after(cleanup)

  const res = await app.inject({ url: `/modules?areaId=${area.id}&locale=pt` })
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.deepEqual(body[0].lessons[0].activities, [])
})

test('GET /modules transports an unknown activity type and its content untouched', async (t) => {
  const app = await build(t)
  const { pt, area, lesson, cleanup } = await createModuleFixture(app)

  // `activities.type` é VarChar livre e `content` é um JSONB sem forma fixa.
  // Um tipo que a API não conhece precisa atravessar intacto: é o app que
  // decide o que sabe renderizar. Este teste falharia na hora se alguém
  // trocasse o schema por um `oneOf` das variantes conhecidas.
  const exotic = { foo: { bar: [1, 2, 3] }, baz: true, qux: null }
  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'code' }
  })
  await app.prisma.activity_translations.createMany({
    data: [{ activity_id: activity.id, locale_id: pt.id, content: exotic }]
  })

  t.after(cleanup)

  const res = await app.inject({ url: `/modules?areaId=${area.id}&locale=pt` })
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body[0].lessons[0].activities[0].type, 'code')
  assert.deepEqual(body[0].lessons[0].activities[0].content, exotic)
})

test('GET /modules returns an empty content object when the activity has no translation in the locale', async (t) => {
  const app = await build(t)
  const { pt, area, lesson, cleanup } = await createModuleFixture(app)

  const activity = await app.prisma.activities.create({
    data: { lesson_id: lesson.id, index: 0, type: 'theory' }
  })
  await app.prisma.activity_translations.createMany({
    data: [{ activity_id: activity.id, locale_id: pt.id, content: THEORY_CONTENT_PT }]
  })

  t.after(cleanup)

  const res = await app.inject({ url: `/modules?areaId=${area.id}&locale=en` })
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  // A atividade continua na lista (a contagem não muda por idioma) — só o
  // conteúdo vem vazio, no mesmo espírito do `?? ''` usado nos nomes.
  assert.equal(body[0].lessons[0].activities.length, 1)
  assert.deepEqual(body[0].lessons[0].activities[0].content, {})
})

test('GET /modules returns an empty array for an area with no modules', async (t) => {
  const app = await build(t)
  const area = await app.prisma.areas.create({ data: { name: `Empty Area ${randomUUID()}` } })
  t.after(async () => { await app.prisma.areas.delete({ where: { id: area.id } }) })

  const res = await app.inject({ url: `/modules?areaId=${area.id}&locale=pt` })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.payload), [])
})

test('GET /modules requires areaId and locale', async (t) => {
  const app = await build(t)
  const res = await app.inject({ url: '/modules' })
  assert.equal(res.statusCode, 400)
})

test('GET /modules rejects an unknown locale with 400', async (t) => {
  const app = await build(t)
  const res = await app.inject({ url: '/modules?areaId=1&locale=fr' })
  assert.equal(res.statusCode, 400)
})
