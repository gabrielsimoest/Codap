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
        'Atualiza uma lição: traduções, `minLevel` (aula de aprofundamento, 2 a 50) e `xpReward` (1 a 100). Idiomas ausentes do corpo ficam intactos — enviar só `pt` não apaga o `en` —, e `minLevel`/`xpReward`/`chest` ausentes não mudam; `null` limpa `minLevel`/`xpReward`. `chest: true` zera o `minLevel` e um `minLevel` não nulo desliga o baú (os dois juntos no corpo são 400). O corpo precisa ter ao menos uma propriedade. Só existe em desenvolvimento.',
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
    const { translations, minLevel, xpReward, chest } = request.body

    if (chest === true && minLevel != null) {
      throw fastify.httpErrors.badRequest('Uma aula do baú não tem nível mínimo.')
    }

    const existingLesson = await fastify.prisma.lessons.findUnique({ where: { id } })
    if (!existingLesson) {
      throw fastify.httpErrors.notFound('Lição não encontrada.')
    }

    return await fastify.prisma.$transaction(async (tx) => {
      const localeIds = await resolveLocaleIds(tx)

      // `undefined` não mexe na coluna (o Prisma ignora), `null` a limpa. Baú e
      // nível mínimo se excluem: ligar o baú zera o nível, e um nível (não
      // nulo) desliga o baú.
      if (minLevel !== undefined || xpReward !== undefined || chest !== undefined) {
        const isChest = chest ?? (typeof minLevel === 'number' ? false : undefined)
        await tx.lessons.update({
          where: { id },
          data: {
            min_level: chest === true ? null : minLevel,
            xp_reward: xpReward,
            is_chest: isChest
          }
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
