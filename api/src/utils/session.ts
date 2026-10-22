import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { generateRefreshToken, hashRefreshToken } from './refreshToken.js'

const ACCESS_TOKEN_TTL_MINUTES = 15
const REFRESH_TOKEN_TTL_DAYS = { default: 7, rememberMe: 60 }

export interface SessionTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface CreateSessionOptions {
  familyId?: string;
  supersedesTokenId?: string;
  deviceInfo?: string;
  createdByIp?: string;
}

/**
 * O token de `supersedesTokenId` já tinha sido revogado quando esta rotação
 * tentou revogá-lo — outra requisição concorrente rotacionou primeiro. Quem
 * chama trata como reuso (ver routes/auth/refresh.ts).
 */
export class RefreshTokenAlreadyRotatedError extends Error {
  constructor () {
    super('refresh_token_already_rotated')
    this.name = 'RefreshTokenAlreadyRotatedError'
  }
}

/**
 * Cria uma nova sessão (access token assinado + refresh token persistido).
 * Quando `supersedesTokenId` é passado (rotação em /auth/refresh), a revogação
 * do antigo e a criação do novo acontecem na mesma transação, nessa ordem, e
 * a revogação é condicional (`revoked_at: null`). Com duas rotações
 * concorrentes do mesmo token, a segunda espera o lock da linha, reavalia a
 * condição depois do commit da primeira, não atualiza nada e lança
 * `RefreshTokenAlreadyRotatedError` — então nunca existem dois tokens válidos
 * na mesma família.
 */
export async function createSession (
  fastify: FastifyInstance,
  userId: string,
  rememberMe: boolean,
  options: CreateSessionOptions = {}
): Promise<SessionTokens> {
  const ttlDays = rememberMe ? REFRESH_TOKEN_TTL_DAYS.rememberMe : REFRESH_TOKEN_TTL_DAYS.default
  const refreshTokenExpiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000)
  const rawRefreshToken = generateRefreshToken()
  const familyId = options.familyId ?? randomUUID()

  await fastify.prisma.$transaction(async (tx) => {
    // Id gerado aqui para gravar `replaced_by_id` já na revogação, antes do insert.
    const newTokenId = randomUUID()

    if (options.supersedesTokenId) {
      const { count } = await tx.refresh_tokens.updateMany({
        where: { id: options.supersedesTokenId, revoked_at: null },
        data: { revoked_at: new Date(), replaced_by_id: newTokenId }
      })
      if (count === 0) {
        throw new RefreshTokenAlreadyRotatedError()
      }
    }

    await tx.refresh_tokens.create({
      data: {
        id: newTokenId,
        user_id: userId,
        token_hash: hashRefreshToken(rawRefreshToken),
        family_id: familyId,
        remember_me: rememberMe,
        device_info: options.deviceInfo,
        created_by_ip: options.createdByIp,
        expires_at: refreshTokenExpiresAt
      }
    })
  })

  const accessToken = await fastify.jwt.sign({ id: userId }, { expiresIn: `${ACCESS_TOKEN_TTL_MINUTES}m` })
  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MINUTES * 60 * 1000)

  return {
    accessToken,
    accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
    refreshToken: rawRefreshToken,
    refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString()
  }
}
