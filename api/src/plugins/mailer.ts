import fp from 'fastify-plugin'
import type { FastifyBaseLogger } from 'fastify'
import { isDevelopment, isTestEmail } from '../utils/testAccount.js'

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type MailTransport = (message: MailMessage) => Promise<void>

export interface Mailer {
  /** Quem de fato entrega. Trocável nos testes (ver `test/helper.ts`). */
  transport: MailTransport;
  /** Enfileira o envio e volta na hora; falha vira log, nunca exceção. */
  send: (message: MailMessage) => void;
  /** Espera os envios em andamento terminarem (testes e encerramento). */
  flush: () => Promise<void>;
}

const DEFAULT_FROM = 'Codap <no-reply@gabrielreverso.dev.br>'
const RESEND_TIMEOUT_MS = 10_000

/**
 * Entrega pela API HTTP do Resend (sem dependência extra). Sem `RESEND_API_KEY`
 * nada sai: em desenvolvimento o corpo do e-mail vai para o log, para dar para
 * clicar no link sem uma conta de e-mail de verdade.
 */
function createResendTransport (log: FastifyBaseLogger): MailTransport {
  return async (message) => {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      if (isDevelopment()) {
        log.warn(`[mailer] RESEND_API_KEY ausente: e-mail para ${message.to} não enviado.\nAssunto: ${message.subject}\n${message.text}`)
      } else {
        log.error(`[mailer] RESEND_API_KEY ausente: e-mail para ${message.to} não enviado.`)
      }
      return
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || DEFAULT_FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS)
    })

    if (!response.ok) {
      throw new Error(`Resend respondeu ${response.status}: ${await response.text()}`)
    }
  }
}

/**
 * Expõe `fastify.mailer`. O envio nunca é aguardado pela rota: a latência do
 * provedor não pode aparecer na resposta (em `/auth/forgot-password` isso
 * revelaria se o e-mail está cadastrado) e uma falha do provedor não deve
 * derrubar um cadastro que já foi gravado.
 */
export default fp(async (fastify) => {
  const pending = new Set<Promise<void>>()

  const mailer: Mailer = {
    transport: createResendTransport(fastify.log),

    send (message) {
      const task = (async () => {
        // A conta de teste não tem caixa de entrada: nunca sai e-mail para ela.
        // Em desenvolvimento o texto (com o link) vai para o log, para dar para
        // exercitar confirmação e senha com ela de ponta a ponta.
        if (isTestEmail(message.to)) {
          fastify.log.info(
            isDevelopment()
              ? `[mailer] conta de teste, e-mail não enviado.\nAssunto: ${message.subject}\n${message.text}`
              : `[mailer] e-mail para a conta de teste ignorado (${message.subject}).`
          )
          return
        }
        await mailer.transport(message)
      })().catch((err: unknown) => {
        fastify.log.error({ err }, `[mailer] falha ao enviar "${message.subject}" para ${message.to}`)
      })

      pending.add(task)
      void task.finally(() => pending.delete(task))
    },

    async flush () {
      await Promise.all([...pending])
    }
  }

  fastify.decorate('mailer', mailer)
  fastify.addHook('onClose', async () => { await mailer.flush() })
})

declare module 'fastify' {
  export interface FastifyInstance {
    mailer: Mailer;
  }
}
