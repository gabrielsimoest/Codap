/**
 * Migração de dados das atividades `theory` para o modelo semântico:
 *
 *   firstParagraph            → introduction.text
 *   secondParagraph (+ third) → explanation.text
 *   endParagraph              → closing
 *   (nova) persona            → introduction.persona
 *
 * **Não há migração de schema SQL.** O `content` de uma atividade é JSONB sem
 * forma (ver api/CLAUDE.md), então trocar os campos é trocar o JSON de cada
 * linha de `activity_translations` — e é isso que este script faz.
 *
 * Regras da conversão:
 *  - Nada de texto se perde: os parágrafos antigos viram campos novos sem
 *    reescrita. Os demais campos (`highlight`, `codeLanguage`, `code`,
 *    `additionalCode`, `onlyCode`, `noTerminal`, `terminalCode`, `tutorial` e
 *    qualquer chave desconhecida) ficam exatamente como estavam.
 *  - **Títulos não são inventados.** `introduction.title` e `explanation.title`
 *    ficam ausentes nas linhas migradas: o autor os preenche pelo dashboard. O
 *    app mostra a seção sem título enquanto isso.
 *  - Persona: a **primeira teoria de cada lição** (menor `index` entre as
 *    teorias da própria lição) vira `cody`, a regra obrigatória; as demais
 *    viram `neutral`, que preserva o tom de texto que elas já têm.
 *  - Idempotente: linha que já tem `introduction` não é tocada.
 *  - Todos os idiomas de uma atividade recebem a mesma persona.
 *
 * Uso (a partir de `api/`):
 *   pnpm theory:migrate                        dry-run: só relata, não escreve
 *   pnpm theory:migrate --apply                grava, depois de salvar o backup
 *   pnpm theory:migrate --revert <backup.json> restaura o JSON exato do backup
 *
 * O backup (`prisma/backups/theory-v2-<data>.json`, ignorado pelo git) guarda o
 * `content` original de cada linha tocada; `--revert` o devolve byte a byte, e
 * só mexe nas linhas que estão no arquivo.
 */

import 'dotenv/config'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

type Json = Record<string, unknown>

const LEGACY_KEYS = ['firstParagraph', 'secondParagraph', 'thirdParagraph', 'endParagraph'] as const

