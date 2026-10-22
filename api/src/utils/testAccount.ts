/**
 * Conta de teste local. Existe só em desenvolvimento (`NODE_ENV=development`):
 * lá ela se cadastra e entra normalmente, nasce com o e-mail já confirmado e
 * nunca recebe e-mail de verdade. Em qualquer outro ambiente (produção, e o
 * `NODE_ENV` indefinido dos testes) o login e o cadastro com ela são recusados,
 * mesmo que a linha exista no banco — que é o mesmo Neon nos dois ambientes.
 */
export const TEST_EMAIL = 'teste@teste.com'

export function isDevelopment (): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isTestEmail (email: string): boolean {
  return email.trim().toLowerCase() === TEST_EMAIL
}

/** A conta de teste só é aceita em desenvolvimento; qualquer outro e-mail passa. */
export function isEmailAllowed (email: string): boolean {
  return !isTestEmail(email) || isDevelopment()
}
