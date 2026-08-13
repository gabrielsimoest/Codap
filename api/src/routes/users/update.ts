import { type FastifyPluginAsync } from 'fastify'
import { hashPassword } from '../../utils/password.js'
import { updateUserBodySchema, userIdParamsSchema, userResponseSchema } from './users.schema.js'

interface UpdateUserParams {
  id: string;
}

interface UpdateUserBody {
  name?: string;
  email?: string;
  password?: string;
  xp?: number;
  dependabots?: number;
}

const update: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Params: UpdateUserParams; Body: UpdateUserBody }>('/:id', {
    schema: {
      description: 'Atualiza um usuário existente.',
      tags: ['users'],
      params: userIdParamsSchema,
      body: updateUserBodySchema,
      response: {
        200: userResponseSchema
      }
    }
  }, async (request) => {
    const { id } = request.params
    const { name, email, password, xp, dependabots } = request.body

    const existingUser = await fastify.prisma.users.findUnique({ where: { id } })
    if (!existingUser) {
      throw fastify.httpErrors.notFound('Usuário não encontrado.')
    }

    if (email && email !== existingUser.email) {
      const emailInUse = await fastify.prisma.users.findUnique({ where: { email } })
      if (emailInUse) {
        throw fastify.httpErrors.conflict('Já existe um usuário com este e-mail.')
      }
    }

    const user = await fastify.prisma.users.update({
      where: { id },
      data: {
        name,
        email,
        xp,
        dependabots,
        password: password ? await hashPassword(password) : undefined
      },
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

    return user
  })
}

export default update
