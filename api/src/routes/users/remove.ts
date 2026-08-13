import { type FastifyPluginAsync } from 'fastify'
import { userIdParamsSchema } from './users.schema.js'

interface RemoveUserParams {
  id: string;
}

const remove: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete<{ Params: RemoveUserParams }>('/:id', {
    schema: {
      description: 'Remove um usuário.',
      tags: ['users'],
      params: userIdParamsSchema,
      response: {
        204: { type: 'null', description: 'Usuário removido com sucesso.' }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const existingUser = await fastify.prisma.users.findUnique({ where: { id } })
    if (!existingUser) {
      throw fastify.httpErrors.notFound('Usuário não encontrado.')
    }

    await fastify.prisma.users.delete({ where: { id } })

    return reply.code(204).send()
  })
}

export default remove
