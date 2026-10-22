import type { MailMessage } from '../plugins/mailer.js'

// Templates provisórios: texto e layout simples, um único lugar para trocar
// quando o e-mail customizado entrar. Cada função devolve o `html` e o `text`
// (versão sem HTML, que também evita cair no spam).

function escapeHtml (value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

interface LayoutOptions {
  heading: string;
  paragraphs: string[];
  action?: { label: string, url: string };
  footnote?: string;
}

function renderHtml ({ heading, paragraphs, action, footnote }: LayoutOptions): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#1f2937;">${p}</p>`).join('')
  const button = action
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:12px 24px;background:#6d28d9;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">${escapeHtml(action.label)}</a></p>
       <p style="margin:0 0 16px;font-size:13px;line-height:20px;color:#6b7280;">Se o botão não funcionar, copie este endereço para o navegador:<br><a href="${escapeHtml(action.url)}" style="color:#6d28d9;word-break:break-all;">${escapeHtml(action.url)}</a></p>`
    : ''
  const note = footnote ? `<p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6b7280;">${footnote}</p>` : ''

  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 20px;font-size:22px;color:#111827;">${heading}</h1>
        ${body}
        ${button}
        ${note}
      </td></tr>
    </table>
  </body>
</html>`
}

function renderText ({ heading, paragraphs, action, footnote }: LayoutOptions, plain: { paragraphs: string[], footnote?: string }): string {
  return [
    heading,
    '',
    ...plain.paragraphs.flatMap((p) => [p, '']),
    ...(action ? [`${action.label}: ${action.url}`, ''] : []),
    ...(plain.footnote ? [plain.footnote] : footnote ? [footnote] : [])
  ].join('\n').trim()
}

interface Recipient {
  name: string;
  email: string;
}

export function verificationEmail (user: Recipient, url: string): MailMessage {
  const name = escapeHtml(user.name)
  const options: LayoutOptions = {
    heading: 'Confirme seu e-mail',
    paragraphs: [
      `Olá, ${name}! Falta só um passo para deixar sua conta do Codap pronta: confirmar que este e-mail é seu.`
    ],
    action: { label: 'Confirmar e-mail', url },
    footnote: 'O link vale por 24 horas. Se você não criou uma conta no Codap, é só ignorar esta mensagem.'
  }
  return {
    to: user.email,
    subject: 'Confirme seu e-mail no Codap',
    html: renderHtml(options),
    text: renderText(options, {
      paragraphs: [`Olá, ${user.name}! Falta só um passo para deixar sua conta do Codap pronta: confirmar que este e-mail é seu.`]
    })
  }
}

export function passwordResetEmail (user: Recipient, url: string): MailMessage {
  const name = escapeHtml(user.name)
  const options: LayoutOptions = {
    heading: 'Redefina sua senha',
    paragraphs: [
      `Olá, ${name}! Recebemos um pedido para redefinir a senha da sua conta no Codap.`
    ],
    action: { label: 'Criar nova senha', url },
    footnote: 'O link vale por 1 hora e só pode ser usado uma vez. Se não foi você quem pediu, ignore esta mensagem: sua senha continua a mesma.'
  }
  return {
    to: user.email,
    subject: 'Redefina sua senha do Codap',
    html: renderHtml(options),
    text: renderText(options, {
      paragraphs: [`Olá, ${user.name}! Recebemos um pedido para redefinir a senha da sua conta no Codap.`]
    })
  }
}

export function welcomeEmail (user: Recipient): MailMessage {
  const name = escapeHtml(user.name)
  const options: LayoutOptions = {
    heading: 'Bem-vindo ao Codap!',
    paragraphs: [
      `Olá, ${name}! Que bom ter você por aqui.`,
      'No Codap você aprende HTML, CSS e JavaScript em lições curtas, ganha XP e Bits e desbloqueia conquistas pelo caminho. Abra o app e continue de onde parou.'
    ],
    footnote: 'Bons estudos!'
  }
  return {
    to: user.email,
    subject: 'Bem-vindo ao Codap!',
    html: renderHtml(options),
    text: renderText(options, {
      paragraphs: [
        `Olá, ${user.name}! Que bom ter você por aqui.`,
        'No Codap você aprende HTML, CSS e JavaScript em lições curtas, ganha XP e Bits e desbloqueia conquistas pelo caminho. Abra o app e continue de onde parou.'
      ]
    })
  }
}

export function passwordChangedEmail (user: Recipient): MailMessage {
  const name = escapeHtml(user.name)
  const options: LayoutOptions = {
    heading: 'Sua senha foi alterada',
    paragraphs: [
      `Olá, ${name}! A senha da sua conta no Codap acabou de ser alterada, e você foi desconectado dos seus aparelhos.`,
      'Se foi você, não precisa fazer nada. Se não foi, peça já uma nova senha pela opção "Esqueci minha senha" na tela de entrada do app.'
    ],
    footnote: 'Por segurança, nunca pedimos sua senha por e-mail.'
  }
  return {
    to: user.email,
    subject: 'Sua senha do Codap foi alterada',
    html: renderHtml(options),
    text: renderText(options, {
      paragraphs: [
        `Olá, ${user.name}! A senha da sua conta no Codap acabou de ser alterada, e você foi desconectado dos seus aparelhos.`,
        'Se foi você, não precisa fazer nada. Se não foi, peça já uma nova senha pela opção "Esqueci minha senha" na tela de entrada do app.'
      ]
    })
  }
}
