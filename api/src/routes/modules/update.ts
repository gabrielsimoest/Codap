import { type FastifyPluginAsync } from 'fastify'
import type { UpdateModuleBody } from '../../types/contracts.js'
import { resolveLocaleIds, toTranslationMap, upsertModuleTranslations } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import {
  adminModuleResponseSchema,
  moduleIdParamsSchema,
  updateModuleBodySchema
} from './modules.schema.js'

interface UpdateModuleParams {
  id: number;
}

const update: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Params: UpdateModuleParams; Body: UpdateModuleBody }>('/:id', {
    schema: {
      description:
        'Atualiza as traduções de um módulo. Idiomas ausentes do corpo ficam intactos — enviar só `pt` não apaga o `en`. Só existe em desenvolvimento.',
      tags: ['modules'],
      params: moduleIdParamsSchema,
      body: updateModuleBodySchema,
      response: {
        200: adminModuleResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params
    const { translations } = request.body

    const existingModule = await fastify.prisma.modules.findUnique({ where: { id } })
    if (!existingModule) {
      throw fastify.httpErrors.notFound('Módulo não encontrado.')
    }

    const updated = await fastify.prisma.$transaction(async (tx) => {
      const localeIds = await resolveLocaleIds(tx)

      if (translations) {
        await upsertModuleTranslations(tx, id, translations, localeIds)
      }

      return await tx.modules.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          area_id: true,
          index: true,
          translations: {
            select: { name: true, subtitle: true, locale: { select: { locale: true } } }
          }
        }
      })
    })

    return {
      id: updated.id,
      areaId: updated.area_id,
      index: updated.index,
      translations: toTranslationMap(updated.translations, (row) => ({
        name: row.name,
        subtitle: row.subtitle
      }))
    }
  })
}

export default update
