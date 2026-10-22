import { type FastifyPluginAsync } from 'fastify'
import { consumeAuthToken } from '../../utils/authToken.js'
import { authErrorResponseSchema, messageResponseSchema, tokenBodySchema } from './auth.schema.js'
import { verifyEmailPage } from './pages.js'

interface VerifyEmailBody {
  token: string;
}

const verifyEmail: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Destino do link do e-mail. Só mostra a página; quem confirma é o POST abaixo.
  fastify.get('/verify-email', {
    schema: {
      description: 'Página aberta pelo link do e-mail de confirmação (HTML). O token vai na query string e é enviado ao POST do mesmo caminho.',
      tags: ['auth'],
      hide: true
    }
  }, async (_request, reply) => {
    return reply
      .header('Cache-Control', 'no-store')
      .header('Referrer-Policy', 'no-referrer')
      .header('X-Content-Type-Options', 'nosniff')
      .type('text/html; charset=utf-8')
      .send(verifyEmailPage)
  })

  fastify.post<{ Body: VerifyEmailBody }>('/verify-email', {
    config: {
      rateLimit: { max: 10, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Confirma o e-mail da conta com o token recebido por e-mail (uso único, vale 24 horas).',
      tags: ['auth'],
      body: tokenBodySchema,
      response: {
        200: messageResponseSchema,
        400: { ...authErrorResponseSchema, description: 'Token inválido, expirado ou já usado.' }
      }
    }
  }, async (request) => {
    const { token } = request.body

    await fastify.prisma.$transaction(async (tx) => {
      const userId = await consumeAuthToken(tx, token, 'email_verification')
      if (!userId) {
        throw fastify.httpErrors.badRequest('Link inválido, expirado ou já utilizado.')
      }

      // Já confirmado por outro caminho (ex.: redefinição de senha) mantém a data original.
      await tx.users.updateMany({
        where: { id: userId, email_verified_at: null },
        data: { email_verified_at: new Date() }
      })
    })

    return { message: 'E-mail confirmado.' }
  })
}

export default verifyEmail
