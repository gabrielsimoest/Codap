import { test } from 'node:test'
import * as assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { build } from '../../helper'

test('GET /areas lists areas with their name', async (t) => {
  const app = await build(t)

  const name = `Test Area ${randomUUID()}`
  const area = await app.prisma.areas.create({ data: { name } })

  t.after(async () => {
    await app.prisma.areas.delete({ where: { id: area.id } })
  })

  const res = await app.inject({ url: '/areas' })
  assert.equal(res.statusCode, 200)

  const body = JSON.parse(res.payload)
  assert.ok(Array.isArray(body), 'response should be an array')

  const found = body.find((a: { id: number }) => a.id === area.id)
  assert.ok(found, 'created area should be present in the list')
  assert.equal(found.name, name)
  assert.deepEqual(Object.keys(found).sort(), ['id', 'name'])
})

test('GET /areas returns areas ordered by id ascending', async (t) => {
  const app = await build(t)

  const first = await app.prisma.areas.create({ data: { name: `A ${randomUUID()}` } })
  const second = await app.prisma.areas.create({ data: { name: `B ${randomUUID()}` } })

  t.after(async () => {
    await app.prisma.areas.deleteMany({ where: { id: { in: [first.id, second.id] } } })
  })

  const res = await app.inject({ url: '/areas' })
  assert.equal(res.statusCode, 200)

  const body = JSON.parse(res.payload)
  const ids = body.map((a: { id: number }) => a.id)
  assert.deepEqual([...ids].sort((a: number, b: number) => a - b), ids)
  assert.ok(ids.indexOf(first.id) < ids.indexOf(second.id))
})

test('GET /areas ignores a locale querystring (areas are not translated)', async (t) => {
  const app = await build(t)

  const res = await app.inject({ url: '/areas?locale=pt' })
  assert.equal(res.statusCode, 200)
  assert.ok(Array.isArray(JSON.parse(res.payload)))
})
