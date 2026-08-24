import { type FastifyInstance, type FastifyPluginAsync } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { syncRequestBodySchema, syncResponseSchema } from './sync.schema.js'

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

const LESSON_XP_REWARD = 10

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
      await tx.users.update({
        where: { id: userId },
        data: { xp: { increment: LESSON_XP_REWARD } }
      })
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
      description: 'Envia em lote as mudanças feitas offline (lições concluídas, conquistas desbloqueadas) para aplicação idempotente no servidor.',
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

    return { results }
  })
}

export default create
