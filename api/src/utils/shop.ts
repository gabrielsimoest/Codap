import type { ShopItem } from '../types/contracts.js'

// Regras da loja. Os preços moram aqui, no servidor: `GET /shop` os devolve e o
// app só os exibe (spec 2026-10-19-loja-e-bau-design.md).

export const SHOP_PRICES: Record<ShopItem, number> = {
  double_xp: 200,
  instant_hint: 300,
  chest: 500
}

/** Duração de uma janela de Dobro de XP. */
export const BOOST_MINUTES = 5

/**
 * Quantas lições uma janela de Dobro de XP dobra. O servidor confia no horário do
 * evento (é o que deixa uma lição offline valer o dobro), então quem atrasasse o
 * relógio do aparelho para dentro de uma janela vencida dobraria tudo; com o teto,
 * uma compra de 200 Bits rende no máximo isto, seja qual for o relógio. Em 5
 * minutos ninguém conclui mais lições do que isso.
 */
export const BOOST_MAX_LESSONS = 5

/** Quanto o baú devolve quando sorteia Bits (metade do preço). */
export const CHEST_REFUND_BITS = 250

/** Baús seguidos sem aula exclusiva depois dos quais o próximo é aula, se ainda houver. */
export const CHEST_PITY = 2

export type ChestRoll =
  | { kind: 'lesson'; lessonId: number }
  | { kind: 'instant_hint' }
  | { kind: 'double_xp' }
  | { kind: 'bits'; amount: number }

type ChestCategory = 'lesson' | 'instant_hint' | 'double_xp' | 'bits'

const CHEST_WEIGHTS: Array<[ChestCategory, number]> = [
  ['lesson', 40],
  ['instant_hint', 25],
  ['double_xp', 20],
  ['bits', 15]
]

function pickIndex (random: () => number, length: number): number {
  return Math.min(Math.floor(random() * length), length - 1)
}

/**
 * Sorteia o que um baú entrega. Pura: `random` devolve números em [0, 1) e é
 * injetado para o teste usar uma sequência fixa.
 *
 * - Com `missesInARow >= CHEST_PITY` e alguma aula restante, o resultado é aula
 *   (a garantia contra azar); só o sorteio de qual aula consome um número.
 * - Sem aulas restantes, o peso da aula sai e os outros se renormalizam.
 * - Escolhida a aula, um segundo número diz qual das restantes.
 */
export function rollChest ({ lessonIds, missesInARow, random }: {
  lessonIds: number[];
  missesInARow: number;
  random: () => number;
}): ChestRoll {
  if (lessonIds.length > 0 && missesInARow >= CHEST_PITY) {
    return { kind: 'lesson', lessonId: lessonIds[pickIndex(random, lessonIds.length)] }
  }

  const weights = lessonIds.length > 0 ? CHEST_WEIGHTS : CHEST_WEIGHTS.filter(([category]) => category !== 'lesson')
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  const point = random() * total

  let cumulative = 0
  let category = weights[weights.length - 1][0]
  for (const [candidate, weight] of weights) {
    cumulative += weight
    if (point < cumulative) {
      category = candidate
      break
    }
  }

  if (category === 'lesson') {
    return { kind: 'lesson', lessonId: lessonIds[pickIndex(random, lessonIds.length)] }
  }
  if (category === 'bits') {
    return { kind: 'bits', amount: CHEST_REFUND_BITS }
  }
  return { kind: category }
}

/**
 * Fonte de números aleatórios do baú. É um objeto, e não uma função solta, para
 * o teste poder trocá-la por uma sequência fixa; em produção é `Math.random`.
 */
export const chestRandom: { current: () => number } = { current: () => Math.random() }
