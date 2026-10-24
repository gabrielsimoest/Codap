import { type Prisma } from '../generated/prisma/client.js'
import type { AppVersionResponse } from '../types/contracts.js'

/**
 * Ordem de publicação: pelo `id` (autoincrement). `released_at` é só uma data,
 * então duas versões no mesmo dia empatariam — nunca ordene por ele.
 */
const NEWEST_FIRST = { id: 'desc' } as const

/** Campos lidos em toda consulta (leitura e publicação devolvem a mesma forma). */
export const APP_VERSION_SELECT = {
  id: true,
  version: true,
  changelog: true,
  need_update: true,
  released_at: true,
  locale: { select: { locale: true } }
} as const

type AppVersionRow = Prisma.app_versionGetPayload<{ select: typeof APP_VERSION_SELECT }>

export function toAppVersionResponse (row: AppVersionRow): AppVersionResponse {
  return {
    id: row.id,
    locale: row.locale.locale,
    version: row.version,
    changelog: row.changelog,
    needUpdate: row.need_update,
    // Data pura: `toISOString().slice(0, 10)` independe do fuso do servidor.
    releasedAt: row.released_at.toISOString().slice(0, 10)
  }
}

/** A versão mais recente de cada idioma (forma que o dashboard usa). */
export async function findLatestAppVersions (prisma: Prisma.TransactionClient): Promise<AppVersionResponse[]> {
  const rows = await prisma.app_version.findMany({ select: APP_VERSION_SELECT, orderBy: NEWEST_FIRST })

  const latestByLocale = new Map<string, AppVersionResponse>()
  for (const row of rows) {
    if (!latestByLocale.has(row.locale.locale)) {
      latestByLocale.set(row.locale.locale, toAppVersionResponse(row))
    }
  }
  return [...latestByLocale.values()]
}

/** Histórico de um idioma, da mais nova para a mais antiga (forma que o app usa). */
export async function findAppVersionHistory (
  prisma: Prisma.TransactionClient,
  locale: string,
  limit: number
): Promise<AppVersionResponse[]> {
  const rows = await prisma.app_version.findMany({
    where: { locale: { locale } },
    select: APP_VERSION_SELECT,
    orderBy: NEWEST_FIRST,
    take: limit
  })
  return rows.map(toAppVersionResponse)
}
