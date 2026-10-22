import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../helper'

const DASHBOARD_ORIGIN = 'http://localhost:5173'

test('cors headers are sent for the dashboard origin when NODE_ENV=development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)
  const res = await app.inject({
    url: '/areas/',
    headers: { origin: DASHBOARD_ORIGIN }
  })

  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['access-control-allow-origin'], DASHBOARD_ORIGIN)
})

test('cors preflight allows the write methods used by the dashboard', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)
  const res = await app.inject({
    method: 'OPTIONS',
    url: '/areas/',
    headers: {
      origin: DASHBOARD_ORIGIN,
      'access-control-request-method': 'POST'
    }
  })

  assert.equal(res.statusCode, 204)
  const allowed = res.headers['access-control-allow-methods']
  assert.ok(typeof allowed === 'string')
  for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
    assert.ok(allowed.includes(method), `${method} should be allowed`)
  }
})

test('cors headers are not sent for an unknown origin', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)
  const res = await app.inject({
    url: '/areas/',
    headers: { origin: 'http://evil.example.com' }
  })

  assert.equal(res.headers['access-control-allow-origin'], undefined)
})

test('cors is not enabled outside of development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'test'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)
  const res = await app.inject({
    url: '/areas/',
    headers: { origin: DASHBOARD_ORIGIN }
  })

  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['access-control-allow-origin'], undefined)
})
