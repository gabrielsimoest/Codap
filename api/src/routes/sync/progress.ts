import { type FastifyPluginAsync } from 'fastify'
import type { ProgressResponse } from '../../types/contracts.js'
import { ensureMasterGrants } from '../../utils/masterAccount.js'

const progress: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/progress', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 30, timeWindow: '1 minute' }
    },
    schema: {
      description:
        'O progresso do usuário na nuvem: **todas** as lições concluídas e as conquistas desbloqueadas, do mais antigo para o mais novo. É o caminho de volta do `POST /sync`: o app o consulta ao entrar numa conta (num aparelho novo, depois de reinstalar, ou ao usar a conta em outro aparelho) para marcar o que já foi feito e mostrar os emblemas. Sempre do usuário do token, nunca de um id vindo do cliente. O volume é pequeno (um par de ids e datas por lição — algumas centenas no máximo), por isso não há paginação.',
      tags: ['sync'],
      response: {
        200: {
          type: 'object',
          properties: {
            lessons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lessonId: { type: 'integer' },
                  completedAt: { type: 'string', format: 'date-time' }
                },
                required: ['lessonId', 'completedAt']
              }
            },
            achievements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  achievementId: { type: 'integer' },
                  unlockedAt: { type: 'string', format: 'date-time' }
                },
                required: ['achievementId', 'unlockedAt']
              }
            }
          },
          required: ['lessons', 'achievements']
        },
        401: { type: 'object', description: 'Access token ausente ou inválido.' }
      }
    }
  }, async (request): Promise<ProgressResponse> => {
    const userId = request.user.id

    // Conta mestra: garante tudo concluído antes de ler (ver utils/masterAccount.ts).
    const { is_master: isMaster } = await fastify.prisma.users.findUniqueOrThrow({ where: { id: userId }, select: { is_master: true } })
    if (isMaster) await ensureMasterGrants(fastify, userId)

    const [lessons, achievements] = await Promise.all([
      fastify.prisma.user_lessons.findMany({
        where: { user_id: userId },
        select: { lesson_id: true, completed_at: true },
        orderBy: { completed_at: 'asc' }
      }),
      fastify.prisma.user_achievements.findMany({
        where: { user_id: userId },
        select: { achievement_id: true, completed_at: true },
        orderBy: { completed_at: 'asc' }
      })
    ])

    return {
      lessons: lessons.map((row) => ({ lessonId: row.lesson_id, completedAt: row.completed_at.toISOString() })),
      achievements: achievements.map((row) => ({ achievementId: row.achievement_id, unlockedAt: row.completed_at.toISOString() }))
    }
  })
}

export default progress
