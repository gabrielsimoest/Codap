import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

test('DELETE /users/:id removes the user', async (t) => {
  const app = await build(t)
  const email = `remove-${randomUUID()}@example.com`

  const created = await app.prisma.users.create({
    data: { name: 'Remove Test', email, password: 'irrelevant' }
  })

  const res = await app.inject({ method: 'DELETE', url: `/users/${created.id}` })
  assert.equal(res.statusCode, 204)

  const stillThere = await app.prisma.users.findUnique({ where: { id: created.id } })
  assert.equal(stillThere, null)
})

test('DELETE /users/:id returns 404 for a non-existent user', async (t) => {
  const app = await build(t)

  const res = await app.inject({ method: 'DELETE', url: '/users/00000000-0000-0000-0000-000000000000' })

  assert.equal(res.statusCode, 404)
})

test('DELETE /users/:id returns 400 for a malformed id', async (t) => {
  const app = await build(t)

  const res = await app.inject({ method: 'DELETE', url: '/users/not-a-valid-uuid' })

  assert.equal(res.statusCode, 400)
})
