import { test } from 'node:test'
import * as assert from 'node:assert'
import {
  MAX_LEVEL,
  LESSON_XP_REWARD,
  thresholdForLevel,
  levelForXp,
  progressInLevel,
  bitsForLevel,
  bitsEarnedBetween
} from '../../src/utils/levels'

test('constants match the spec', () => {
  assert.equal(MAX_LEVEL, 50)
  assert.equal(LESSON_XP_REWARD, 10)
})

test('thresholdForLevel returns the reference points of the curve', () => {
  assert.equal(thresholdForLevel(1), 0)
  assert.equal(thresholdForLevel(2), 54)
  assert.equal(thresholdForLevel(10), 519)
  assert.equal(thresholdForLevel(19), 1105)
  assert.equal(thresholdForLevel(30), 1911)
  assert.equal(thresholdForLevel(50), 3630)
})

test('thresholdForLevel is strictly increasing from level 1 to 50', () => {
  for (let level = 2; level <= MAX_LEVEL; level++) {
    assert.ok(thresholdForLevel(level) > thresholdForLevel(level - 1), `level ${level}`)
  }
})

test('thresholdForLevel clamps levels outside 1..MAX_LEVEL', () => {
  assert.equal(thresholdForLevel(0), 0)
  assert.equal(thresholdForLevel(-3), 0)
  assert.equal(thresholdForLevel(99), 3630)
})

test('levelForXp maps XP to the right level', () => {
  assert.equal(levelForXp(0), 1)
  assert.equal(levelForXp(53), 1)
  assert.equal(levelForXp(54), 2)
  assert.equal(levelForXp(550), 10) // trilha de HTML completa
  assert.equal(levelForXp(1160), 19) // HTML + CSS
  assert.equal(levelForXp(1920), 30) // trilha completa
  assert.equal(levelForXp(3630), 50)
  assert.equal(levelForXp(10000), 50)
})

test('levelForXp treats negative and NaN XP as level 1', () => {
  assert.equal(levelForXp(-5), 1)
  assert.equal(levelForXp(Number.NaN), 1)
})

test('progressInLevel at zero XP starts level 1 with an empty bar', () => {
  assert.deepEqual(progressInLevel(0), {
    level: 1,
    xpIntoLevel: 0,
    xpForNextLevel: 54,
    fraction: 0,
    isMax: false
  })
})

test('progressInLevel reports the position inside a level', () => {
  const progress = progressInLevel(100) // nível 2 vai de 54 a 110
  assert.equal(progress.level, 2)
  assert.equal(progress.xpIntoLevel, 46)
  assert.equal(progress.xpForNextLevel, 56)
  assert.equal(progress.isMax, false)
  assert.ok(Math.abs(progress.fraction - 46 / 56) < 1e-9)
})

test('progressInLevel at the maximum level has no next level and a full bar', () => {
  assert.deepEqual(progressInLevel(4000), {
    level: 50,
    xpIntoLevel: 370, // XP além do limiar do nível 50 (3630)
    xpForNextLevel: null,
    fraction: 1,
    isMax: true
  })
})

test('bitsForLevel pays 10 times the level from level 2', () => {
  assert.equal(bitsForLevel(1), 0)
  assert.equal(bitsForLevel(2), 20)
  assert.equal(bitsForLevel(10), 100)
})

test('bitsEarnedBetween sums the Bits of every level crossed', () => {
  assert.equal(bitsEarnedBetween(0, 54), 20)
  assert.equal(bitsEarnedBetween(0, 519), 540) // níveis 2 a 10
  assert.equal(bitsEarnedBetween(50, 60), 20) // cruza só o nível 2
})

test('bitsEarnedBetween pays nothing without a level change', () => {
  assert.equal(bitsEarnedBetween(53, 53), 0)
  assert.equal(bitsEarnedBetween(0, 0), 0)
  assert.equal(bitsEarnedBetween(100, 50), 0)
  assert.equal(bitsEarnedBetween(4000, 5000), 0) // já no nível máximo
})
