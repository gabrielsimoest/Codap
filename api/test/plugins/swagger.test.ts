import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../helper'

test('swagger docs are registered when NODE_ENV=development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)
  const res = await app.inject({ url: '/documentation/json' })

  assert.equal(res.statusCode, 200)
  const doc = JSON.parse(res.payload)
  assert.ok(doc.paths['/users/'], 'users routes should be documented')
})

test('swagger docs are not registered outside of development', async (t) => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'test'
  t.after(() => { process.env.NODE_ENV = previousEnv })

  const app = await build(t)
  const res = await app.inject({ url: '/documentation/json' })

  assert.equal(res.statusCode, 404)
})
