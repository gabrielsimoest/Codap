import { type Prisma, type PrismaClient } from '../generated/prisma/client.js'
import type { ChestAreaCount, ShopStateResponse } from '../types/contracts.js'
import { SHOP_PRICES } from './shop.js'

type Client = Prisma.TransactionClient | PrismaClient

/**
 * O estado da loja de um usuário: saldo, estoque de dicas, a janela de Dobro de
 * XP que ainda não terminou e a contagem das aulas do baú por área.
 *
 * Aceita um cliente de transação: a compra o chama dentro da própria transação
 * para devolver o estado já com a cobrança e o efeito aplicados. `xp`/`bits`
 * são `Int?` no banco, então um saldo nulo conta como 0.
 */
export async function buildShopState (client: Client, userId: string, now = new Date()): Promise<ShopStateResponse> {
  const user = await client.users.findUniqueOrThrow({
    where: { id: userId },
    select: { bits: true, instant_hints: true, chest_misses: true }
  })

  const boost = await client.xp_boosts.aggregate({
    where: { user_id: userId, ends_at: { gt: now } },
    _max: { ends_at: true }
  })

  return {
    prices: { ...SHOP_PRICES },
    bits: user.bits ?? 0,
    instantHints: user.instant_hints,
    doubleXpEndsAt: boost._max.ends_at?.toISOString() ?? null,
    chest: {
      missesInARow: user.chest_misses,
      areas: await chestAreaCounts(client, userId)
    }
  }
}

/** Quantas aulas do baú cada área tem e quantas o usuário já revelou (só áreas que têm alguma). */
async function chestAreaCounts (client: Client, userId: string): Promise<ChestAreaCount[]> {
  const chestLessons = await client.lessons.findMany({
    where: { is_chest: true },
    select: { id: true, module: { select: { area_id: true } } }
  })
  const revealed = await client.user_chest_lessons.findMany({
    where: { user_id: userId },
    select: { lesson_id: true }
  })
  const revealedIds = new Set(revealed.map((row) => row.lesson_id))

  const byArea = new Map<number, ChestAreaCount>()
  for (const lesson of chestLessons) {
    const areaId = lesson.module.area_id
    const count = byArea.get(areaId) ?? { areaId, total: 0, revealed: 0 }
    count.total += 1
    if (revealedIds.has(lesson.id)) {
      count.revealed += 1
    }
    byArea.set(areaId, count)
  }

  return [...byArea.values()].sort((a, b) => a.areaId - b.areaId)
}
