import type { FastifyInstance } from 'fastify'
import { hasRecentAuthToken, issueAuthToken, type AuthTokenType } from './authToken.js'
import { isEmailConfirmed } from './emailConfirmation.js'
import { passwordChangedEmail, passwordResetEmail, verificationEmail, welcomeEmail } from './emailTemplates.js'
import { isDevelopment, isEmailAllowed } from './testAccount.js'

interface MailRecipient {
  id: string;
  name: string;
  email: string;
}

interface ConfirmableRecipient extends MailRecipient {
  email_verified_at: Date | null;
}

/**
 * `queued`: saiu para a fila de envio. `cooldown`: pedido repetido cedo demais.
 * `unverified`: a conta não tem o e-mail confirmado (só para a senha).
 * `skipped`: nada a mandar (conta de teste fora de desenvolvimento).
 * `failed`: não deu para preparar o e-mail (configuração ou banco), já registrado no log.
 */
export type MailRequestResult = 'queued' | 'cooldown' | 'unverified' | 'skipped' | 'failed'

/**
 * Base dos links dos e-mails: as páginas de confirmação e de nova senha são
 * servidas pela própria API (`routes/auth/pages.ts`), então é a URL pública
 * dela. Em desenvolvimento cai no `localhost`; fora dele a variável é
 * obrigatória, porque um link para `localhost` num e-mail real é um link morto.
 */
function publicBaseUrl (): string {
  const configured = process.env.PUBLIC_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')
  if (isDevelopment()) return 'http://localhost:3000'
  throw new Error('PUBLIC_URL não está definido. Configure-o no .env (ver .env.example).')
}

async function sendTokenEmail (
  fastify: FastifyInstance,
  user: MailRecipient,
  type: AuthTokenType,
  path: string,
  build: typeof verificationEmail
): Promise<MailRequestResult> {
  // A conta de teste só existe em desenvolvimento; fora dele não há o que mandar.
  // Em dev o token é emitido e o mailer põe o link no log (ver plugins/mailer.ts).
  if (!isEmailAllowed(user.email)) return 'skipped'

  try {
    // Falha de configuração antes de gerar o token, para não gravar um token sem link.
    const baseUrl = publicBaseUrl()
    if (await hasRecentAuthToken(fastify, user.id, type)) return 'cooldown'

    const token = await issueAuthToken(fastify, user.id, type)
    fastify.mailer.send(build(user, `${baseUrl}${path}?token=${encodeURIComponent(token)}`))
    return 'queued'
  } catch (err) {
    // Nunca propaga: um cadastro já gravado ou um "esqueci a senha" não pode
    // falhar (nem vazar se a conta existe) por causa do e-mail.
    fastify.log.error({ err }, `[auth] não foi possível preparar o e-mail de ${type}`)
    return 'failed'
  }
}

/** Gera um token novo e manda o link de confirmação de e-mail. */
export function sendVerificationEmail (fastify: FastifyInstance, user: MailRecipient): Promise<MailRequestResult> {
  return sendTokenEmail(fastify, user, 'email_verification', '/auth/verify-email', verificationEmail)
}

/**
 * Gera um token novo e manda o link de redefinição de senha — **só se o e-mail
 * da conta estiver confirmado**. Um endereço não confirmado pode ser um erro de
 * digitação que aponta para um estranho, e quem recebesse o link assumiria a
 * conta. Vale para os dois caminhos (`forgot-password` e a troca da conta logada).
 */
export async function sendPasswordResetEmail (fastify: FastifyInstance, user: ConfirmableRecipient): Promise<MailRequestResult> {
  if (!isEmailConfirmed(user)) return 'unverified'
  return await sendTokenEmail(fastify, user, 'password_reset', '/auth/reset-password', passwordResetEmail)
}

/** Avisa a conta de que a senha foi trocada, para quem não pediu a troca perceber. */
export function sendPasswordChangedEmail (fastify: FastifyInstance, user: MailRecipient): void {
  fastify.mailer.send(passwordChangedEmail(user))
}

/**
 * Manda o e-mail de boas-vindas uma única vez por conta. O `updateMany`
 * condicional em `welcome_sent_at: null` é a reivindicação: com dois logins
 * simultâneos só um deles vê `count === 1`.
 */
export async function sendWelcomeEmailOnce (fastify: FastifyInstance, user: MailRecipient): Promise<void> {
  try {
    const { count } = await fastify.prisma.users.updateMany({
      where: { id: user.id, welcome_sent_at: null },
      data: { welcome_sent_at: new Date() }
    })
    if (count === 1) fastify.mailer.send(welcomeEmail(user))
  } catch (err) {
    fastify.log.error({ err }, '[auth] não foi possível enviar o e-mail de boas-vindas')
  }
}
