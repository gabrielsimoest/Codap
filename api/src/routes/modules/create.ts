import { type FastifyPluginAsync } from 'fastify'
import type { CreateModuleBody } from '../../types/contracts.js'
import {
  nextIndex,
  resolveLocaleIds,
  toTranslationMap,
  upsertModuleTranslations
} from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { adminModuleResponseSchema, createModuleBodySchema } from './modules.schema.js'

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: CreateModuleBody }>('/', {
    schema: {
      description: 'Cria um módulo numa área, com suas traduções. Só existe em desenvolvimento.',
      tags: ['modules'],
      body: createModuleBodySchema,
      response: {
        201: adminModuleResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { areaId, index, translations } = request.body

    const area = await fastify.prisma.areas.findUnique({ where: { id: areaId } })
    if (!area) {
      throw fastify.httpErrors.notFound('Área não encontrada.')
    }

    const created = await fastify.prisma.$transaction(async (tx) => {
      const localeIds = await resolveLocaleIds(tx)

      const siblings = await tx.modules.findMany({
        where: { area_id: areaId },
        select: { index: true }
      })

      const module = await tx.modules.create({
        data: { area_id: areaId, index: index ?? nextIndex(siblings) }
      })

      await upsertModuleTranslations(tx, module.id, translations, localeIds)

      return await tx.modules.findUniqueOrThrow({
        where: { id: module.id },
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

    return reply.code(201).send({
      id: created.id,
      areaId: created.area_id,
      index: created.index,
      translations: toTranslationMap(created.translations, (row) => ({
        name: row.name,
        subtitle: row.subtitle
      }))
    })
  })
}

export default create
