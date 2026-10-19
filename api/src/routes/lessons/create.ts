import { type FastifyPluginAsync } from 'fastify'
import type { CreateLessonBody } from '../../types/contracts.js'
import { findAdminLessons, nextIndex, resolveLocaleIds, upsertLessonTranslations } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { adminLessonResponseSchema, createLessonBodySchema } from './lessons.schema.js'

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: CreateLessonBody }>('/', {
    schema: {
      description: 'Cria uma lição num módulo, com suas traduções. `minLevel` (2 a 50) a torna uma aula de aprofundamento, opcional e aberta a partir desse nível; `xpReward` (1 a 100) muda o XP pago ao concluir (padrão 10). Só existe em desenvolvimento.',
      tags: ['lessons'],
      body: createLessonBodySchema,
      response: {
        201: adminLessonResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { moduleId, index, minLevel, xpReward, translations } = request.body

    const module = await fastify.prisma.modules.findUnique({ where: { id: moduleId } })
    if (!module) {
      throw fastify.httpErrors.notFound('Módulo não encontrado.')
    }

    const created = await fastify.prisma.$transaction(async (tx) => {
      const localeIds = await resolveLocaleIds(tx)

      const siblings = await tx.lessons.findMany({
        where: { module_id: moduleId },
        select: { index: true }
      })

      const lesson = await tx.lessons.create({
        data: {
          module_id: moduleId,
          index: index ?? nextIndex(siblings),
          min_level: minLevel ?? null,
          xp_reward: xpReward ?? null
        }
      })

      await upsertLessonTranslations(tx, lesson.id, translations, localeIds)

      const [adminLesson] = await findAdminLessons(tx, { id: lesson.id })
      return adminLesson
    })

    return reply.code(201).send(created)
  })
}

export default create
