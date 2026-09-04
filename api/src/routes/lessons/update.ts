import { type FastifyPluginAsync } from 'fastify'
import type { UpdateLessonBody } from '../../types/contracts.js'
import { findAdminLessons, resolveLocaleIds, upsertLessonTranslations } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import {
  adminLessonResponseSchema,
  lessonIdParamsSchema,
  updateLessonBodySchema
} from './lessons.schema.js'

interface UpdateLessonParams {
  id: number;
}

const update: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Params: UpdateLessonParams; Body: UpdateLessonBody }>('/:id', {
    schema: {
      description:
        'Atualiza as traduções de uma lição. Idiomas ausentes do corpo ficam intactos — enviar só `pt` não apaga o `en`. Só existe em desenvolvimento.',
      tags: ['lessons'],
      params: lessonIdParamsSchema,
      body: updateLessonBodySchema,
      response: {
        200: adminLessonResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params
    const { translations } = request.body

    const existingLesson = await fastify.prisma.lessons.findUnique({ where: { id } })
    if (!existingLesson) {
      throw fastify.httpErrors.notFound('Lição não encontrada.')
    }

    return await fastify.prisma.$transaction(async (tx) => {
      const localeIds = await resolveLocaleIds(tx)

      if (translations) {
        await upsertLessonTranslations(tx, id, translations, localeIds)
      }

      const [adminLesson] = await findAdminLessons(tx, { id })
      return adminLesson
    })
  })
}

export default update
