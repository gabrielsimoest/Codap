import { type FastifyPluginAsync } from 'fastify'
import { sendVerificationEmail } from '../../utils/authEmails.js'
import { isEmailConfirmed } from '../../utils/emailConfirmation.js'
import { emailTypoError } from '../../utils/emailDomain.js'
import { isEmailAllowed } from '../../utils/testAccount.js'
import { authErrorResponseSchema, changeEmailBodySchema, meResponseSchema } from './auth.schema.js'

interface ChangeEmailBody {
  email: string;
}

const changeEmail: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: ChangeEmailBody }>('/change-email', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 5, timeWindow: '10 minutes' }
    },
    schema: {
      description: 'Corrige o e-mail da conta autenticada e manda a confirmação para o novo endereço. **Só enquanto o e-mail atual não está confirmado**: serve para consertar um erro de digitação do cadastro, e não deixa uma sessão roubada trocar o e-mail de uma conta confirmada. Os links pendentes do endereço antigo deixam de valer.',
      tags: ['auth'],
      body: changeEmailBodySchema,
      response: {
        200: meResponseSchema,
        400: { ...authErrorResponseSchema, description: 'E-mail igual ao atual, reservado (conta de teste fora de desenvolvimento) ou com domínio com cara de erro de digitação (fora de desenvolvimento).' },
        401: { ...authErrorResponseSchema, description: 'Token de acesso inválido ou expirado.' },
        403: { ...authErrorResponseSchema, description: 'O e-mail atual já está confirmado e não pode ser trocado por aqui.' },
        409: { ...authErrorResponseSchema, description: 'Já existe uma conta com este e-mail.' }
      }
    }
  }, async (request) => {
    const { email } = request.body

    if (!isEmailAllowed(email)) {
      throw fastify.httpErrors.badRequest('Este e-mail não pode ser usado.')
    }
    const typoError = emailTypoError(fastify, email)
    if (typoError) {
      throw typoError
    }

    const current = await fastify.prisma.users.findUnique({
      where: { id: request.user.id },
      select: { id: true, name: true, email: true, email_verified_at: true }
    })
    if (!current) {
      throw fastify.httpErrors.unauthorized('Token de acesso inválido ou expirado.')
    }
    if (isEmailConfirmed(current)) {
      throw fastify.httpErrors.forbidden('O e-mail desta conta já está confirmado e não pode ser trocado.')
    }
    if (email.trim().toLowerCase() === current.email.toLowerCase()) {
      throw fastify.httpErrors.badRequest('Este já é o e-mail da sua conta.')
    }

    const taken = await fastify.prisma.users.findUnique({ where: { email }, select: { id: true } })
    if (taken) {
      throw fastify.httpErrors.conflict('Já existe uma conta com este e-mail.')
    }

    let user
    try {
      user = await fastify.prisma.$transaction(async (tx) => {
        // Os links pendentes pertenciam ao endereço antigo: não podem valer para o novo.
        await tx.auth_tokens.deleteMany({ where: { user_id: current.id } })
        return await tx.users.update({
          where: { id: current.id },
          data: { email, email_verified_at: null },
          select: { id: true, name: true, email: true, xp: true, bits: true, email_verified_at: true, created_at: true, updated_at: true }
        })
      })
    } catch (err) {
      // Duas contas disputando o mesmo e-mail: a constraint única decide.
      if ((err as { code?: string }).code === 'P2002') {
        throw fastify.httpErrors.conflict('Já existe uma conta com este e-mail.')
      }
      throw err
    }

    // Os tokens acabaram de ser apagados, então o intervalo entre pedidos não atrapalha.
    await sendVerificationEmail(fastify, user)

    return { user }
  })
}

export default changeEmail