function isObject (value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** `true` para o formato antigo: tem `firstParagraph` e ainda não tem `introduction`. */
export function isLegacyTheory (content: unknown): content is Json {
  return isObject(content) && typeof content.firstParagraph === 'string' && !isObject(content.introduction)
}

export type ConversionIssue = 'sem-texto-na-introducao'

/**
 * Converte um `content` antigo no modelo novo. Devolve `null` quando a linha não
 * é migrável (formato desconhecido ou sem o primeiro parágrafo) — o chamador
 * relata em vez de adivinhar.
 */
export function convertTheoryV1ToV2 (
  content: Json,
  isFirstTheory: boolean
): { content: Json } | { issue: ConversionIssue } {
  const first = typeof content.firstParagraph === 'string' ? content.firstParagraph.trim() : ''
  if (first === '') {
    return { issue: 'sem-texto-na-introducao' }
  }

  const explanationParts = [content.secondParagraph, content.thirdParagraph]
    .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
  const closing = typeof content.endParagraph === 'string' && content.endParagraph.trim() !== ''
    ? content.endParagraph
    : undefined

  const rest = Object.fromEntries(
    Object.entries(content).filter(([key]) => !(LEGACY_KEYS as readonly string[]).includes(key))
  )

  return {
    content: {
      introduction: { text: content.firstParagraph, persona: isFirstTheory ? 'cody' : 'neutral' },
      ...(explanationParts.length > 0 ? { explanation: { text: explanationParts.join('\n\n') } } : {}),
      ...(closing !== undefined ? { closing } : {}),
      ...rest
    }
  }
}

/**
 * Inverso aproximado, só para conferência no dry-run: o segundo e o terceiro
 * parágrafo voltam juntos em `secondParagraph`, e título e persona se perdem. A
 * restauração exata vem do backup, não daqui.
 */
export function convertTheoryV2ToV1 (content: Json): Json {
  const { introduction, explanation, closing, ...rest } = content
  return {
    firstParagraph: isObject(introduction) ? introduction.text : '',
    ...(isObject(explanation) ? { secondParagraph: explanation.text } : {}),
    ...(typeof closing === 'string' ? { endParagraph: closing } : {}),
    ...rest
  }
}

interface Row {
  activityId: number
  localeId: number
  locale: string
  lessonId: number
  content: unknown
}

async function main (): Promise<void> {
  const args = process.argv.slice(2)
  const apply = args.includes('--apply')
  const revertIndex = args.indexOf('--revert')

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    if (revertIndex !== -1) {
      await revert(prisma, args[revertIndex + 1])
      return
    }

    const rows = await loadTheoryRows(prisma)
    const firstTheoryByLesson = new Map<number, number>()
    for (const activity of await prisma.activities.findMany({
      where: { type: 'theory' },
      orderBy: [{ lesson_id: 'asc' }, { index: 'asc' }, { id: 'asc' }],
      select: { id: true, lesson_id: true }
    })) {
      if (!firstTheoryByLesson.has(activity.lesson_id)) {
        firstTheoryByLesson.set(activity.lesson_id, activity.id)
      }
    }

    const toWrite: { row: Row, next: Json }[] = []
    const issues: { row: Row, issue: string }[] = []
    let alreadyV2 = 0
    let unknown = 0
    let mergedThird = 0
    let lossy = 0

    for (const row of rows) {
      if (isObject(row.content) && isObject(row.content.introduction)) {
        alreadyV2++
        continue
      }
      const old = row.content
      if (!isLegacyTheory(old)) {
        unknown++
        issues.push({ row, issue: 'formato desconhecido' })
        continue
      }
      const converted = convertTheoryV1ToV2(old, firstTheoryByLesson.get(row.lessonId) === row.activityId)
      if ('issue' in converted) {
        issues.push({ row, issue: converted.issue })
        continue
      }
      if (typeof old.thirdParagraph === 'string') {
        mergedThird++
      }
      // Conferência: todo texto original precisa estar nos campos novos, e todo
      // campo que não é parágrafo precisa ter ficado igual.
      const text = [converted.content.introduction, converted.content.explanation]
        .map((section) => (isObject(section) ? String(section.text) : ''))
        .concat(typeof converted.content.closing === 'string' ? converted.content.closing : '')
        .join('\n')
      const paragraphs = LEGACY_KEYS.map((key) => old[key]).filter((value): value is string => typeof value === 'string' && value.trim() !== '')
      const sameParagraphs = paragraphs.every((paragraph) => text.includes(paragraph))
      const sameRest = Object.keys(old)
        .filter((key) => !(LEGACY_KEYS as readonly string[]).includes(key))
        .every((key) => JSON.stringify(old[key]) === JSON.stringify(converted.content[key]))
      if (!sameParagraphs || !sameRest) {
        lossy++
      }
      toWrite.push({ row, next: converted.content })
    }

    const byLocale = (list: { row: Row }[]) => list.reduce<Record<string, number>>((acc, { row }) => {
      acc[row.locale] = (acc[row.locale] ?? 0) + 1
      return acc
    }, {})

    console.log(`Atividades theory (linhas por idioma): ${rows.length}`)
    console.log(`  já no modelo novo: ${alreadyV2}`)
    console.log(`  a migrar: ${toWrite.length} ${JSON.stringify(byLocale(toWrite))}`)
    console.log(`  persona cody (primeira teoria da lição): ${toWrite.filter(({ next }) => (next.introduction as Json).persona === 'cody').length}`)
    console.log(`  persona neutral: ${toWrite.filter(({ next }) => (next.introduction as Json).persona === 'neutral').length}`)
    console.log(`  com explicação: ${toWrite.filter(({ next }) => next.explanation !== undefined).length}`)
    console.log(`  com fechamento: ${toWrite.filter(({ next }) => next.closing !== undefined).length}`)
    console.log(`  com terceiro parágrafo (unido à explicação): ${mergedThird}`)
    console.log(`  conferência de texto na volta (deve ser 0): ${lossy}`)
    console.log(`  não migráveis: ${issues.length} (formato desconhecido: ${unknown})`)
    for (const { row, issue } of issues) {
      console.log(`    - atividade ${row.activityId} (${row.locale}): ${issue}`)
    }

    if (!apply) {
      console.log('\nDry-run: nada foi gravado. Rode com --apply para migrar (o backup é salvo antes).')
      return
    }
    if (toWrite.length === 0) {
      console.log('\nNada a migrar.')
      return
    }
    if (lossy > 0) {
      throw new Error('A conferência de texto falhou; nada foi gravado.')
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = fileURLToPath(new URL('./backups/', import.meta.url))
    const backupPath = `${backupDir}theory-v2-${stamp}.json`
    await mkdir(backupDir, { recursive: true })
    await writeFile(
      backupPath,
      JSON.stringify(toWrite.map(({ row }) => ({
        activityId: row.activityId,
        localeId: row.localeId,
        locale: row.locale,
        content: row.content
      })), null, 2),
      'utf-8'
    )
    console.log(`\nBackup salvo em ${backupPath}`)

    await prisma.$transaction(async (tx) => {
      for (const { row, next } of toWrite) {
        await tx.activity_translations.update({
          where: { activity_id_locale_id: { activity_id: row.activityId, locale_id: row.localeId } },
          data: { content: next as object }
        })
      }
    }, { timeout: 120_000 })
    console.log(`${toWrite.length} linha(s) migrada(s).`)
    console.log('Próximos passos: pnpm seed:generate && pnpm seed:check.')
  } finally {
    await prisma.$disconnect()
  }
}

async function loadTheoryRows (prisma: PrismaClient): Promise<Row[]> {
  const translations = await prisma.activity_translations.findMany({
    where: { activity: { type: 'theory' } },
    select: {
      activity_id: true,
      locale_id: true,
      content: true,
      locale: { select: { locale: true } },
      activity: { select: { lesson_id: true } }
    },
    orderBy: [{ activity_id: 'asc' }, { locale_id: 'asc' }]
  })
  return translations.map((translation) => ({
    activityId: translation.activity_id,
    localeId: translation.locale_id,
    locale: translation.locale.locale,
    lessonId: translation.activity.lesson_id,
    content: translation.content
  }))
}

async function revert (prisma: PrismaClient, backupPath: string | undefined): Promise<void> {
  if (!backupPath) {
    throw new Error('Informe o arquivo de backup: --revert <backup.json>')
  }
  const rows = JSON.parse(await readFile(backupPath, 'utf-8')) as { activityId: number, localeId: number, locale: string, content: object }[]
  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.activity_translations.update({
        where: { activity_id_locale_id: { activity_id: row.activityId, locale_id: row.localeId } },
        data: { content: row.content }
      })
    }
  }, { timeout: 120_000 })
  console.log(`${rows.length} linha(s) restaurada(s) do backup ${backupPath}.`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
