import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'
import { MASTER_XP } from '../../../src/utils/masterAccount'

type App = Awaited<ReturnType<typeof build>>

const PASSWORD = 'senha1234'

async function registerUser (app: App, isMaster: boolean) {
  const email = `master-${randomUUID()}@example.com`
  const res = await app.inject({ method: 'POST', url: '/auth/register', payload: { name: 'Master Test', email, password: PASSWORD } })
  const body = JSON.parse(res.payload)
  const userId = body.user.id as string
  // O flag só se liga direto no banco: nenhuma rota o escreve.
  if (isMaster) await app.prisma.users.update({ where: { id: userId }, data: { is_master: true } })

  return {
    email,
    userId,
    accessToken: body.accessToken as string,
    cleanup: async () => {
      await app.prisma.user_chest_lessons.deleteMany({ where: { user_id: userId } })
      await app.prisma.user_lessons.deleteMany({ where: { user_id: userId } })
      await app.prisma.user_achievements.deleteMany({ where: { user_id: userId } })
      await app.prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })
      await app.prisma.auth_tokens.deleteMany({ where: { user_id: userId } })
      await app.prisma.users.delete({ where: { id: userId } })
    }
  }
}

test('conta mestra: o login devolve o XP do nível máximo e o progresso vem completo', async (t) => {
  const app = await build(t)
  const user = await registerUser(app, true)
  t.after(user.cleanup)

  const login = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: user.email, password: PASSWORD } })
  assert.strictEqual(login.statusCode, 200)
  const loginBody = JSON.parse(login.payload)
  assert.strictEqual(loginBody.user.xp, MASTER_XP)
  assert.strictEqual('is_master' in loginBody.user, false, 'o flag nunca sai pela API')

  const [lessonCount, achievementCount, chestCount] = await Promise.all([
    app.prisma.lessons.count(),
    app.prisma.achievements.count(),
    app.prisma.lessons.count({ where: { is_chest: true } })
  ])

  const progress = await app.inject({
    method: 'GET',
    url: '/sync/progress',
    headers: { authorization: `Bearer ${loginBody.accessToken as string}` }
  })
  const progressBody = JSON.parse(progress.payload)
  assert.strictEqual(progressBody.lessons.length, lessonCount)
  assert.strictEqual(progressBody.achievements.length, achievementCount)
  assert.strictEqual(await app.prisma.user_chest_lessons.count({ where: { user_id: user.userId } }), chestCount)
})

test('conta mestra: chamar de novo não duplica nada (idempotente)', async (t) => {
  const app = await build(t)
  const user = await registerUser(app, true)
  t.after(user.cleanup)
  const headers = { authorization: `Bearer ${user.accessToken}` }

  const first = JSON.parse((await app.inject({ method: 'GET', url: '/sync/progress', headers })).payload)
  const second = JSON.parse((await app.inject({ method: 'GET', url: '/sync/progress', headers })).payload)
  assert.strictEqual(second.lessons.length, first.lessons.length)
  assert.strictEqual(await app.prisma.user_lessons.count({ where: { user_id: user.userId } }), first.lessons.length)
})

test('conta comum: nada é concedido', async (t) => {
  const app = await build(t)
  const user = await registerUser(app, false)
  t.after(user.cleanup)

  const progress = await app.inject({ method: 'GET', url: '/sync/progress', headers: { authorization: `Bearer ${user.accessToken}` } })
  const body = JSON.parse(progress.payload)
  assert.deepStrictEqual(body, { lessons: [], achievements: [] })
  const row = await app.prisma.users.findUniqueOrThrow({ where: { id: user.userId }, select: { xp: true } })
  assert.notStrictEqual(row.xp, MASTER_XP)
})
