import { test } from 'node:test'
import * as assert from 'node:assert'
import {
  BOOST_MINUTES,
  CHEST_PITY,
  CHEST_REFUND_BITS,
  SHOP_PRICES,
  rollChest
} from '../../src/utils/shop'

/** Um `random` que devolve os valores em ordem; estourar a lista é um erro de teste. */
function sequence (...values: number[]): () => number {
  let index = 0
  return () => {
    assert.ok(index < values.length, 'o sorteio pediu mais números aleatórios do que o teste previu')
    return values[index++]
  }
}

test('constants match the spec', () => {
  assert.deepEqual(SHOP_PRICES, { double_xp: 200, instant_hint: 300, chest: 500 })
  assert.equal(BOOST_MINUTES, 5)
  assert.equal(CHEST_REFUND_BITS, 250)
  assert.equal(CHEST_PITY, 2)
})

test('rollChest picks the category by weight (lesson 40, hint 25, double XP 20, Bits 15)', () => {
  const lessonIds = [7]
  const kindAt = (random: number) => rollChest({ lessonIds, missesInARow: 0, random: sequence(random, 0) }).kind

  assert.equal(kindAt(0), 'lesson')
  assert.equal(kindAt(0.39), 'lesson')
  assert.equal(kindAt(0.4), 'instant_hint')
  assert.equal(kindAt(0.64), 'instant_hint')
  assert.equal(kindAt(0.65), 'double_xp')
  assert.equal(kindAt(0.84), 'double_xp')
  assert.equal(kindAt(0.85), 'bits')
  assert.equal(kindAt(0.999), 'bits')
})

test('rollChest picks which remaining lesson with the second random number', () => {
  const lessonIds = [10, 20, 30]
  assert.deepEqual(rollChest({ lessonIds, missesInARow: 0, random: sequence(0, 0) }), { kind: 'lesson', lessonId: 10 })
  assert.deepEqual(rollChest({ lessonIds, missesInARow: 0, random: sequence(0, 0.5) }), { kind: 'lesson', lessonId: 20 })
  assert.deepEqual(rollChest({ lessonIds, missesInARow: 0, random: sequence(0, 0.999) }), { kind: 'lesson', lessonId: 30 })
})

test('rollChest pays the refund amount when the Bits drop comes up', () => {
  assert.deepEqual(rollChest({ lessonIds: [1], missesInARow: 0, random: sequence(0.9) }), { kind: 'bits', amount: CHEST_REFUND_BITS })
})

test('rollChest always gives a lesson after two misses in a row, whatever the random number', () => {
  const lessonIds = [10, 20]
  for (const first of [0, 0.5, 0.99]) {
    const roll = rollChest({ lessonIds, missesInARow: CHEST_PITY, random: sequence(first) })
    assert.equal(roll.kind, 'lesson')
  }
  // Com a garantia, só o sorteio da aula consome um número aleatório.
  assert.deepEqual(rollChest({ lessonIds, missesInARow: 5, random: sequence(0.5) }), { kind: 'lesson', lessonId: 20 })
})

test('rollChest never rolls a lesson when none is left, and the other weights cover 0..1', () => {
  const kindAt = (random: number) => rollChest({ lessonIds: [], missesInARow: 9, random: sequence(random) }).kind

  assert.equal(kindAt(0), 'instant_hint')
  assert.equal(kindAt(0.41), 'instant_hint') // 25 de 60
  assert.equal(kindAt(0.42), 'double_xp')
  assert.equal(kindAt(0.74), 'double_xp') // até 45 de 60
  assert.equal(kindAt(0.75), 'bits')
  assert.equal(kindAt(0.999), 'bits')
})
