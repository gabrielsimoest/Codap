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
        'Atualiza uma lição: traduções, `minLevel` (aula de aprofundamento, 2 a 50) e `xpReward` (1 a 100). Idiomas ausentes do corpo ficam intactos — enviar só `pt` não apaga o `en` —, e `minLevel`/`xpReward` ausentes não mudam; `null` limpa o campo. O corpo precisa ter ao menos uma propriedade. Só existe em desenvolvimento.',
      tags: ['lessons'],
      params: lessonIdParamsSchema,
      body: updateLessonBodySchema,
      response: {
        200: adminLessonResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params
    const { translations, minLevel, xpReward } = request.body

    const existingLesson = await fastify.prisma.lessons.findUnique({ where: { id } })
    if (!existingLesson) {
      throw fastify.httpErrors.notFound('Lição não encontrada.')
    }

    return await fastify.prisma.$transaction(async (tx) => {
      const localeIds = await resolveLocaleIds(tx)

      // `undefined` não mexe na coluna (o Prisma ignora), `null` a limpa.
      if (minLevel !== undefined || xpReward !== undefined) {
        await tx.lessons.update({
          where: { id },
          data: { min_level: minLevel, xp_reward: xpReward }
        })
      }

      if (translations) {
        await upsertLessonTranslations(tx, id, translations, localeIds)
      }

      const [adminLesson] = await findAdminLessons(tx, { id })
      return adminLesson
    })
  })
}

export default update
