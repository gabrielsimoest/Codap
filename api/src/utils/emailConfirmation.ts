import { isDevelopment, isTestEmail } from './testAccount.js'

interface ConfirmableUser {
  email: string;
  email_verified_at: Date | null;
  created_at: Date;
}

/**
 * O e-mail da conta está confirmado? É a condição para qualquer coisa que use
 * o e-mail como prova de quem é a pessoa (redefinir ou trocar a senha): um
 * endereço digitado errado pode ser de um estranho, que receberia o link.
 *
 * A conta de teste não tem caixa de entrada, então em desenvolvimento ela conta
 * como confirmada — senão o fluxo de senha não poderia ser exercitado com ela
 * (o link vai para o log da API, ver plugins/mailer.ts). Fora de desenvolvimento
 * ela nem é aceita (ver utils/testAccount.ts).
 */
export function isEmailConfirmed (user: Pick<ConfirmableUser, 'email' | 'email_verified_at'>): boolean {
  return user.email_verified_at !== null || (isDevelopment() && isTestEmail(user.email))
}

/**
 * O valor de `email_verified_at` que a API mostra para o cliente. Igual ao da
 * coluna, exceto na conta de teste em desenvolvimento (linha antiga sem data):
 * devolve `created_at`, para o app não pedir confirmação de um e-mail que a API
 * já trata como confirmado.
 */
export function emailVerifiedAt (user: ConfirmableUser): Date | null {
  return user.email_verified_at ?? (isEmailConfirmed(user) ? user.created_at : null)
}
