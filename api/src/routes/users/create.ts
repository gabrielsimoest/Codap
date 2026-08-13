import { type FastifyPluginAsync } from 'fastify'
import { hashPassword } from '../../utils/password.js'
import { createUserBodySchema, userResponseSchema } from './users.schema.js'

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  xp?: number;
  dependabots?: number;
}

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: CreateUserBody }>('/', {
    schema: {
      description: 'Cria um novo usuário.',
      tags: ['users'],
      body: createUserBodySchema,
      response: {
        201: userResponseSchema
      }
    }
  }, async (request, reply) => {
    const { name, email, password, xp, dependabots } = request.body

    const existingUser = await fastify.prisma.users.findUnique({ where: { email } })
    if (existingUser) {
      throw fastify.httpErrors.conflict('Já existe um usuário com este e-mail.')
    }

    const user = await fastify.prisma.users.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        xp: xp ?? 0,
        dependabots: dependabots ?? 0
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

    return reply.code(201).send(user)
  })
}

export default create
