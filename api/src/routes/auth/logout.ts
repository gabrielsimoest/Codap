import { type FastifyPluginAsync } from 'fastify'
import { hashRefreshToken } from '../../utils/refreshToken.js'
import { logoutBodySchema } from './auth.schema.js'

interface LogoutBody {
  refreshToken: string;
}

const logout: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: LogoutBody }>('/logout', {
    schema: {
      description: 'Revoga um refresh token (encerra a sessão apenas neste dispositivo). Idempotente.',
      tags: ['auth'],
      body: logoutBodySchema,
      response: {
        204: { type: 'null', description: 'Sessão encerrada (ou já não existia).' }
      }
    }
  }, async (request, reply) => {
    const { refreshToken } = request.body
    const tokenHash = hashRefreshToken(refreshToken)

    await fastify.prisma.refresh_tokens.updateMany({
      where: { token_hash: tokenHash, revoked_at: null },
      data: { revoked_at: new Date() }
    })

    return reply.code(204).send()
  })
}

export default logout
