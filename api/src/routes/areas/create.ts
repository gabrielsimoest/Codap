import { type FastifyPluginAsync } from 'fastify'
import { errorResponseSchema } from '../../utils/schemas.js'
import type { CreateAreaBody } from '../../types/contracts.js'
import { areaResponseSchema, createAreaBodySchema } from './areas.schema.js'

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: CreateAreaBody }>('/', {
    schema: {
      description: 'Cria uma área de conteúdo. Só existe em desenvolvimento.',
      tags: ['areas'],
      body: createAreaBodySchema,
      response: {
        201: areaResponseSchema,
        409: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { name } = request.body

    // `areas.name` não tem constraint única no banco, mas duas áreas com o
    // mesmo nome são indistinguíveis na UI e no seeder (que localiza a área
    // por `name`, nunca por id) — a checagem existe por isso, não por schema.
    const existingArea = await fastify.prisma.areas.findFirst({ where: { name } })
    if (existingArea) {
      throw fastify.httpErrors.conflict('Já existe uma área com este nome.')
    }

    const area = await fastify.prisma.areas.create({
      data: { name },
      select: { id: true, name: true }
    })

    return reply.code(201).send(area)
  })
}

export default create
