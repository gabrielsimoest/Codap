// Fixtures dos testes da loja: um usuário real (via /auth/register) com saldo e
// estoque ajustados direto no banco, e a limpeza de tudo que a loja grava.
//
// Estes testes rodam contra o NeonDB real — não há banco de teste separado —,
// então cada um cria o próprio usuário e apaga tudo que gerou.

import { randomUUID } from 'node:crypto'
import type { build } from './helper'

type App = Awaited<ReturnType<typeof build>>

export async function registerShopUser (
  app: App,
  { bits = 0, instantHints = 0, chestMisses = 0 }: { bits?: number | null; instantHints?: number; chestMisses?: number } = {}
) {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { name: 'Shop Test', email: `shop-${randomUUID()}@example.com`, password: 'senha1234' }
  })
  const body = JSON.parse(res.payload)
  const userId = body.user.id as string

  await app.prisma.users.update({
    where: { id: userId },
    data: { bits, instant_hints: instantHints, chest_misses: chestMisses }
  })

  return {
    userId,
    accessToken: body.accessToken as string,
    headers: { authorization: `Bearer ${body.accessToken as string}` },
    cleanup: async () => {
      await app.prisma.xp_boosts.deleteMany({ where: { user_id: userId } })
      await app.prisma.user_chest_lessons.deleteMany({ where: { user_id: userId } })
      await app.prisma.user_lessons.deleteMany({ where: { user_id: userId } })
      await app.prisma.user_achievements.deleteMany({ where: { user_id: userId } })
      await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
      await app.prisma.users.delete({ where: { id: userId } })
    }
  }
}

/**
 * Aulas do baú descartáveis (área + módulo + N lições com `is_chest`, uma
 * atividade e nome nos dois idiomas), e a limpeza em cascata.
 *
 * O sorteio do baú escolhe entre TODAS as aulas do baú do banco, então um teste
 * nunca deve assumir qual delas saiu: confira o que o servidor gravou.
 */
export async function createChestLessons (app: App, count: number, xpReward = 50) {
  const locales = await app.prisma.locales.findMany({ where: { locale: { in: ['pt', 'en'] } } })
  const localeId = (code: 'pt' | 'en') => locales.find((l) => l.locale === code)!.id

  const area = await app.prisma.areas.create({ data: { name: `Chest Fixture Area ${randomUUID()}` } })
  const module = await app.prisma.modules.create({ data: { area_id: area.id, index: 0 } })
  const lessons: Array<{ id: number, namePt: string, nameEn: string }> = []

  for (let i = 0; i < count; i++) {
    const suffix = randomUUID().slice(0, 8)
    const lesson = await app.prisma.lessons.create({
      data: { module_id: module.id, index: i, is_chest: true, xp_reward: xpReward }
    })
    const namePt = `Aula do baú ${suffix}`
    const nameEn = `Chest lesson ${suffix}`
    await app.prisma.lesson_translations.createMany({
      data: [
        { lesson_id: lesson.id, locale_id: localeId('pt'), name: namePt },
        { lesson_id: lesson.id, locale_id: localeId('en'), name: nameEn }
      ]
    })
    const activity = await app.prisma.activities.create({ data: { lesson_id: lesson.id, index: 0, type: 'theory' } })
    await app.prisma.activity_translations.createMany({
      data: [
        { activity_id: activity.id, locale_id: localeId('pt'), content: { firstParagraph: 'Texto pt', highlight: [], codeLanguage: 'HTML', code: '<p>pt</p>' } },
        { activity_id: activity.id, locale_id: localeId('en'), content: { firstParagraph: 'Text en', highlight: [], codeLanguage: 'HTML', code: '<p>en</p>' } }
      ]
    })
    lessons.push({ id: lesson.id, namePt, nameEn })
  }

  return {
    areaId: area.id,
    moduleId: module.id,
    lessons,
    cleanup: async () => {
      const ids = lessons.map((l) => l.id)
      await app.prisma.user_chest_lessons.deleteMany({ where: { lesson_id: { in: ids } } })
      await app.prisma.user_lessons.deleteMany({ where: { lesson_id: { in: ids } } })
      await app.prisma.activity_translations.deleteMany({ where: { activity: { lesson_id: { in: ids } } } })
      await app.prisma.activities.deleteMany({ where: { lesson_id: { in: ids } } })
      await app.prisma.lesson_translations.deleteMany({ where: { lesson_id: { in: ids } } })
      await app.prisma.lessons.deleteMany({ where: { id: { in: ids } } })
      await app.prisma.modules.delete({ where: { id: module.id } })
      await app.prisma.areas.delete({ where: { id: area.id } })
    }
  }
}

/** Marca como revelada, para o usuário, toda aula do baú que existe no banco (esgota o pool dele). */
export async function revealAllChestLessons (app: App, userId: string): Promise<number> {
  const all = await app.prisma.lessons.findMany({ where: { is_chest: true }, select: { id: true } })
  await app.prisma.user_chest_lessons.createMany({
    data: all.map((l) => ({ user_id: userId, lesson_id: l.id })),
    skipDuplicates: true
  })
  return all.length
}
