import { type FastifyPluginAsync } from 'fastify'
import { sendVerificationEmail } from '../../utils/authEmails.js'
import { isEmailConfirmed } from '../../utils/emailConfirmation.js'
import { authErrorResponseSchema, messageResponseSchema } from './auth.schema.js'

const resendVerification: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/resend-verification', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 3, timeWindow: '10 minutes' }
    },
    schema: {
      description: 'Reenvia o e-mail de confirmação para a conta autenticada. Um link novo invalida o anterior; há um intervalo de 1 minuto entre pedidos.',
      tags: ['auth'],
      response: {
        200: messageResponseSchema,
        401: { ...authErrorResponseSchema, description: 'Token de acesso inválido ou expirado.' },
        409: { ...authErrorResponseSchema, description: 'O e-mail desta conta já está confirmado.' },
        429: { ...authErrorResponseSchema, description: 'Pedido repetido cedo demais.' },
        503: { ...authErrorResponseSchema, description: 'Não foi possível preparar o e-mail agora.' }
      }
    }
  }, async (request) => {
    const user = await fastify.prisma.users.findUnique({
      where: { id: request.user.id },
      select: { id: true, name: true, email: true, email_verified_at: true }
    })
    if (!user) {
      throw fastify.httpErrors.unauthorized('Token de acesso inválido ou expirado.')
    }
    if (isEmailConfirmed(user)) {
      throw fastify.httpErrors.conflict('O e-mail desta conta já está confirmado.')
    }

    const result = await sendVerificationEmail(fastify, user)
    if (result === 'cooldown') {
      throw fastify.httpErrors.tooManyRequests('Aguarde um minuto antes de pedir outro e-mail.')
    }
    if (result === 'failed') {
      throw fastify.httpErrors.serviceUnavailable('Não foi possível enviar o e-mail agora. Tente de novo em instantes.')
    }

    return { message: 'Enviamos um novo e-mail de confirmação.' }
  })
}

export default resendVerification
