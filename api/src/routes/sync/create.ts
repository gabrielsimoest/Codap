import { type FastifyInstance, type FastifyPluginAsync } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { syncRequestBodySchema, syncResponseSchema } from './sync.schema.js'
import { LESSON_XP_REWARD, bitsEarnedBetween } from '../../utils/levels.js'
import { BOOST_MAX_LESSONS } from '../../utils/shop.js'

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

/** A lição é do baú e o usuário ainda não a revelou: desfaz o insert e vira `lesson_locked`. */
class LessonLockedError extends Error {}

const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002'
const PRISMA_FOREIGN_KEY_ERROR = 'P2003'

async function applyLessonCompleted (fastify: FastifyInstance, userId: string, event: SyncEventInput): Promise<SyncEventResult> {
  const lessonId = event.payload.lessonId
  if (typeof lessonId !== 'number') {
    return { clientEventId: event.clientEventId, status: 'error', error: 'missing_lesson_id' }
  }

  try {
    await fastify.prisma.$transaction(async (tx) => {
      // Trava o usuário ANTES de qualquer escrita: com os eventos do lote em paralelo,
      // cada um precisa enxergar as lições que os anteriores já gravaram na janela do
      // Dobro de XP (o teto de lições dobradas), e eles passam a andar um de cada vez.
      // Tem de ser o primeiro comando: o insert em `user_lessons` já toma um lock
      // compartilhado da linha do usuário (FK), e dois eventos que o tomassem antes
      // de pedir o `FOR UPDATE` travariam um ao outro (deadlock).
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`
      await tx.user_lessons.create({
        data: { user_id: userId, lesson_id: lessonId, completed_at: new Date(event.occurredAt) }
      })
      // Aula de aprofundamento paga o XP próprio; lição da trilha, o padrão. O
      // nível mínimo não é conferido aqui (ver a spec): só o XP muda.
      const { xp_reward: xpReward, is_chest: isChest } = await tx.lessons.findUniqueOrThrow({
        where: { id: lessonId },
        select: { xp_reward: true, is_chest: true }
      })

      // Aula do baú só vale para quem a revelou. Diferente do nível mínimo, isto
      // não depende da ordem dos eventos do lote: revelar é uma compra online
      // anterior. Lançar aqui desfaz o insert em `user_lessons` desta transação.
      if (isChest) {
        const revealed = await tx.user_chest_lessons.count({ where: { user_id: userId, lesson_id: lessonId } })
        if (revealed === 0) {
          throw new LessonLockedError()
        }
      }
      // Dobro de XP: vale o HORÁRIO DO EVENTO, não o de quando ele chega. Assim
      // funciona também para uma lição feita offline dentro da janela e enviada
      // depois, e não depende da ordem dos eventos do lote.
      const occurredAt = new Date(event.occurredAt)
      const window = await tx.xp_boosts.findFirst({
        where: { user_id: userId, starts_at: { lte: occurredAt }, ends_at: { gte: occurredAt } }
      })
      // O teto conta as lições concluídas na janela, esta incluída (o insert já
      // aconteceu): a de ordem BOOST_MAX_LESSONS ainda dobra, a seguinte não.
      const boosted = window !== null && await tx.user_lessons.count({
        where: { user_id: userId, completed_at: { gte: window.starts_at, lte: window.ends_at } }
      }) <= BOOST_MAX_LESSONS
      const reward = (xpReward ?? LESSON_XP_REWARD) * (boosted ? 2 : 1)

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
    if (error instanceof LessonLockedError) {
      return { clientEventId: event.clientEventId, status: 'error', error: 'lesson_locked' }
    }
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
      description: 'Envia em lote as mudanças feitas offline (lições concluídas, conquistas desbloqueadas) para aplicação idempotente no servidor. Concluir uma lição pela primeira vez credita o XP dela (`lessons.xp_reward`, padrão 10; o dobro se o `occurredAt` cai numa janela de Dobro de XP do usuário) e, ao cruzar um ou mais níveis, os Bits de cada um. A resposta traz `profile` com o XP e os Bits atuais do usuário depois do lote.',
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
