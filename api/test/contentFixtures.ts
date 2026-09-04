// Fixtures compartilhadas pelos testes das rotas de conteúdo
// (areas/modules/lessons/activities).
//
// Estes testes rodam contra o NeonDB real — não há banco de teste separado —,
// então cada um cria a própria área descartável e apaga tudo que criou. Nenhum
// deles toca no currículo semeado por `prisma/seed.ts`.

import { randomUUID } from 'node:crypto'
import type { build } from './helper'

type App = Awaited<ReturnType<typeof build>>

interface AfterContext {
  after: (fn: () => unknown) => void;
}

/**
 * Apaga, em cascata, tudo que pende de uma área descartável.
 *
 * Inclui `user_lessons`: um teste que cria progresso não consegue limpá-lo por
 * conta própria a tempo, porque os hooks `after` rodam na ordem em que foram
 * registrados e o da área é sempre o primeiro. Sem isso, o `deleteMany` de
 * lições bate na FK RESTRICT de `user_lessons`.
 */
async function cleanupArea (app: App, areaId: number): Promise<void> {
  const modules = await app.prisma.modules.findMany({
    where: { area_id: areaId },
    select: { id: true }
  })
  const moduleIds = modules.map((module) => module.id)

  const lessons = await app.prisma.lessons.findMany({
    where: { module_id: { in: moduleIds } },
    select: { id: true }
  })
  const lessonIds = lessons.map((lesson) => lesson.id)

  const activities = await app.prisma.activities.findMany({
    where: { lesson_id: { in: lessonIds } },
    select: { id: true }
  })
  const activityIds = activities.map((activity) => activity.id)

  await app.prisma.activity_translations.deleteMany({ where: { activity_id: { in: activityIds } } })
  await app.prisma.activities.deleteMany({ where: { id: { in: activityIds } } })
  await app.prisma.lesson_translations.deleteMany({ where: { lesson_id: { in: lessonIds } } })
  await app.prisma.user_lessons.deleteMany({ where: { lesson_id: { in: lessonIds } } })
  await app.prisma.lessons.deleteMany({ where: { id: { in: lessonIds } } })
  await app.prisma.module_translations.deleteMany({ where: { module_id: { in: moduleIds } } })
  await app.prisma.modules.deleteMany({ where: { id: { in: moduleIds } } })
  await app.prisma.areas.deleteMany({ where: { id: areaId } })
}

/** Cria uma área descartável, registrando a limpeza em cascata no fim do teste. */
export async function scratchArea (app: App, t: AfterContext) {
  const area = await app.prisma.areas.create({ data: { name: `Test Area ${randomUUID()}` } })
  t.after(async () => { await cleanupArea(app, area.id) })
  return area
}

/**
 * Os ids das locales semeadas. Nunca hardcodados: são autoincrement, sem valor
 * fixo garantido — mesma regra que vale para áreas e módulos.
 */
export async function localeIds (app: App): Promise<{ pt: number; en: number }> {
  const locales = await app.prisma.locales.findMany({
    where: { locale: { in: ['pt', 'en'] } },
    select: { id: true, locale: true }
  })
  const pt = locales.find((locale) => locale.locale === 'pt')
  const en = locales.find((locale) => locale.locale === 'en')
  if (!pt || !en) {
    throw new Error('As locales pt/en precisam estar semeadas (pnpm --filter codap-api seed).')
  }
  return { pt: pt.id, en: en.id }
}

/** Área descartável + um módulo dentro dela, mais os ids das locales. */
export async function scratchModule (app: App, t: AfterContext) {
  const area = await scratchArea(app, t)
  const module = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  return { area, module, localeIds: await localeIds(app) }
}

/** Área + módulo + lição descartáveis, mais os ids das locales. */
export async function scratchLesson (app: App, t: AfterContext) {
  const { area, module, localeIds: ids } = await scratchModule(app, t)
  const lesson = await app.prisma.lessons.create({ data: { module_id: module.id, index: 0 } })
  return { area, module, lesson, localeIds: ids }
}
