import { type FastifyPluginAsync } from 'fastify'
import { errorResponseSchema } from '../../utils/schemas.js'
import type { UpdateAreaBody } from '../../types/contracts.js'
import { areaIdParamsSchema, areaResponseSchema, updateAreaBodySchema } from './areas.schema.js'

interface UpdateAreaParams {
  id: number;
}

const update: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Params: UpdateAreaParams; Body: UpdateAreaBody }>('/:id', {
    schema: {
      description: 'Atualiza uma área de conteúdo. Só existe em desenvolvimento.',
      tags: ['areas'],
      params: areaIdParamsSchema,
      body: updateAreaBodySchema,
      response: {
        200: areaResponseSchema,
        404: errorResponseSchema,
        409: errorResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params
    const { name } = request.body

    const existingArea = await fastify.prisma.areas.findUnique({ where: { id } })
    if (!existingArea) {
      throw fastify.httpErrors.notFound('Área não encontrada.')
    }

    if (name && name !== existingArea.name) {
      const nameInUse = await fastify.prisma.areas.findFirst({ where: { name } })
      if (nameInUse) {
        throw fastify.httpErrors.conflict('Já existe uma área com este nome.')
      }
    }

    return await fastify.prisma.areas.update({
      where: { id },
      data: { name },
      select: { id: true, name: true }
    })
  })
}

export default update
