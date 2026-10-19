import { test } from 'node:test'
import * as assert from 'node:assert'
import { bitsToGrant } from '../../prisma/backfillBits'

test('bitsToGrant gives the Bits of every level the XP already covers', () => {
  assert.equal(bitsToGrant(300, 0), 200) // nível 6: 10 × (2 + 3 + 4 + 5 + 6)
  assert.equal(bitsToGrant(300, null), 200)
})

test('bitsToGrant never lowers an existing balance', () => {
  assert.equal(bitsToGrant(300, 500), 500)
  assert.equal(bitsToGrant(300, 200), 200)
})

test('bitsToGrant pays nothing below the first level', () => {
  assert.equal(bitsToGrant(10, 0), 0)
  assert.equal(bitsToGrant(0, 0), 0)
  assert.equal(bitsToGrant(null, null), 0)
})
