import { type FastifyPluginAsync } from 'fastify'
import type { CreateActivityBody } from '../../types/contracts.js'
import {
  findAdminActivity,
  nextIndex,
  resolveLocaleIds,
  upsertActivityTranslations
} from '../../utils/content.js'
import { enforceTheoryPersonaRule, findFirstTheoryId } from '../../utils/theoryRules.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { adminActivityResponseSchema, createActivityBodySchema } from './activities.schema.js'

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: CreateActivityBody }>('/', {
    schema: {
      description:
        'Cria uma atividade numa lição, com o `content` de cada idioma. Responde 422 se a atividade for uma teoria que viraria a primeira da lição sem a persona Cody. Só existe em desenvolvimento.',
      tags: ['activities'],
      body: createActivityBodySchema,
      response: {
        201: adminActivityResponseSchema,
        404: errorResponseSchema,
        422: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { lessonId, index, type, content } = request.body

    const lesson = await fastify.prisma.lessons.findUnique({ where: { id: lessonId } })
    if (!lesson) {
      throw fastify.httpErrors.notFound('Lição não encontrada.')
    }

    const created = await fastify.prisma.$transaction(async (tx) => {
      const localeIds = await resolveLocaleIds(tx)
      const firstTheoryBefore = await findFirstTheoryId(tx, lessonId)

      const siblings = await tx.activities.findMany({
        where: { lesson_id: lessonId },
        select: { index: true }
      })

      const activity = await tx.activities.create({
        data: { lesson_id: lessonId, index: index ?? nextIndex(siblings), type }
      })

      await upsertActivityTranslations(tx, activity.id, content, localeIds)
      await enforceTheoryPersonaRule(tx, fastify, lessonId, firstTheoryBefore, activity.id)

      return await findAdminActivity(tx, activity.id)
    })

    return reply.code(201).send(created)
  })
}

export default create
