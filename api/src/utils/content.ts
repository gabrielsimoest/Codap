import { type Prisma } from '../generated/prisma/client.js'
import type {
  AdminActivityResponse,
  AdminLessonResponse,
  LessonTranslationInput,
  LocaleCode,
  ModuleTranslationInput,
  TranslationMap
} from '../types/contracts.js'

/**
 * Códigos de idioma aceitos pelo catálogo. Mesma lista do `enum` na querystring
 * de `GET /modules` e dos códigos que o `useLanguageStore` do app usa — não há
 * camada de tradução de código de idioma entre app, API e banco.
 *
 * O array vive aqui, e não em `types/contracts.ts`, porque aquele arquivo é
 * declaradamente só de tipos (nada ali sobrevive à compilação).
 */
export const LOCALE_CODES: LocaleCode[] = ['pt', 'en']

/**
 * Mapeia `locales.locale` → `locales.id`. As rotas de escrita recebem
 * traduções por código (`{ pt: ..., en: ... }`), mas as tabelas de tradução
 * referenciam `locale_id`; nenhum `id` de locale é hardcoded em lugar nenhum,
 * pelo mesmo motivo que nenhum `id` de área é (autoincrement, sem valor fixo).
 */
export async function resolveLocaleIds (
  prisma: Prisma.TransactionClient
): Promise<Map<LocaleCode, number>> {
  const locales = await prisma.locales.findMany({
    where: { locale: { in: LOCALE_CODES } },
    select: { id: true, locale: true }
  })

  return new Map(locales.map((row) => [row.locale as LocaleCode, row.id]))
}

/**
 * Índice de append: o próximo `index` livre dentro do pai. Usado quando o
 * `POST` não informa `index` — o caso comum ao autorar conteúdo em ordem.
 */
export function nextIndex (siblings: { index: number }[]): number {
  if (siblings.length === 0) {
    return 0
  }
  return Math.max(...siblings.map((sibling) => sibling.index)) + 1
}

/**
 * Valida que `orderedIds` é exatamente o conjunto de filhos do pai — nem falta
 * nem sobra id. Um reorder parcial deixaria irmãos fora da renumeração e
 * recriaria justamente o problema de `index` duplicado que o endpoint existe
 * para evitar.
 */
export function isSameIdSet (existingIds: number[], orderedIds: number[]): boolean {
  if (existingIds.length !== orderedIds.length) {
    return false
  }
  if (new Set(orderedIds).size !== orderedIds.length) {
    return false
  }
  const existing = new Set(existingIds)
  return orderedIds.every((id) => existing.has(id))
}

/**
 * Quantas linhas de progresso de usuário existem para um conjunto de lições.
 * Toda remoção em cascata consulta isto antes de apagar qualquer coisa: apagar
 * uma lição concluída destruiria o histórico do usuário (`user_lessons`), o que
 * nenhuma edição de conteúdo deveria poder fazer silenciosamente.
 */
export async function countLessonProgress (
  prisma: Prisma.TransactionClient,
  lessonIds: number[]
): Promise<number> {
  if (lessonIds.length === 0) {
    return 0
  }
  return await prisma.user_lessons.count({
    where: { lesson_id: { in: lessonIds } }
  })
}

/**
 * Apaga lições e tudo que pende delas, na ordem que respeita as FKs:
 * traduções de atividade → atividades → traduções de lição → lições.
 *
 * Recebe o client da transação (não `fastify.prisma`) de propósito: uma cascata
 * parcial deixaria atividades órfãs apontando para uma lição inexistente.
 */
export async function deleteLessonsCascade (
  tx: Prisma.TransactionClient,
  lessonIds: number[]
): Promise<void> {
  if (lessonIds.length === 0) {
    return
  }

  const activities = await tx.activities.findMany({
    where: { lesson_id: { in: lessonIds } },
    select: { id: true }
  })
  const activityIds = activities.map((activity) => activity.id)

  if (activityIds.length > 0) {
    await tx.activity_translations.deleteMany({ where: { activity_id: { in: activityIds } } })
    await tx.activities.deleteMany({ where: { id: { in: activityIds } } })
  }

  await tx.lesson_translations.deleteMany({ where: { lesson_id: { in: lessonIds } } })
  await tx.lessons.deleteMany({ where: { id: { in: lessonIds } } })
}

/**
 * Apaga módulos, suas traduções e todo o subgrafo de lições abaixo deles.
 */
export async function deleteModulesCascade (
  tx: Prisma.TransactionClient,
  moduleIds: number[]
): Promise<void> {
  if (moduleIds.length === 0) {
    return
  }

  const lessons = await tx.lessons.findMany({
    where: { module_id: { in: moduleIds } },
    select: { id: true }
  })
  await deleteLessonsCascade(tx, lessons.map((lesson) => lesson.id))

  await tx.module_translations.deleteMany({ where: { module_id: { in: moduleIds } } })
  await tx.modules.deleteMany({ where: { id: { in: moduleIds } } })
}

/**
 * Converte as linhas de uma tabela de tradução no mapa por código de idioma que
 * as rotas de escrita devolvem (`{ pt: ..., en: ... }`). Locale sem linha
 * simplesmente não aparece no mapa — é assim que o dashboard distingue "sem
 * tradução" de "tradução vazia", coisa que `GET /modules` não consegue fazer
 * (ele resolve tudo para `''`).
 */
