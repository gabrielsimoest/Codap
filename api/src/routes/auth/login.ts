import { type FastifyPluginAsync } from 'fastify'
import { comparePassword } from '../../utils/password.js'
import { createSession } from '../../utils/session.js'
import { authResponseSchema, loginBodySchema } from './auth.schema.js'

interface LoginBody {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const login: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: LoginBody }>('/login', {
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Autentica um usuário existente e retorna uma nova sessão.',
      tags: ['auth'],
      body: loginBodySchema,
      response: {
        200: authResponseSchema,
        401: { type: 'object', description: 'E-mail ou senha inválidos.' }
      }
    }
  }, async (request) => {
    const { email, password, rememberMe } = request.body

    const existingUser = await fastify.prisma.users.findUnique({ where: { email } })

    // Mesma mensagem para "usuário não existe" e "senha errada" — evita enumeração de contas.
    if (!existingUser || !(await comparePassword(password, existingUser.password))) {
      throw fastify.httpErrors.unauthorized('E-mail ou senha inválidos.')
    }

    const session = await createSession(fastify, existingUser.id, rememberMe ?? false)

    return {
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        xp: existingUser.xp,
        dependabots: existingUser.dependabots,
        created_at: existingUser.created_at,
        updated_at: existingUser.updated_at
      },
      ...session
    }
  })
}

export default login
