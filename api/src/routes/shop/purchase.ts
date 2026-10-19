import { type FastifyPluginAsync } from 'fastify'
import { type Prisma } from '../../generated/prisma/client.js'
import type { ChestOutcome, LocaleCode, PurchaseBody, PurchaseResponse } from '../../types/contracts.js'
import { BOOST_MINUTES, SHOP_PRICES, chestRandom, rollChest } from '../../utils/shop.js'
import { buildShopState } from '../../utils/shopState.js'
import { purchaseBodySchema, purchaseResponseSchema, shopErrorSchema } from './shop.schema.js'

class InsufficientBitsError extends Error {}
class BoostActiveError extends Error {}

const MINUTE_MS = 60 * 1000

const purchase: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: PurchaseBody }>('/purchase', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 20, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Compra um item da loja com Bits. Tudo acontece numa transação, com o usuário travado (`FOR UPDATE`) e a cobrança como um decremento condicional (`bits >= preço`): saldo insuficiente é 402 `insufficient_bits` (com o saldo atual) e nada é cobrado nem entregue. `double_xp` com uma janela ativa é 409 `boost_active`. O `chest` sorteia no servidor uma aula exclusiva ainda não revelada (40%), uma dica instantânea (25%), um Dobro de XP (20%) ou 250 Bits (15%), com a garantia de uma aula depois de 2 baús seguidos sem aula; o resultado vem em `chest`, e `locale` escolhe o idioma do nome da aula. Exige internet de propósito: gastar saldo offline obrigaria a desfazer compras quando o servidor discordasse.',
      tags: ['shop'],
      body: purchaseBodySchema,
      response: {
        200: purchaseResponseSchema,
        400: shopErrorSchema,
        401: { type: 'object', description: 'Access token ausente ou inválido.' },
        402: shopErrorSchema,
        409: shopErrorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { item, locale = 'pt' } = request.body

    try {
      return await fastify.prisma.$transaction(async (tx): Promise<PurchaseResponse> => {
        // Serializa as compras do mesmo usuário: sem isto, duas requisições
        // simultâneas poderiam validar o mesmo estado (a janela ativa, ou as
        // aulas do baú que ainda restam, por exemplo).
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`
        await tx.users.updateMany({ where: { id: userId, bits: null }, data: { bits: 0 } })

        const now = new Date()

        if (item === 'double_xp') {
          const active = await tx.xp_boosts.findFirst({ where: { user_id: userId, ends_at: { gt: now } } })
          if (active) {
            throw new BoostActiveError()
          }
        }

        const price = SHOP_PRICES[item]
        const charged = await tx.users.updateMany({
          where: { id: userId, bits: { gte: price } },
          data: { bits: { decrement: price } }
        })
        if (charged.count === 0) {
          throw new InsufficientBitsError()
        }

        let chest: ChestOutcome | undefined
        if (item === 'chest') {
          chest = await openChest(tx, userId, locale, now)
        } else if (item === 'instant_hint') {
          await tx.users.update({ where: { id: userId }, data: { instant_hints: { increment: 1 } } })
        } else {
          await openBoostWindow(tx, userId, now)
        }

        const state = await buildShopState(tx, userId, now)
        return {
          item,
          bits: state.bits,
          instantHints: state.instantHints,
          doubleXpEndsAt: state.doubleXpEndsAt,
          ...(chest ? { chest } : {})
        }
      }, { timeout: 15_000, maxWait: 5_000 })
    } catch (error) {
      if (error instanceof InsufficientBitsError) {
        const { bits } = await fastify.prisma.users.findUniqueOrThrow({ where: { id: userId }, select: { bits: true } })
        return await reply.code(402).send({
          statusCode: 402,
          error: 'Payment Required',
          message: 'insufficient_bits',
          bits: bits ?? 0
        })
      }
      if (error instanceof BoostActiveError) {
        throw fastify.httpErrors.conflict('boost_active')
      }
      throw error
    }
  })
}

/**
 * Abre uma janela de Dobro de XP de `BOOST_MINUTES`. Começa agora, ou — se já há
 * uma janela ativa (um baú pode sortear o dobro com uma em andamento) — logo
 * quando ela termina, para as duas não se sobreporem nem deixarem buraco.
 */
async function openBoostWindow (tx: Prisma.TransactionClient, userId: string, now: Date): Promise<Date> {
  const last = await tx.xp_boosts.aggregate({
    where: { user_id: userId, ends_at: { gt: now } },
    _max: { ends_at: true }
  })
  const startsAt = last._max.ends_at ?? now
  const endsAt = new Date(startsAt.getTime() + BOOST_MINUTES * MINUTE_MS)

  await tx.xp_boosts.create({ data: { user_id: userId, starts_at: startsAt, ends_at: endsAt } })
  return endsAt
}

/**
 * Sorteia e entrega o que um baú já cobrado dá. O usuário está travado pela
 * transação, então duas aberturas simultâneas nunca enxergam as mesmas aulas
 * restantes (e a restrição única de `user_chest_lessons` é só a rede de
 * segurança).
 */
async function openChest (
  tx: Prisma.TransactionClient,
  userId: string,
  locale: LocaleCode,
  now: Date
): Promise<ChestOutcome> {
  const user = await tx.users.findUniqueOrThrow({ where: { id: userId }, select: { chest_misses: true } })
  const revealed = await tx.user_chest_lessons.findMany({ where: { user_id: userId }, select: { lesson_id: true } })
  const remaining = await tx.lessons.findMany({
    where: { is_chest: true, id: { notIn: revealed.map((row) => row.lesson_id) } },
    orderBy: { id: 'asc' },
    select: { id: true }
  })

  const roll = rollChest({
    lessonIds: remaining.map((lesson) => lesson.id),
    missesInARow: user.chest_misses,
    random: () => chestRandom.current()
  })

  if (roll.kind === 'lesson') {
    await tx.user_chest_lessons.create({ data: { user_id: userId, lesson_id: roll.lessonId } })
    await tx.users.update({ where: { id: userId }, data: { chest_misses: 0 } })

    const lesson = await tx.lessons.findUniqueOrThrow({
      where: { id: roll.lessonId },
      select: {
        id: true,
        module: { select: { id: true, area_id: true } },
        translations: { where: { locale: { locale } }, select: { name: true }, take: 1 }
      }
    })
    return {
      kind: 'lesson',
      lesson: {
        id: lesson.id,
        moduleId: lesson.module.id,
        areaId: lesson.module.area_id,
        name: lesson.translations[0]?.name ?? ''
      }
    }
  }

  // Qualquer outro resultado conta um baú sem aula, para a garantia.
  await tx.users.update({ where: { id: userId }, data: { chest_misses: { increment: 1 } } })

  if (roll.kind === 'instant_hint') {
    await tx.users.update({ where: { id: userId }, data: { instant_hints: { increment: 1 } } })
    return { kind: 'instant_hint' }
  }
  if (roll.kind === 'bits') {
    await tx.users.update({ where: { id: userId }, data: { bits: { increment: roll.amount } } })
    return { kind: 'bits', amount: roll.amount }
  }
  const endsAt = await openBoostWindow(tx, userId, now)
  return { kind: 'double_xp', endsAt: endsAt.toISOString() }
}

export default purchase
