import { randomBytes, createHash } from 'node:crypto'

// Valor aleatório de alta entropia — não é uma senha humana, então não faz
// sentido usar bcrypt aqui (ver api/CLAUDE.md, seção de autenticação).
export function generateRefreshToken (): string {
  return randomBytes(32).toString('base64url')
}

export function hashRefreshToken (token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
