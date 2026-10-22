import type { FastifyInstance } from 'fastify'
import { generateRefreshToken, hashRefreshToken } from './refreshToken.js'

export type AuthTokenType = 'email_verification' | 'password_reset'

export const AUTH_TOKEN_TTL_MS: Record<AuthTokenType, number> = {
  email_verification: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000
}

/** Intervalo mínimo entre dois e-mails do mesmo tipo para a mesma conta. */
export const AUTH_TOKEN_COOLDOWN_MS = 60 * 1000

// Aceita tanto o client quanto o `tx` de uma transação interativa.
type PrismaLike = Pick<FastifyInstance['prisma'], 'auth_tokens'>

/**
 * Gera um token de uso único para o usuário e devolve o valor bruto, que só
 * existe no link do e-mail — no banco fica o hash SHA-256 (é um segredo de
 * alta entropia, o mesmo raciocínio do refresh token). Tokens anteriores ainda
 * não usados do mesmo tipo são apagados: só o link mais recente vale.
 */
export async function issueAuthToken (
  fastify: FastifyInstance,
  userId: string,
  type: AuthTokenType
): Promise<string> {
  const rawToken = generateRefreshToken()

  await fastify.prisma.$transaction([
    fastify.prisma.auth_tokens.deleteMany({ where: { user_id: userId, type, used_at: null } }),
    fastify.prisma.auth_tokens.create({
      data: {
        user_id: userId,
        type,
        token_hash: hashRefreshToken(rawToken),
        expires_at: new Date(Date.now() + AUTH_TOKEN_TTL_MS[type])
      }
    })
  ])

  return rawToken
}

/** A conta já pediu um token desse tipo há menos de `AUTH_TOKEN_COOLDOWN_MS`? */
export async function hasRecentAuthToken (
  fastify: FastifyInstance,
  userId: string,
  type: AuthTokenType
): Promise<boolean> {
  const recent = await fastify.prisma.auth_tokens.findFirst({
    where: { user_id: userId, type, created_at: { gt: new Date(Date.now() - AUTH_TOKEN_COOLDOWN_MS) } },
    select: { id: true }
  })
  return recent !== null
}

/**
 * Consome um token: devolve o `user_id` dono dele ou `null` se o token não
 * existe, é de outro tipo, expirou ou já foi usado. O `updateMany` condicional
 * (`used_at: null`) é o que garante uso único mesmo com dois cliques
 * simultâneos — o segundo não atualiza nada. Chame dentro da transação que
 * aplica o efeito do token, para uma falha depois dele devolver o token.
 */
export async function consumeAuthToken (
  prisma: PrismaLike,
  rawToken: string,
  type: AuthTokenType
): Promise<string | null> {
  const record = await prisma.auth_tokens.findUnique({
    where: { token_hash: hashRefreshToken(rawToken) },
    select: { id: true, user_id: true, type: true }
  })
  if (!record || record.type !== type) return null

  const { count } = await prisma.auth_tokens.updateMany({
    where: { id: record.id, used_at: null, expires_at: { gt: new Date() } },
    data: { used_at: new Date() }
  })

  return count === 1 ? record.user_id : null
}
