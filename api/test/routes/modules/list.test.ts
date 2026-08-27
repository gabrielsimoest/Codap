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

test('GET /modules lists the modules (and lessons) of the given area, translated', async (t) => {
  const app = await build(t)

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

  t.after(async () => {
    await app.prisma.lesson_translations.deleteMany({ where: { lesson_id: lesson.id } })
    await app.prisma.lessons.delete({ where: { id: lesson.id } })
    await app.prisma.module_translations.deleteMany({ where: { module_id: testModule.id } })
    await app.prisma.modules.delete({ where: { id: testModule.id } })
    await app.prisma.areas.delete({ where: { id: area.id } })
    if (pt.created) await app.prisma.locales.delete({ where: { id: pt.id } })
    if (en.created) await app.prisma.locales.delete({ where: { id: en.id } })
  })

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
