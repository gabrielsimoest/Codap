import { type FastifyPluginAsync } from 'fastify'
import { sendPasswordResetEmail } from '../../utils/authEmails.js'
import { authErrorResponseSchema, messageResponseSchema } from './auth.schema.js'

const requestPasswordChange: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/request-password-change', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 3, timeWindow: '10 minutes' }
    },
    schema: {
      description: 'A conta autenticada pede o link de troca de senha, enviado para o próprio e-mail dela (a senha é trocada na mesma página de `/auth/reset-password`). **Exige o e-mail confirmado.** Como a pessoa está autenticada, o intervalo de 1 minuto entre pedidos é informado (429) sem risco de revelar contas.',
      tags: ['auth'],
      response: {
        200: messageResponseSchema,
        401: { ...authErrorResponseSchema, description: 'Token de acesso inválido ou expirado.' },
        403: { ...authErrorResponseSchema, description: 'O e-mail da conta ainda não foi confirmado.' },
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

    const result = await sendPasswordResetEmail(fastify, user)
    if (result === 'unverified') {
      throw fastify.httpErrors.forbidden('Confirme seu e-mail antes de alterar a senha.')
    }
    if (result === 'cooldown') {
      throw fastify.httpErrors.tooManyRequests('Aguarde um minuto antes de pedir outro e-mail.')
    }
    if (result !== 'queued') {
      throw fastify.httpErrors.serviceUnavailable('Não foi possível enviar o e-mail agora. Tente de novo em instantes.')
    }

    return { message: 'Enviamos um link para alterar a senha para o seu e-mail.' }
  })
}

export default requestPasswordChange
