import { type Prisma } from '../generated/prisma/client.js'
import type { ContentVersionResponse } from '../types/contracts.js'

/**
 * `released_at` é `@db.Date` — só data, sem hora. Duas publicações no mesmo dia
 * empatariam, então a ordenação é sempre por `id` decrescente (autoincrement,
 * estritamente crescente). **Nunca ordene versões por `released_at`.**
 */
const NEWEST_FIRST = { id: 'desc' } as const

/**
 * Campos lidos em toda consulta de versão. Compartilhado entre leitura e
 * publicação para as duas rotas nunca devolverem formas diferentes — um
 * `select` divergente produziria respostas com campos faltando sem erro algum.
 */
export const CONTENT_VERSION_SELECT = {
  id: true,
  version: true,
  changelog: true,
  released_at: true,
  announce: true,
  locale: { select: { locale: true } }
} as const

type ContentVersionRow = Prisma.content_versionGetPayload<{
  select: typeof CONTENT_VERSION_SELECT;
}>

export function toContentVersionResponse (row: ContentVersionRow): ContentVersionResponse {
  return {
    id: row.id,
    locale: row.locale.locale,
    version: row.version,
    changelog: row.changelog,
    // `toISOString().slice(0, 10)` e não `toLocaleDateString`: a coluna é uma
    // data pura, e o formato precisa ser estável independentemente do fuso do
    // servidor.
    releasedAt: row.released_at.toISOString().slice(0, 10),
    announce: row.announce
  }
}

/**
 * A versão mais recente de cada idioma — ou só a de `locale`, quando informado.
 *
 * Faz a redução por idioma em memória, e não com um `DISTINCT ON` no banco:
 * são poucos idiomas e poucas publicações, e a query fica legível sem SQL cru
 * (que o Prisma exigiria para `DISTINCT ON`).
 */
export async function findLatestContentVersions (
  prisma: Prisma.TransactionClient,
  locale?: string
): Promise<ContentVersionResponse[]> {
  const rows = await prisma.content_version.findMany({
    where: locale === undefined ? undefined : { locale: { locale } },
    select: CONTENT_VERSION_SELECT,
    orderBy: NEWEST_FIRST
  })

  const latestByLocale = new Map<string, ContentVersionResponse>()
  for (const row of rows) {
    // `rows` já vem do mais novo para o mais antigo: a primeira ocorrência de
    // cada idioma é a vigente.
    if (!latestByLocale.has(row.locale.locale)) {
      latestByLocale.set(row.locale.locale, toContentVersionResponse(row))
    }
  }

  return [...latestByLocale.values()]
}

/**
 * Todas as publicações de um idioma posteriores a `sinceId`, da mais nova para
 * a mais antiga.
 *
 * É o que o app usa para montar o aviso de "conteúdo atualizado": quem ficou
 * várias publicações sem abrir recebe todas, não só a última. Devolve inclusive
 * as que não são anunciadas (`announce: false`) — filtrar é decisão de quem
 * mostra, e o dashboard pode querer o histórico completo.
 */
export async function findContentVersionsSince (
  prisma: Prisma.TransactionClient,
  locale: string,
  sinceId: number
): Promise<ContentVersionResponse[]> {
  const rows = await prisma.content_version.findMany({
    where: { locale: { locale }, id: { gt: sinceId } },
    select: CONTENT_VERSION_SELECT,
    orderBy: NEWEST_FIRST
  })

  return rows.map(toContentVersionResponse)
}
