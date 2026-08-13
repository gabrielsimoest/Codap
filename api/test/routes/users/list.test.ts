import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

test('GET /users lists users without exposing passwords', async (t) => {
  const app = await build(t)
  const email = `list-${randomUUID()}@example.com`

  const created = await app.prisma.users.create({
    data: { name: 'List Test', email, password: 'hashed-or-not-irrelevant-here' }
  })

  const res = await app.inject({ url: '/users' })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.equal(Array.isArray(body), true)

  const found = body.find((user: { id: string }) => user.id === created.id)
  assert.ok(found, 'created user should be present in the list')
  assert.equal('password' in found, false)

  await app.prisma.users.delete({ where: { id: created.id } })
})
