import { type FastifyPluginAsync } from 'fastify'
import { emailVerifiedAt } from '../../utils/emailConfirmation.js'
import { authErrorResponseSchema, meResponseSchema } from './auth.schema.js'

const me: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/me', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Devolve a conta autenticada. É como o app descobre se o e-mail já foi confirmado (a confirmação acontece no navegador, fora do app).',
      tags: ['auth'],
      response: {
        200: meResponseSchema,
        401: { ...authErrorResponseSchema, description: 'Token de acesso inválido ou expirado.' }
      }
    }
  }, async (request) => {
    const user = await fastify.prisma.users.findUnique({
      where: { id: request.user.id },
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
    if (!user) {
      throw fastify.httpErrors.unauthorized('Token de acesso inválido ou expirado.')
    }

    return { user: { ...user, email_verified_at: emailVerifiedAt(user) } }
  })
}

export default me
