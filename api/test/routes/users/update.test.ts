import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

test('PATCH /users/:id updates the allowed fields', async (t) => {
  const app = await build(t)
  const email = `update-${randomUUID()}@example.com`

  const created = await app.prisma.users.create({
    data: { name: 'Update Test', email, password: 'irrelevant', xp: 0, dependabots: 0 }
  })

  const res = await app.inject({
    method: 'PATCH',
    url: `/users/${created.id}`,
    payload: { name: 'Updated Name', xp: 99 }
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.name, 'Updated Name')
  assert.equal(body.xp, 99)
  assert.equal(body.email, email)
  assert.equal('password' in body, false)

  await app.prisma.users.delete({ where: { id: created.id } })
})

test('PATCH /users/:id updates the password hash without exposing it', async (t) => {
  const app = await build(t)
  const email = `update-${randomUUID()}@example.com`

  const created = await app.prisma.users.create({
    data: { name: 'Password Update', email, password: 'original-hash' }
  })

  const res = await app.inject({
    method: 'PATCH',
    url: `/users/${created.id}`,
    payload: { password: 'novaSenha123' }
  })

  assert.equal(res.statusCode, 200)

  const updated = await app.prisma.users.findUnique({ where: { id: created.id } })
  assert.notEqual(updated?.password, 'original-hash')
  assert.notEqual(updated?.password, 'novaSenha123')

  await app.prisma.users.delete({ where: { id: created.id } })
})

test('PATCH /users/:id rejects changing the email to one already in use', async (t) => {
  const app = await build(t)
  const emailA = `update-${randomUUID()}@example.com`
  const emailB = `update-${randomUUID()}@example.com`

  const userA = await app.prisma.users.create({
    data: { name: 'User A', email: emailA, password: 'irrelevant' }
  })
  const userB = await app.prisma.users.create({
    data: { name: 'User B', email: emailB, password: 'irrelevant' }
  })

  const res = await app.inject({
    method: 'PATCH',
    url: `/users/${userB.id}`,
    payload: { email: emailA }
  })

  assert.equal(res.statusCode, 409)

  await app.prisma.users.delete({ where: { id: userA.id } })
  await app.prisma.users.delete({ where: { id: userB.id } })
})

test('PATCH /users/:id returns 404 for a non-existent user', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'PATCH',
    url: '/users/00000000-0000-0000-0000-000000000000',
    payload: { name: 'Nobody' }
  })

  assert.equal(res.statusCode, 404)
})

test('PATCH /users/:id rejects an empty body with 400', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'PATCH',
    url: '/users/00000000-0000-0000-0000-000000000000',
    payload: {}
  })

  assert.equal(res.statusCode, 400)
})
