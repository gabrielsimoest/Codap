import { type FastifyPluginAsync } from 'fastify'
import type { UpdateActivityBody } from '../../types/contracts.js'
import { findAdminActivity, resolveLocaleIds, upsertActivityTranslations } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import {
  activityIdParamsSchema,
  adminActivityResponseSchema,
  updateActivityBodySchema
} from './activities.schema.js'

interface UpdateActivityParams {
  id: number;
}

const update: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Params: UpdateActivityParams; Body: UpdateActivityBody }>('/:id', {
    schema: {
      description:
        'Atualiza o tipo e/ou o `content` de uma atividade. Idiomas ausentes de `content` ficam intactos — enviar só `pt` não apaga o `en`. Só existe em desenvolvimento.',
      tags: ['activities'],
      params: activityIdParamsSchema,
      body: updateActivityBodySchema,
      response: {
        200: adminActivityResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params
    const { type, content } = request.body

    const existingActivity = await fastify.prisma.activities.findUnique({ where: { id } })
    if (!existingActivity) {
      throw fastify.httpErrors.notFound('Atividade não encontrada.')
    }

    return await fastify.prisma.$transaction(async (tx) => {
      if (type) {
        await tx.activities.update({ where: { id }, data: { type } })
      }

      if (content) {
        const localeIds = await resolveLocaleIds(tx)
        await upsertActivityTranslations(tx, id, content, localeIds)
      }

      return await findAdminActivity(tx, id)
    })
  })
}

export default update
