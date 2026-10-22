import { test } from 'node:test'
import * as assert from 'node:assert'
import { build, outboxOf, withNodeEnv as inEnv } from '../../helper'
import { TEST_EMAIL } from '../../../src/utils/testAccount'

type App = Awaited<ReturnType<typeof build>>

async function removeTestUser (app: App) {
  const user = await app.prisma.users.findUnique({ where: { email: TEST_EMAIL } })
  if (!user) return
  await app.prisma.refresh_tokens.deleteMany({ where: { user_id: user.id } })
  await app.prisma.users.delete({ where: { id: user.id } })
}

test('the test account cannot register or reset its password outside development', async (t) => {
  const app = await build(t)
  // A conta de teste real pode existir neste banco; o que importa é que o cadastro não a duplica nem a altera.
  const before = await app.prisma.users.findUnique({ where: { email: TEST_EMAIL } })

  for (const nodeEnv of [undefined, 'production']) {
    const register = await inEnv(nodeEnv, () => app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'Teste', email: TEST_EMAIL, password: 'senha1234' }
    }))
    assert.equal(register.statusCode, 400, `register com NODE_ENV=${nodeEnv}`)
    assert.match(JSON.parse(register.payload).message, /não pode ser usado/)

    const login = await inEnv(nodeEnv, () => app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: TEST_EMAIL, password: 'senha1234' }
    }))
    assert.equal(login.statusCode, 401, `login com NODE_ENV=${nodeEnv}`)
  }

  const after = await app.prisma.users.findUnique({ where: { email: TEST_EMAIL } })
  assert.equal(after?.id, before?.id)
  assert.equal(after?.password, before?.password)
})

test('the test account is accepted only in development, already verified and without any email', async (t) => {
  const app = await build(t)

  // Não mexe numa conta de teste que alguém já use neste banco: o cadastro em
  // desenvolvimento só precisa mostrar que o e-mail não é recusado (409, não 400).
  if (await app.prisma.users.findUnique({ where: { email: TEST_EMAIL } })) {
    const register = await inEnv('development', () => app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'Teste', email: TEST_EMAIL, password: 'senha1234' }
    }))
    assert.equal(register.statusCode, 409)
    t.diagnostic(`${TEST_EMAIL} já existe no banco: o fluxo completo (cadastro confirmado, login e sem e-mails) não foi exercitado`)
    return
  }

  try {
    const register = await inEnv('development', () => app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'Teste', email: TEST_EMAIL, password: 'senha1234' }
    }))
    assert.equal(register.statusCode, 201)
    assert.ok(JSON.parse(register.payload).user.email_verified_at, 'nasce com o e-mail confirmado')

    const devLogin = await inEnv('development', () => app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: TEST_EMAIL, password: 'senha1234' }
    }))
    assert.equal(devLogin.statusCode, 200)

    // Mesmo com a linha no banco e a senha certa, fora de desenvolvimento é recusada.
    for (const nodeEnv of [undefined, 'production']) {
      const login = await inEnv(nodeEnv, () => app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: TEST_EMAIL, password: 'senha1234' }
      }))
      assert.equal(login.statusCode, 401, `login com NODE_ENV=${nodeEnv}`)
    }

    // Em desenvolvimento ela também não recebe nenhum e-mail (confirmação, boas-vindas, redefinição).
    await inEnv('development', () => app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: TEST_EMAIL } }))
    await app.mailer.flush()
    assert.equal(outboxOf(app).length, 0)
  } finally {
    await removeTestUser(app)
  }
})
