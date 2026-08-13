import { type FastifyPluginAsync } from 'fastify'
import { userResponseSchema } from './users.schema.js'

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', {
    schema: {
      description: 'Lista todos os usuários.',
      tags: ['users'],
      response: {
        200: {
          type: 'array',
          items: userResponseSchema
        }
      }
    }
  }, async () => {
    return fastify.prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        dependabots: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { created_at: 'asc' }
    })
  })
}

export default list
