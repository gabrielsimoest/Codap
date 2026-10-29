import type { FastifyInstance } from 'fastify'
import { MAX_LEVEL, thresholdForLevel } from './levels.js'

/**
 * Conta mestra: uma conta de testes com tudo liberado. O flag `users.is_master`
 * só se liga por SQL direto no banco — nenhuma rota o escreve nem o devolve, e o
 * app não sabe que ele existe.
 *
 * Os dados ficam **reais** (linhas de verdade), então loja, coleção e restauração
 * de progresso funcionam sem nenhum caso especial. A função é idempotente e roda
 * no login e em `GET /sync/progress`, por isso uma aula ou conquista nova aparece
 * concluída na próxima abertura do app.
 *
 * Os Bits **não** são concedidos aqui: o saldo de teste é dado uma única vez, direto
 * no banco, quando a conta é preparada.
 */
export const MASTER_XP = thresholdForLevel(MAX_LEVEL)

/** Garante tudo concluído, todas as conquistas, todos os baús revelados e o XP do nível máximo. */
export async function ensureMasterGrants (fastify: FastifyInstance, userId: string): Promise<{ xp: number }> {
  const { prisma } = fastify
  const now = new Date()

  const [lessons, achievements] = await Promise.all([
    prisma.lessons.findMany({ select: { id: true, is_chest: true } }),
    prisma.achievements.findMany({ select: { id: true } })
  ])

  await prisma.$transaction([
    prisma.user_lessons.createMany({
      data: lessons.map((lesson) => ({ user_id: userId, lesson_id: lesson.id, completed_at: now })),
      skipDuplicates: true
    }),
    prisma.user_achievements.createMany({
      data: achievements.map((achievement) => ({ user_id: userId, achievement_id: achievement.id, completed_at: now })),
      skipDuplicates: true
    }),
    prisma.user_chest_lessons.createMany({
      data: lessons.filter((lesson) => lesson.is_chest).map((lesson) => ({ user_id: userId, lesson_id: lesson.id })),
      skipDuplicates: true
    }),
    // `xp` é `Int?`: nulo conta como "abaixo do máximo".
    prisma.users.updateMany({
      where: { id: userId, OR: [{ xp: null }, { xp: { lt: MASTER_XP } }] },
      data: { xp: MASTER_XP }
    })
  ])

  const { xp } = await prisma.users.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } })
  return { xp: xp ?? MASTER_XP }
}