export function toTranslationMap<TRow extends { locale: { locale: string } }, TValue> (
  rows: TRow[],
  pick: (row: TRow) => TValue
): Partial<Record<LocaleCode, TValue>> {
  const map: Partial<Record<LocaleCode, TValue>> = {}
  for (const row of rows) {
    map[row.locale.locale as LocaleCode] = pick(row)
  }
  return map
}

/**
 * Grava as traduções informadas, deixando intactos os idiomas ausentes do mapa.
 *
 * Um `upsert` por locale, e não um `deleteMany` + `createMany`: o corpo é
 * parcial de propósito (ver `TranslationMap`), então enviar só `pt` num PATCH
 * significa "atualize o português", nunca "apague o inglês".
 */
export async function upsertModuleTranslations (
  tx: Prisma.TransactionClient,
  moduleId: number,
  translations: TranslationMap<ModuleTranslationInput>,
  localeIds: Map<LocaleCode, number>
): Promise<void> {
  for (const code of LOCALE_CODES) {
    const translation = translations[code]
    if (!translation) {
      continue
    }
    const localeId = localeIds.get(code)
    if (localeId === undefined) {
      continue
    }
    const data = { name: translation.name, subtitle: translation.subtitle ?? null }
    await tx.module_translations.upsert({
      where: { module_id_locale_id: { module_id: moduleId, locale_id: localeId } },
      create: { module_id: moduleId, locale_id: localeId, ...data },
      update: data
    })
  }
}

export async function upsertLessonTranslations (
  tx: Prisma.TransactionClient,
  lessonId: number,
  translations: TranslationMap<LessonTranslationInput>,
  localeIds: Map<LocaleCode, number>
): Promise<void> {
  for (const code of LOCALE_CODES) {
    const translation = translations[code]
    if (!translation) {
      continue
    }
    const localeId = localeIds.get(code)
    if (localeId === undefined) {
      continue
    }
    await tx.lesson_translations.upsert({
      where: { lesson_id_locale_id: { lesson_id: lessonId, locale_id: localeId } },
      create: { lesson_id: lessonId, locale_id: localeId, name: translation.name },
      update: { name: translation.name }
    })
  }
}

export async function upsertActivityTranslations (
  tx: Prisma.TransactionClient,
  activityId: number,
  content: TranslationMap<unknown>,
  localeIds: Map<LocaleCode, number>
): Promise<void> {
  for (const code of LOCALE_CODES) {
    const value = content[code]
    if (value === undefined) {
      continue
    }
    const localeId = localeIds.get(code)
    if (localeId === undefined) {
      continue
    }
    // `content` é JSONB sem forma fixa — a API o transporta fielmente, sem
    // conhecer o formato de cada `activities.type` (ver api/CLAUDE.md).
    const data = { content: value as Prisma.InputJsonValue }
    await tx.activity_translations.upsert({
      where: { activity_id_locale_id: { activity_id: activityId, locale_id: localeId } },
      create: { activity_id: activityId, locale_id: localeId, ...data },
      update: data
    })
  }
}

/**
 * Busca lições na forma "admin" — todas as traduções, com as atividades e o
 * `content` de cada idioma — e as mapeia para `AdminLessonResponse`.
 *
 * Query e mapeamento vivem juntos aqui porque três rotas devolvem exatamente
 * esta forma (`GET /lessons`, `POST /lessons`, `PATCH /lessons/:id`), e um
 * `select` divergente entre elas produziria respostas com campos faltando sem
 * nenhum erro visível.
 */
export async function findAdminLessons (
  tx: Prisma.TransactionClient,
  where: Prisma.lessonsWhereInput
): Promise<AdminLessonResponse[]> {
  const lessons = await tx.lessons.findMany({
    where,
    select: {
      id: true,
      module_id: true,
      index: true,
      translations: {
        select: { name: true, locale: { select: { locale: true } } }
      },
      activities: {
        select: {
          id: true,
          lesson_id: true,
          index: true,
          type: true,
          translations: {
            select: { content: true, locale: { select: { locale: true } } }
          }
        },
        orderBy: { index: 'asc' }
      }
    },
    orderBy: { index: 'asc' }
  })

  return lessons.map((lesson) => ({
    id: lesson.id,
    moduleId: lesson.module_id,
    index: lesson.index,
    translations: toTranslationMap(lesson.translations, (row) => ({ name: row.name })),
    activities: lesson.activities.map((activity) => ({
      id: activity.id,
      lessonId: activity.lesson_id,
      index: activity.index,
      type: activity.type,
      content: toTranslationMap(activity.translations, (row) => row.content)
    }))
  }))
}

/**
 * Busca uma atividade na forma "admin" (o `content` de todos os idiomas).
 * Mesma razão de `findAdminLessons`: três rotas devolvem esta forma e um
 * `select` divergente entre elas passaria despercebido.
 */
export async function findAdminActivity (
  tx: Prisma.TransactionClient,
  id: number
): Promise<AdminActivityResponse> {
  const activity = await tx.activities.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      lesson_id: true,
      index: true,
      type: true,
      translations: {
        select: { content: true, locale: { select: { locale: true } } }
      }
    }
  })

  return {
    id: activity.id,
    lessonId: activity.lesson_id,
    index: activity.index,
    type: activity.type,
    content: toTranslationMap(activity.translations, (row) => row.content)
  }
}
