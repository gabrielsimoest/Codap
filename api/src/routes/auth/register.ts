import { type FastifyPluginAsync } from 'fastify'
import { hashPassword } from '../../utils/password.js'
import { createSession } from '../../utils/session.js'
import { sendVerificationEmail } from '../../utils/authEmails.js'
import { emailTypoError } from '../../utils/emailDomain.js'
import { isEmailAllowed, isTestEmail } from '../../utils/testAccount.js'
import { authErrorResponseSchema, authResponseSchema, registerBodySchema } from './auth.schema.js'

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
      description: 'Cria um novo usuário, manda o e-mail de confirmação e já retorna uma sessão autenticada (auto-login). O e-mail não bloqueia o uso da conta.',
      tags: ['auth'],
      body: registerBodySchema,
      response: {
        201: authResponseSchema,
        400: { ...authErrorResponseSchema, description: 'Corpo inválido, e-mail reservado (conta de teste fora de desenvolvimento) ou domínio com cara de erro de digitação (fora de desenvolvimento).' },
        409: { type: 'object', description: 'Já existe um usuário com este e-mail.' }
      }
    }
  }, async (request, reply) => {
    const { name, email, password, rememberMe } = request.body

    // A conta de teste só existe em desenvolvimento (ver utils/testAccount.ts).
    if (!isEmailAllowed(email)) {
      throw fastify.httpErrors.badRequest('Este e-mail não pode ser usado em um cadastro.')
    }

    // Domínio com cara de erro de digitação (gmial.com): só fora de desenvolvimento.
    const typoError = emailTypoError(fastify, email)
    if (typoError) {
      throw typoError
    }

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
        bits: 0,
        // Sem caixa de entrada para confirmar: a conta de teste já nasce confirmada.
        email_verified_at: isTestEmail(email) ? new Date() : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        bits: true,
        email_verified_at: true,
        created_at: true,
        updated_at: true
      }
    })

    // O envio em si não é aguardado e uma falha dele não derruba o cadastro; o
    // usuário pede outro por POST /auth/resend-verification.
    if (!user.email_verified_at) {
      await sendVerificationEmail(fastify, user)
    }

    const session = await createSession(fastify, user.id, rememberMe ?? false)

    return reply.code(201).send({ user, ...session })
  })
}

export default register
