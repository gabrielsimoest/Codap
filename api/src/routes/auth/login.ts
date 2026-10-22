import { type FastifyPluginAsync } from 'fastify'
import { comparePassword } from '../../utils/password.js'
import { createSession } from '../../utils/session.js'
import { sendWelcomeEmailOnce } from '../../utils/authEmails.js'
import { emailVerifiedAt } from '../../utils/emailConfirmation.js'
import { isEmailAllowed } from '../../utils/testAccount.js'
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
      description: 'Autentica um usuário existente e retorna uma nova sessão. No primeiro login da conta, manda o e-mail de boas-vindas. A conta de teste (teste@teste.com) só é aceita em desenvolvimento.',
      tags: ['auth'],
      body: loginBodySchema,
      response: {
        200: authResponseSchema,
        401: { type: 'object', description: 'E-mail ou senha inválidos.' }
      }
    }
  }, async (request) => {
    const { email, password, rememberMe } = request.body

    // A conta de teste só entra em desenvolvimento, mesmo que a linha exista no
    // banco (ver utils/testAccount.ts). Checado antes da consulta e com a mesma
    // mensagem de credencial inválida.
    const existingUser = isEmailAllowed(email)
      ? await fastify.prisma.users.findUnique({ where: { email } })
      : null

    // Mesma mensagem para "usuário não existe" e "senha errada" — evita enumeração de contas.
    if (!existingUser || !(await comparePassword(password, existingUser.password))) {
      throw fastify.httpErrors.unauthorized('E-mail ou senha inválidos.')
    }

    const session = await createSession(fastify, existingUser.id, rememberMe ?? false)

    // Boas-vindas só no primeiro login (reivindicação atômica; ver utils/authEmails.ts).
    await sendWelcomeEmailOnce(fastify, existingUser)

    return {
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        xp: existingUser.xp,
        bits: existingUser.bits,
        email_verified_at: emailVerifiedAt(existingUser),
        created_at: existingUser.created_at,
        updated_at: existingUser.updated_at
      },
      ...session
    }
  })
}

export default login
