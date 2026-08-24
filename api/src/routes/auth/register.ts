import { type FastifyPluginAsync } from 'fastify'
import { hashPassword } from '../../utils/password.js'
import { createSession } from '../../utils/session.js'
import { authResponseSchema, registerBodySchema } from './auth.schema.js'

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

const register: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: RegisterBody }>('/register', {
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Cria um novo usuário e já retorna uma sessão autenticada (auto-login).',
      tags: ['auth'],
      body: registerBodySchema,
      response: {
        201: authResponseSchema,
        409: { type: 'object', description: 'Já existe um usuário com este e-mail.' }
      }
    }
  }, async (request, reply) => {
    const { name, email, password, rememberMe } = request.body

    const existingUser = await fastify.prisma.users.findUnique({ where: { email } })
    if (existingUser) {
      throw fastify.httpErrors.conflict('Já existe um usuário com este e-mail.')
    }

    const user = await fastify.prisma.users.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        xp: 0,
        dependabots: 0
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

    const session = await createSession(fastify, user.id, rememberMe ?? false)

    return reply.code(201).send({ user, ...session })
  })
}

export default register
