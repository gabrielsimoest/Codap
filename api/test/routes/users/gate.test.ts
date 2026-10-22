import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

// O CRUD de `users` não tem autenticação e nenhum cliente o usa (o app cria e
// lê a conta por /auth). Aberto, qualquer pessoa listaria e-mails, trocaria a
// senha ou o e-mail de outra conta, apagaria contas e escreveria XP e Bits —
// agora que Bits são gastáveis. Por isso, como o resto da escrita sensível,
// só existe em desenvolvimento.
test('the users resource does not exist outside development', async (t) => {
  const app = await build(t)
  const id = randomUUID()

  const requests = [
    { method: 'GET', url: '/users' },
    { method: 'GET', url: `/users/${id}` },
    { method: 'POST', url: '/users', payload: { name: 'X', email: `${id}@example.com`, password: 'senha1234' } },
    { method: 'PATCH', url: `/users/${id}`, payload: { bits: 999999 } },
    { method: 'DELETE', url: `/users/${id}` }
  ] as const

  for (const request of requests) {
    const res = await app.inject(request)
    assert.equal(res.statusCode, 404, `${request.method} ${request.url} deveria ser 404`)
  }
})
