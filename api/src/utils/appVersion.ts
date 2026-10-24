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

/**
 * Idioma cujo texto vale quando o idioma pedido não tem o da versão. É a língua
 * em que o texto é sempre escrito (o dashboard exige pt e en). Sem esta reserva,
 * quem usa o app num idioma sem texto publicado (um terceiro idioma aberto antes
 * de ter o changelog) nunca saberia que há uma versão nova.
 */
export const FALLBACK_LOCALE = 'en'

/**
 * Histórico de versões para um idioma, da mais nova para a mais antiga (forma que
 * o app usa).
 *
 * **Reserva por versão**: para cada versão publicada, vale o texto do idioma
 * pedido; se esse idioma não tem texto *daquela* versão, vale o do
 * `fallbackLocale`. Por versão, e não "tudo ou nada", porque um idioma pode ter
 * os textos antigos e ainda não o da versão mais nova — e é justamente essa a
 * que a pessoa precisa ver. Uma entrada que veio da reserva traz o `locale` do
 * idioma de reserva.
 */
export async function findAppVersionHistory (
  prisma: Prisma.TransactionClient,
  locale: string,
  limit: number,
  fallbackLocale: string = FALLBACK_LOCALE
): Promise<AppVersionResponse[]> {
  const locales = locale === fallbackLocale ? [locale] : [locale, fallbackLocale]
  const rows = await prisma.app_version.findMany({
    where: { locale: { locale: { in: locales } } },
    select: APP_VERSION_SELECT,
    orderBy: NEWEST_FIRST
  })

  const byVersion = new Map<string, AppVersionResponse>()
  // Ordem de publicação da versão = o MENOR `id` entre as linhas dela (a do idioma
  // pedido pode ter sido acrescentada depois, com `id` maior, e não pode trazer uma
  // versão antiga para o topo).
  const publishedAt = new Map<string, number>()
  for (const row of rows) {
    const entry = toAppVersionResponse(row)
    publishedAt.set(entry.version, Math.min(publishedAt.get(entry.version) ?? Infinity, entry.id))
    const current = byVersion.get(entry.version)
    // O idioma pedido sempre vence a reserva; entre linhas do mesmo idioma a mais
    // nova (primeira, pela ordem) vence.
    if (current === undefined || (current.locale !== locale && entry.locale === locale)) {
      byVersion.set(entry.version, entry)
    }
  }

  return [...byVersion.values()]
    .sort((a, b) => (publishedAt.get(b.version) ?? 0) - (publishedAt.get(a.version) ?? 0))
    .slice(0, limit)
}
