import { type FastifyPluginAsync } from 'fastify'
import { sendPasswordChangedEmail } from '../../utils/authEmails.js'
import { consumeAuthToken } from '../../utils/authToken.js'
import { isEmailConfirmed } from '../../utils/emailConfirmation.js'
import { hashPassword } from '../../utils/password.js'
import { authErrorResponseSchema, messageResponseSchema, resetPasswordBodySchema } from './auth.schema.js'
import { resetPasswordPage } from './pages.js'

interface ResetPasswordBody {
  token: string;
  password: string;
}

const resetPassword: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Destino do link do e-mail. Só mostra o formulário; quem troca a senha é o POST abaixo.
  fastify.get('/reset-password', {
    schema: {
      description: 'Página aberta pelo link do e-mail de redefinição (HTML), com o formulário de nova senha. O token vai na query string e é enviado ao POST do mesmo caminho.',
      tags: ['auth'],
      hide: true
    }
  }, async (_request, reply) => {
    return reply
      .header('Cache-Control', 'no-store')
      .header('Referrer-Policy', 'no-referrer')
      .header('X-Content-Type-Options', 'nosniff')
      .type('text/html; charset=utf-8')
      .send(resetPasswordPage)
  })

  fastify.post<{ Body: ResetPasswordBody }>('/reset-password', {
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Define uma nova senha com o token recebido por e-mail (uso único, vale 1 hora). Só vale para conta com o e-mail confirmado. Encerra todas as sessões da conta (revoga os refresh tokens) e manda um aviso de senha alterada para o e-mail da conta.',
      tags: ['auth'],
      body: resetPasswordBodySchema,
      response: {
        200: messageResponseSchema,
        400: { ...authErrorResponseSchema, description: 'Token inválido, expirado ou já usado, ou senha curta demais.' }
      }
    }
  }, async (request) => {
    const { token, password } = request.body

    // O hash (bcrypt, lento) fica fora da transação para não segurá-la aberta.
    const passwordHash = await hashPassword(password)

    const user = await fastify.prisma.$transaction(async (tx) => {
      const userId = await consumeAuthToken(tx, token, 'password_reset')
      if (!userId) {
        throw fastify.httpErrors.badRequest('Link inválido, expirado ou já utilizado.')
      }

      // Defesa em profundidade: o token só é emitido para e-mail confirmado, mas
      // a regra vale aqui também (o e-mail da conta pode ter mudado desde então).
      const account = await tx.users.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, email_verified_at: true }
      })
      if (!account || !isEmailConfirmed(account)) {
        throw fastify.httpErrors.badRequest('Link inválido, expirado ou já utilizado.')
      }

      await tx.users.update({ where: { id: userId }, data: { password: passwordHash } })
      // Quem tinha a senha antiga (inclusive um invasor) perde a sessão.
      await tx.refresh_tokens.updateMany({ where: { user_id: userId, revoked_at: null }, data: { revoked_at: new Date() } })
      return account
    })

    sendPasswordChangedEmail(fastify, user)

    return { message: 'Senha alterada. Entre com a nova senha.' }
  })
}

export default resetPassword
