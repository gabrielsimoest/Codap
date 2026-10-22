// Páginas simples abertas pelos links dos e-mails. O HTML é estático: o token
// é lido da query string no navegador (nunca interpolado aqui, então não há o
// que escapar) e enviado por `fetch` ao endpoint JSON correspondente. A
// confirmação exige um clique em vez de acontecer no GET, porque scanners de
// e-mail abrem os links sozinhos e gastariam o token de uso único.

const styles = `
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box;
         font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; background: #f3f4f6; color: #111827; }
  main { width: 100%; max-width: 420px; background: #ffffff; border-radius: 12px; padding: 32px; box-sizing: border-box; }
  h1 { margin: 0 0 12px; font-size: 22px; }
  p { margin: 0 0 16px; line-height: 1.5; }
  label { display: block; margin: 0 0 6px; font-size: 14px; font-weight: 600; }
  input { width: 100%; box-sizing: border-box; padding: 10px 12px; margin: 0 0 16px; font-size: 16px;
          border: 1px solid #d1d5db; border-radius: 8px; }
  button { width: 100%; padding: 12px; font-size: 16px; font-weight: 600; color: #ffffff; background: #6d28d9;
           border: 0; border-radius: 8px; cursor: pointer; }
  button:disabled { opacity: 0.6; cursor: default; }
  .msg { min-height: 1.5em; font-size: 14px; }
  .error { color: #b91c1c; }
  .ok { color: #047857; }
  @media (prefers-color-scheme: dark) {
    body { background: #111827; color: #f9fafb; }
    main { background: #1f2937; }
    input { background: #111827; color: #f9fafb; border-color: #4b5563; }
    .error { color: #fca5a5; }
    .ok { color: #6ee7b7; }
  }
`

function page (title: string, body: string, script: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${title}</title>
  <style>${styles}</style>
</head>
<body>
  <main>
    ${body}
  </main>
  <script>
    const token = new URLSearchParams(location.search).get('token')
    const msg = document.getElementById('msg')
    function show (text, kind) { msg.textContent = text; msg.className = 'msg ' + kind }
    async function post (url, payload) {
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, status: res.status, data }
    }
    ${script}
  </script>
</body>
</html>`
}

export const verifyEmailPage = page(
  'Confirmar e-mail — Codap',
  `<h1>Confirmar e-mail</h1>
    <p>Toque no botão para confirmar o e-mail da sua conta do Codap.</p>
    <button id="go" type="button">Confirmar e-mail</button>
    <p id="msg" class="msg" role="status"></p>`,
  `const go = document.getElementById('go')
    if (!token) { go.disabled = true; show('Link inválido. Peça um novo e-mail de confirmação pelo app.', 'error') }
    go.addEventListener('click', async () => {
      go.disabled = true
      show('Confirmando…', '')
      try {
        const { ok, status } = await post('/auth/verify-email', { token })
        if (ok) { go.hidden = true; show('E-mail confirmado! Já pode voltar para o app.', 'ok'); return }
        show(status === 429 ? 'Muitas tentativas. Aguarde um minuto e tente de novo.' : 'Este link é inválido, expirou ou já foi usado. Peça um novo e-mail de confirmação pelo app.', 'error')
      } catch { show('Não foi possível falar com o servidor. Tente de novo.', 'error') }
      go.disabled = false
    })`
)

export const resetPasswordPage = page(
  'Nova senha — Codap',
  `<h1>Criar nova senha</h1>
    <form id="form">
      <label for="password">Nova senha</label>
      <input id="password" type="password" autocomplete="new-password" minlength="8" required>
      <label for="confirm">Repita a nova senha</label>
      <input id="confirm" type="password" autocomplete="new-password" minlength="8" required>
      <button id="go" type="submit">Salvar nova senha</button>
    </form>
    <p id="msg" class="msg" role="status"></p>`,
  `const form = document.getElementById('form')
    const go = document.getElementById('go')
    if (!token) { go.disabled = true; show('Link inválido. Peça um novo link de redefinição pelo app.', 'error') }
    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      const password = document.getElementById('password').value
      if (password !== document.getElementById('confirm').value) { show('As senhas não são iguais.', 'error'); return }
      if (password.length < 8) { show('A senha precisa ter pelo menos 8 caracteres.', 'error'); return }
      go.disabled = true
      show('Salvando…', '')
      try {
        const { ok, status } = await post('/auth/reset-password', { token, password })
        if (ok) { form.hidden = true; show('Senha alterada! Já pode entrar no app com a nova senha.', 'ok'); return }
        show(status === 429 ? 'Muitas tentativas. Aguarde um minuto e tente de novo.' : 'Este link é inválido, expirou ou já foi usado. Peça um novo link de redefinição pelo app.', 'error')
      } catch { show('Não foi possível falar com o servidor. Tente de novo.', 'error') }
      go.disabled = false
    })`
)
