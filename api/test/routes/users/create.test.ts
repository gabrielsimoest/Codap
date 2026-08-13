import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

test('POST /users creates a user and never returns the password', async (t) => {
  const app = await build(t)
  const email = `create-${randomUUID()}@example.com`

  const res = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'Create Test', email, password: 'senha1234' }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.name, 'Create Test')
  assert.equal(body.email, email)
  assert.equal(body.xp, 0)
  assert.equal(body.dependabots, 0)
  assert.equal('password' in body, false)

  await app.prisma.users.delete({ where: { id: body.id } })
})

test('POST /users accepts optional xp/dependabots', async (t) => {
  const app = await build(t)
  const email = `create-${randomUUID()}@example.com`

  const res = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'Create Test', email, password: 'senha1234', xp: 42, dependabots: 3 }
  })

  assert.equal(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.equal(body.xp, 42)
  assert.equal(body.dependabots, 3)

  await app.prisma.users.delete({ where: { id: body.id } })
})

test('POST /users rejects a duplicate email with 409', async (t) => {
  const app = await build(t)
  const email = `create-${randomUUID()}@example.com`

  const first = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'First', email, password: 'senha1234' }
  })
  assert.equal(first.statusCode, 201)
  const created = JSON.parse(first.payload)

  const second = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'Second', email, password: 'outrasenha' }
  })
  assert.equal(second.statusCode, 409)

  await app.prisma.users.delete({ where: { id: created.id } })
})

test('POST /users rejects a body missing required fields with 400', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'No email or password' }
  })

  assert.equal(res.statusCode, 400)
})

test('POST /users rejects a password shorter than 8 characters with 400', async (t) => {
  const app = await build(t)
  const email = `create-${randomUUID()}@example.com`

  const res = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'Short Password', email, password: '123' }
  })

  assert.equal(res.statusCode, 400)
})
