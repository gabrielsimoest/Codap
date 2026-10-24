import { type FastifyInstance, type FastifyPluginAsync } from 'fastify'
import { createSession, RefreshTokenAlreadyRotatedError } from '../../utils/session.js'
import { hashRefreshToken } from '../../utils/refreshToken.js'
import { refreshBodySchema, refreshResponseSchema } from './auth.schema.js'

interface RefreshBody {
  refreshToken: string;
}

/**
 * Por quanto tempo depois de rotacionado um refresh token ainda é aceito como
 * "resposta perdida", em vez de reuso.
 *
 * Existe por causa de servidor lento (o Render gratuito dorme e acorda em mais de
 * 1 minuto): o app manda o `/auth/refresh`, desiste por tempo, e a API conclui a
 * rotação depois — o app fica com um token que já foi trocado e, sem tolerância,
 * a próxima tentativa revogaria a família e **deslogaria a pessoa**. É o
 * "reuse interval" do Auth0. Fora da janela, o reuso continua sendo tratado como
 * roubo: revoga a família inteira.
 */
export const REFRESH_REUSE_GRACE_MS = 5 * 60 * 1000

/** Quantos elos da cadeia `replaced_by_id` seguir (token antigo → sucessor → …) até achar o vigente. */
const MAX_CHAIN_STEPS = 5

async function revokeFamily (fastify: FastifyInstance, familyId: string): Promise<void> {
  await fastify.prisma.refresh_tokens.updateMany({
    where: { family_id: familyId, revoked_at: null },
    data: { revoked_at: new Date() }
  })
}

type RefreshTokenRow = NonNullable<Awaited<ReturnType<FastifyInstance['prisma']['refresh_tokens']['findUnique']>>>

/**
 * Para um token já revogado, acha o token vigente da mesma família seguindo a
 * cadeia de rotações — **só** enquanto cada revogação está dentro da janela e
 * foi uma rotação (`replaced_by_id`). Revogação de família ou de logout não deixa
 * `replaced_by_id`, então nunca "ressuscita" por aqui. Devolve `null` quando não
 * há o que tolerar (o chamador trata como reuso).
 */
async function findLiveSuccessor (fastify: FastifyInstance, token: RefreshTokenRow): Promise<RefreshTokenRow | null> {
  let current = token

  for (let step = 0; step < MAX_CHAIN_STEPS; step++) {
    if (!current.revoked_at || Date.now() - current.revoked_at.getTime() > REFRESH_REUSE_GRACE_MS) {
      return null
    }
    if (!current.replaced_by_id) {
      return null
    }

    const next = await fastify.prisma.refresh_tokens.findUnique({ where: { id: current.replaced_by_id } })
    if (!next || next.family_id !== token.family_id || next.expires_at < new Date()) {
      return null
    }
    if (!next.revoked_at) {
      return next
    }
    current = next
  }

  return null
}

const refresh: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: RefreshBody }>('/refresh', {
    config: {
      rateLimit: { max: 20, timeWindow: '1 minute' }
    },
    schema: {
      description:
        'Rotaciona o par de tokens a partir de um refresh token válido, revogando o anterior. Um token rotacionado há menos de 5 minutos e reapresentado (resposta perdida por lentidão ou queda) é tolerado: devolve um par novo a partir do token vigente da família. Fora dessa janela, o reuso revoga toda a família.',
      tags: ['auth'],
      body: refreshBodySchema,
      response: {
        200: refreshResponseSchema,
        401: { type: 'object', description: 'Refresh token inválido, expirado ou reutilizado fora da janela de tolerância (o que revoga toda a família de tokens).' }
      }
    }
  }, async (request) => {
    const { refreshToken } = request.body
    const tokenHash = hashRefreshToken(refreshToken)

    const found = await fastify.prisma.refresh_tokens.findUnique({ where: { token_hash: tokenHash } })

    if (!found || found.expires_at < new Date()) {
      throw fastify.httpErrors.unauthorized('invalid_refresh_token')
    }

    let candidate: RefreshTokenRow = found
    const familyId = found.family_id

    // Duas rotações concorrentes do mesmo token (o app que desiste e tenta de
    // novo, enquanto a primeira ainda roda) fazem a segunda perder a corrida:
    // ela relê o estado e segue a cadeia até o token vigente. Poucas voltas bastam.
    for (let attempt = 0; attempt < MAX_CHAIN_STEPS; attempt++) {
      const head: RefreshTokenRow | null = candidate.revoked_at
        ? await findLiveSuccessor(fastify, candidate)
        : candidate

      if (!head) {
        // Token revogado fora da janela (ou sem rotação por trás): replay/roubo — revoga toda a família.
        await revokeFamily(fastify, familyId)
        throw fastify.httpErrors.unauthorized('refresh_token_reused')
      }

      try {
        return await createSession(fastify, head.user_id, head.remember_me, {
          familyId,
          supersedesTokenId: head.id
        })
      } catch (error) {
        if (!(error instanceof RefreshTokenAlreadyRotatedError)) {
          throw error
        }
        // Outra requisição rotacionou `head` primeiro: relê e tenta de novo.
        const reread: RefreshTokenRow | null = await fastify.prisma.refresh_tokens.findUnique({ where: { id: head.id } })
        if (!reread) {
          throw fastify.httpErrors.unauthorized('invalid_refresh_token')
        }
        candidate = reread
      }
    }

    await revokeFamily(fastify, familyId)
    throw fastify.httpErrors.unauthorized('refresh_token_reused')
  })
}

export default refresh
