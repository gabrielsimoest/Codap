import { type FastifyPluginAsync } from 'fastify'
import { sendPasswordResetEmail } from '../../utils/authEmails.js'
import { forgotPasswordBodySchema, messageResponseSchema } from './auth.schema.js'

interface ForgotPasswordBody {
  email: string;
}

const forgotPassword: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: ForgotPasswordBody }>('/forgot-password', {
    config: {
      rateLimit: { max: 3, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Pede o e-mail de redefinição de senha. Só manda o link se a conta existir **e tiver o e-mail confirmado** (um endereço não confirmado pode ser um erro de digitação que aponta para um estranho). Responde sempre 200 com a mesma mensagem, para não revelar quais e-mails estão cadastrados nem confirmados. O link vale 1 hora e só pode ser usado uma vez.',
      tags: ['auth'],
      body: forgotPasswordBodySchema,
      response: {
        200: messageResponseSchema
      }
    }
  }, async (request) => {
    const { email } = request.body

    const user = await fastify.prisma.users.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, email_verified_at: true }
    })

    // Só manda se o e-mail da conta estiver confirmado (o helper decide); o
    // cliente recebe a mesma resposta em qualquer caso.
    if (user) {
      await sendPasswordResetEmail(fastify, user)
    }

    return { message: 'Se este e-mail estiver cadastrado e confirmado, enviamos as instruções para redefinir a senha.' }
  })
}

export default forgotPassword
