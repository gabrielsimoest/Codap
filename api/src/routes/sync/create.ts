import { type FastifyInstance, type FastifyPluginAsync } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { syncRequestBodySchema, syncResponseSchema } from './sync.schema.js'
import { LESSON_XP_REWARD, bitsEarnedBetween } from '../../utils/levels.js'

type SyncEventType = 'lesson_completed' | 'achievement_unlocked'

interface SyncEventInput {
  clientEventId: string;
  type: SyncEventType;
  occurredAt: string;
  payload: { lessonId?: number; achievementId?: number };
}

interface SyncRequestBody {
  events: SyncEventInput[];
}

type SyncEventStatus = 'applied' | 'duplicate' | 'error'

interface SyncEventResult {
  clientEventId: string;
  status: SyncEventStatus;
  error?: string;
}

const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002'
const PRISMA_FOREIGN_KEY_ERROR = 'P2003'

async function applyLessonCompleted (fastify: FastifyInstance, userId: string, event: SyncEventInput): Promise<SyncEventResult> {
  const lessonId = event.payload.lessonId
  if (typeof lessonId !== 'number') {
    return { clientEventId: event.clientEventId, status: 'error', error: 'missing_lesson_id' }
  }

  try {
    await fastify.prisma.$transaction(async (tx) => {
      await tx.user_lessons.create({
        data: { user_id: userId, lesson_id: lessonId, completed_at: new Date(event.occurredAt) }
      })
      // Aula de aprofundamento paga o XP próprio; lição da trilha, o padrão. O
      // nível mínimo não é conferido aqui (ver a spec): só o XP muda.
      const { xp_reward: xpReward } = await tx.lessons.findUniqueOrThrow({
        where: { id: lessonId },
        select: { xp_reward: true }
      })
      const reward = xpReward ?? LESSON_XP_REWARD

      // `xp`/`bits` são `Int?`, e `increment` em NULL continua NULL — normaliza antes.
      await tx.users.updateMany({ where: { id: userId, xp: null }, data: { xp: 0 } })
      await tx.users.updateMany({ where: { id: userId, bits: null }, data: { bits: 0 } })

      // O UPDATE trava a linha até o commit, então o XP devolvido é serializado
      // entre os eventos do lote (que rodam em paralelo): cada um enxerga o seu
      // "antes" e o seu "depois", e um nível cruzado nunca é pago duas vezes.
      const { xp } = await tx.users.update({
        where: { id: userId },
        data: { xp: { increment: reward } },
        select: { xp: true }
      })
      const bitsEarned = bitsEarnedBetween((xp ?? 0) - reward, xp ?? 0)
      if (bitsEarned > 0) {
        await tx.users.update({ where: { id: userId }, data: { bits: { increment: bitsEarned } } })
      }
    })
    return { clientEventId: event.clientEventId, status: 'applied' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR) {
        return { clientEventId: event.clientEventId, status: 'duplicate' }
      }
      if (error.code === PRISMA_FOREIGN_KEY_ERROR) {
        return { clientEventId: event.clientEventId, status: 'error', error: 'lesson_not_found' }
      }
    }
    throw error
  }
}

async function applyAchievementUnlocked (fastify: FastifyInstance, userId: string, event: SyncEventInput): Promise<SyncEventResult> {
  const achievementId = event.payload.achievementId
  if (typeof achievementId !== 'number') {
    return { clientEventId: event.clientEventId, status: 'error', error: 'missing_achievement_id' }
  }

  try {
    await fastify.prisma.user_achievements.create({
      data: { user_id: userId, achievement_id: achievementId, completed_at: new Date(event.occurredAt) }
    })
    return { clientEventId: event.clientEventId, status: 'applied' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR) {
        return { clientEventId: event.clientEventId, status: 'duplicate' }
      }
      if (error.code === PRISMA_FOREIGN_KEY_ERROR) {
        return { clientEventId: event.clientEventId, status: 'error', error: 'achievement_not_found' }
      }
    }
    throw error
  }
}

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: SyncRequestBody }>('/', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 30, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Envia em lote as mudanças feitas offline (lições concluídas, conquistas desbloqueadas) para aplicação idempotente no servidor. Concluir uma lição pela primeira vez credita o XP dela (`lessons.xp_reward`, padrão 10) e, ao cruzar um ou mais níveis, os Bits de cada um. A resposta traz `profile` com o XP e os Bits atuais do usuário depois do lote.',
      tags: ['sync'],
      body: syncRequestBodySchema,
      response: {
        200: syncResponseSchema,
        401: { type: 'object', description: 'Access token ausente ou inválido.' }
      }
    }
  }, async (request) => {
    const userId = request.user.id
    const { events } = request.body

    const results = await Promise.all(events.map(async (event): Promise<SyncEventResult> => {
      if (event.type === 'lesson_completed') {
        return applyLessonCompleted(fastify, userId, event)
      }
      return applyAchievementUnlocked(fastify, userId, event)
    }))

    // Valores atuais depois do lote: o app adota quando a fila dele está vazia.
    const { xp, bits } = await fastify.prisma.users.findUniqueOrThrow({
      where: { id: userId },
      select: { xp: true, bits: true }
    })

    return { results, profile: { xp: xp ?? 0, bits: bits ?? 0 } }
  })
}

export default create
