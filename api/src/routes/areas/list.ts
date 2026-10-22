import { type FastifyPluginAsync } from 'fastify'
import { areaResponseSchema } from './areas.schema.js'

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', {
    schema: {
      description: 'Lista as áreas de conteúdo (HTML, CSS, JavaScript). Não recebe `locale`: nomes de área são termos técnicos, iguais em qualquer idioma.',
      tags: ['areas'],
      response: {
        200: {
          type: 'array',
          items: areaResponseSchema
        }
      }
    }
  }, async () => {
    return await fastify.prisma.areas.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' }
    })
  })
}

export default list
