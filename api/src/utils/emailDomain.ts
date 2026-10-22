import type { FastifyInstance } from 'fastify'
import { isDevelopment } from './testAccount.js'

// Domínios que quase certamente são um erro de digitação de um provedor
// conhecido. É uma lista curta e de alta confiança de propósito: um domínio
// com MX válido (`gmial.com` tem, é de quem registrou o erro) não seria
// pego por uma checagem de DNS, e recusar um domínio legítimo é pior do que
// deixar passar um erro raro.
const KNOWN_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.com.br': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'iclod.com': 'icloud.com',
  'icoud.com': 'icloud.com'
}

// Finais de domínio que não existem e quase sempre são `.com` ou `.com.br` mal digitados.
const TLD_TYPOS: Record<string, string> = {
  '.con': '.com',
  '.cmo': '.com',
  '.ocm': '.com',
  '.vom': '.com',
  '.xom': '.com',
  '.comm': '.com',
  '.com.b': '.com.br',
  '.com.rb': '.com.br',
  '.combr': '.com.br'
}

/** Devolve o e-mail corrigido se o domínio parece um erro de digitação, ou `null` se está tudo certo. */
export function suggestEmailCorrection (email: string): string | null {
  const at = email.lastIndexOf('@')
  if (at < 1) return null

  const local = email.slice(0, at)
  const domain = email.slice(at + 1).trim().toLowerCase()

  const known = KNOWN_TYPOS[domain]
  if (known) return `${local}@${known}`

  for (const [wrong, right] of Object.entries(TLD_TYPOS)) {
    if (domain.endsWith(wrong)) return `${local}@${domain.slice(0, -wrong.length)}${right}`
  }
  return null
}

/**
 * Mensagem de recusa quando o domínio parece errado, ou `null` para seguir.
 * **Só fora de desenvolvimento**: em dev o e-mail de teste e os de bancada não
 * precisam passar por isso, e a checagem barraria testes manuais.
 */
export function emailTypoMessage (email: string): string | null {
  if (isDevelopment()) return null
  const suggestion = suggestEmailCorrection(email)
  return suggestion ? `Este e-mail parece ter um erro de digitação. Você quis dizer ${suggestion}?` : null
}

/**
 * O erro 400 de domínio com cara de typo, ou `null` para seguir. Leva `code`
 * (`email_typo`) e `suggestion` (o e-mail corrigido), para o app mostrar a
 * mensagem no idioma da pessoa em vez de repassar o texto em português.
 */
export function emailTypoError (fastify: FastifyInstance, email: string): Error | null {
  const message = emailTypoMessage(email)
  if (message === null) return null
  return Object.assign(fastify.httpErrors.badRequest(message), {
    code: 'email_typo',
    suggestion: suggestEmailCorrection(email)
  })
}
