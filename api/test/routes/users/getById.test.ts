import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

test('GET /users/:id returns the user without the password', async (t) => {
  const app = await build(t)
  const email = `getbyid-${randomUUID()}@example.com`

  const created = await app.prisma.users.create({
    data: { name: 'Get Test', email, password: 'irrelevant' }
  })

  const res = await app.inject({ url: `/users/${created.id}` })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(body.id, created.id)
  assert.equal(body.email, email)
  assert.equal('password' in body, false)

  await app.prisma.users.delete({ where: { id: created.id } })
})

test('GET /users/:id returns 404 for a non-existent user', async (t) => {
  const app = await build(t)

  const res = await app.inject({ url: '/users/00000000-0000-0000-0000-000000000000' })

  assert.equal(res.statusCode, 404)
})

test('GET /users/:id returns 400 for a malformed id', async (t) => {
  const app = await build(t)

  const res = await app.inject({ url: '/users/not-a-valid-uuid' })

  assert.equal(res.statusCode, 400)
})
