import { type FastifyPluginAsync } from 'fastify'
import { userIdParamsSchema, userResponseSchema } from './users.schema.js'

interface GetByIdParams {
  id: string;
}

const getById: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Params: GetByIdParams }>('/:id', {
    schema: {
      description: 'Busca um usuário pelo ID.',
      tags: ['users'],
      params: userIdParamsSchema,
      response: {
        200: userResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params

    const user = await fastify.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        dependabots: true,
        created_at: true,
        updated_at: true
      }
    })

    if (!user) {
      throw fastify.httpErrors.notFound('Usuário não encontrado.')
    }

    return user
  })
}

export default getById
