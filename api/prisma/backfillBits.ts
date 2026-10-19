/**
 * Concede, uma única vez, os Bits dos níveis que o XP de cada conta já cobre.
 *
 * Os Bits só são creditados ao CRUZAR um nível (`/sync`). Quem já tinha XP
 * antes de os níveis existirem está, digamos, no nível 6 com saldo zero, e
 * nunca cruzaria os níveis 2 a 6 de novo. Este script corrige isso:
 * `bits = max(bits, bitsEarnedBetween(0, xp))`. É idempotente e só aumenta.
 *
 * Por padrão só SIMULA (lista quantas contas mudariam e o total concedido).
 * Escreve no banco apenas com `--apply`.
 *
 * Só é seguro enquanto nenhum Bit foi gasto: depois que a loja existir (saldo =
 * ganhos − gastos), rodar isto devolveria o que foi gasto. Remova ou desative
 * este script quando a loja entrar.
 *
 *   pnpm seed:backfill-bits            # simulação
 *   pnpm seed:backfill-bits --apply    # grava
 */
import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { bitsEarnedBetween } from '../src/utils/levels.js'

/** Novo saldo de Bits de uma conta com `xp` e `bits` atuais (nulos contam como 0). */
export function bitsToGrant (xp: number | null, bits: number | null): number {
  return Math.max(bits ?? 0, bitsEarnedBetween(0, xp ?? 0))
}

async function main () {
  const apply = process.argv.includes('--apply')
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const users = await prisma.users.findMany({ select: { id: true, xp: true, bits: true } })
    const changes = users
      .map((user) => ({ id: user.id, from: user.bits ?? 0, to: bitsToGrant(user.xp, user.bits) }))
      .filter((change) => change.to > change.from)
    const granted = changes.reduce((sum, change) => sum + (change.to - change.from), 0)

    console.log(`${users.length} contas; ${changes.length} receberiam Bits (${granted} no total).`)

    if (!apply) {
      console.log('Simulação: nada foi gravado. Use --apply para gravar.')
      return
    }

    for (const change of changes) {
      await prisma.users.update({ where: { id: change.id }, data: { bits: change.to } })
    }
    console.log('Bits concedidos.')
  } finally {
    await prisma.$disconnect()
  }
}

const executadoDiretamente =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (executadoDiretamente) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
