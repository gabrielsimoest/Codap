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
 * Cria uma nova sessão (access token assinado + refresh token persistido).
 * Quando `supersedesTokenId` é passado (rotação em /auth/refresh), a criação
 * do novo token e a revogação do antigo acontecem na mesma transação, para
 * nunca existir um estado intermediário com dois tokens válidos ao mesmo tempo.
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
    const created = await tx.refresh_tokens.create({
      data: {
        user_id: userId,
        token_hash: hashRefreshToken(rawRefreshToken),
        family_id: familyId,
        remember_me: rememberMe,
        device_info: options.deviceInfo,
        created_by_ip: options.createdByIp,
        expires_at: refreshTokenExpiresAt
      }
    })

    if (options.supersedesTokenId) {
      await tx.refresh_tokens.update({
        where: { id: options.supersedesTokenId },
        data: { revoked_at: new Date(), replaced_by_id: created.id }
      })
    }
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
