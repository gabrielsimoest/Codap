import { test } from 'node:test'
import * as assert from 'node:assert'
import {
  convertTheoryV1ToV2,
  convertTheoryV2ToV1,
  isLegacyTheory
} from '../../prisma/migrateTheoryV2'

const LEGACY = {
  firstParagraph: 'Primeiro.',
  secondParagraph: 'Segundo.',
  endParagraph: 'Final.',
  highlight: ['HTML'],
  codeLanguage: 'HTML',
  code: '<h1>Oi</h1>',
  additionalCode: [{ codeLanguage: 'CSS', code: 'h1 {}' }],
  onlyCode: true,
  noTerminal: true,
  terminalCode: 'console.log(1)',
  tutorial: false,
  campoDesconhecido: { qualquer: 'coisa' }
}

function converted (content: Record<string, unknown>, isFirst: boolean) {
  const result = convertTheoryV1ToV2(content, isFirst)
  assert.ok('content' in result, 'a conversão devia ter sucesso')
  return result.content
}

test('the first theory of a lesson becomes Cody and the others neutral', () => {
  assert.deepEqual((converted(LEGACY, true).introduction as { persona: string }).persona, 'cody')
  assert.deepEqual((converted(LEGACY, false).introduction as { persona: string }).persona, 'neutral')
})

test('legacy paragraphs map onto the semantic fields without rewriting any text', () => {
  const next = converted(LEGACY, true)
  assert.deepEqual(next.introduction, { text: 'Primeiro.', persona: 'cody' })
  assert.deepEqual(next.explanation, { text: 'Segundo.' })
  assert.equal(next.closing, 'Final.')
  for (const legacyKey of ['firstParagraph', 'secondParagraph', 'thirdParagraph', 'endParagraph']) {
    assert.equal(legacyKey in next, false, `${legacyKey} não pode sobrar`)
  }
})

test('titles are never invented', () => {
  const next = converted(LEGACY, true)
  assert.equal('title' in (next.introduction as object), false)
  assert.equal('title' in (next.explanation as object), false)
})

test('every other field survives untouched, unknown keys included', () => {
  const next = converted(LEGACY, false)
  for (const key of ['highlight', 'codeLanguage', 'code', 'additionalCode', 'onlyCode', 'noTerminal', 'terminalCode', 'tutorial', 'campoDesconhecido']) {
    assert.deepEqual(next[key], LEGACY[key as keyof typeof LEGACY], key)
  }
})

test('second and third paragraphs are joined into the explanation, keeping both', () => {
  const next = converted({ ...LEGACY, thirdParagraph: 'Terceiro.' }, true)
  assert.deepEqual(next.explanation, { text: 'Segundo.\n\nTerceiro.' })
})

test('absent paragraphs produce absent sections, not empty ones', () => {
  const next = converted({ firstParagraph: 'Só isto.', highlight: [], codeLanguage: 'CSS', code: 'a {}' }, false)
  assert.equal('explanation' in next, false)
  assert.equal('closing' in next, false)
})

test('a row without an introduction text is reported, not converted', () => {
  assert.deepEqual(convertTheoryV1ToV2({ firstParagraph: '   ', code: 'x' }, true), { issue: 'sem-texto-na-introducao' })
  assert.deepEqual(convertTheoryV1ToV2({ code: 'x' }, true), { issue: 'sem-texto-na-introducao' })
})

test('only the legacy shape is recognised, so the migration is idempotent', () => {
  assert.equal(isLegacyTheory(LEGACY), true)
  assert.equal(isLegacyTheory(converted(LEGACY, true)), false)
  assert.equal(isLegacyTheory({ question: 'Q', options: [] }), false)
  assert.equal(isLegacyTheory(null), false)
})

test('converting back reproduces the texts that were there', () => {
  const back = convertTheoryV2ToV1(converted(LEGACY, true))
  assert.equal(back.firstParagraph, LEGACY.firstParagraph)
  assert.equal(back.secondParagraph, LEGACY.secondParagraph)
  assert.equal(back.endParagraph, LEGACY.endParagraph)
  assert.deepEqual(back.additionalCode, LEGACY.additionalCode)
})
