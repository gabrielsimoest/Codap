import { type Prisma } from '../generated/prisma/client.js'
import type { ContentVersionResponse } from '../types/contracts.js'

/**
 * `released_at` é `@db.Date` — só data, sem hora. Duas publicações no mesmo dia
 * empatariam, então a ordenação é sempre por `id` decrescente (autoincrement,
 * estritamente crescente). **Nunca ordene versões por `released_at`.**
 */
const NEWEST_FIRST = { id: 'desc' } as const

function toResponse (row: {
  version: string;
  changelog: string;
  released_at: Date;
  locale: { locale: string };
}): ContentVersionResponse {
  return {
    locale: row.locale.locale,
    version: row.version,
    changelog: row.changelog,
    // `toISOString().slice(0, 10)` e não `toLocaleDateString`: a coluna é uma
    // data pura, e o formato precisa ser estável independentemente do fuso do
    // servidor.
    releasedAt: row.released_at.toISOString().slice(0, 10)
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
    select: {
      version: true,
      changelog: true,
      released_at: true,
      locale: { select: { locale: true } }
    },
    orderBy: NEWEST_FIRST
  })

  const latestByLocale = new Map<string, ContentVersionResponse>()
  for (const row of rows) {
    // `rows` já vem do mais novo para o mais antigo: a primeira ocorrência de
    // cada idioma é a vigente.
    if (!latestByLocale.has(row.locale.locale)) {
      latestByLocale.set(row.locale.locale, toResponse(row))
    }
  }

  return [...latestByLocale.values()]
}
