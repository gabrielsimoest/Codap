import { type FastifyPluginAsync } from 'fastify'
import { createSession } from '../../utils/session.js'
import { hashRefreshToken } from '../../utils/refreshToken.js'
import { refreshBodySchema, refreshResponseSchema } from './auth.schema.js'

interface RefreshBody {
  refreshToken: string;
}

const refresh: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: RefreshBody }>('/refresh', {
    config: {
      rateLimit: { max: 20, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Rotaciona o par de tokens a partir de um refresh token válido, revogando o anterior.',
      tags: ['auth'],
      body: refreshBodySchema,
      response: {
        200: refreshResponseSchema,
        401: { type: 'object', description: 'Refresh token inválido, expirado ou já reutilizado (o que revoga toda a família de tokens).' }
      }
    }
  }, async (request) => {
    const { refreshToken } = request.body
    const tokenHash = hashRefreshToken(refreshToken)

    const existingToken = await fastify.prisma.refresh_tokens.findUnique({ where: { token_hash: tokenHash } })

    if (!existingToken || existingToken.expires_at < new Date()) {
      throw fastify.httpErrors.unauthorized('invalid_refresh_token')
    }

    if (existingToken.revoked_at) {
      // Token já rotacionado sendo reapresentado: sinal de replay/roubo — revoga toda a família.
      await fastify.prisma.refresh_tokens.updateMany({
        where: { family_id: existingToken.family_id, revoked_at: null },
        data: { revoked_at: new Date() }
      })
      throw fastify.httpErrors.unauthorized('refresh_token_reused')
    }

    return createSession(fastify, existingToken.user_id, existingToken.remember_me, {
      familyId: existingToken.family_id,
      supersedesTokenId: existingToken.id
    })
  })
}

export default refresh
