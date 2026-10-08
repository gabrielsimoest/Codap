/**
 * Regenera os arrays `*_LESSONS` de `seed.ts` a partir do banco (fonte real
 * de conteúdo desde que o dashboard existe) — elimina o trabalho manual de
 * transcrever uma edição feita no dashboard de volta para literais TypeScript.
 *
 * Substitui só a declaração de cada array (`export const X: LessonSeed[] = [
 * ... ]`), preservando tudo o resto do arquivo: comentários de seção, funções
 * de seed, `MODULE_SUBTITLES`, as próprias constantes de código soltas que
 * viraram inúteis (ver nota abaixo) etc. A localização exata de cada array
 * vem do Compiler API do TypeScript (`ts.createSourceFile`), não de contagem
 * de colchetes no texto bruto — um `[`/`]` dentro de uma string de código JS
 * (ex.: `'resolve(["Ana", "Bruno"]);'`) confundiria um contador ingênuo.
 *
 * O array gerado sempre embute o texto de cada trecho de código diretamente
 * (nunca uma constante nomeada como `JSI7_T2_JS_PT`) — o gerador não tem como
 * inventar um nome semântico para um trecho de código que não escreveu. As
 * constantes antigas referenciadas só por um array que acabou de ser
 * regenerado ficam órfãs; rode `tsc --noEmit` depois (o script já roda) para
 * achar quais sobraram sem uso e removê-las manualmente.
 *
 * Uso: pnpm --filter codap-api seed:generate
 */
import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import ts from 'typescript'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const SEED_PATH = new URL('./seed.ts', import.meta.url)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type LocaleCode = 'pt' | 'en'

interface Alvo {
  areaName: string
  moduleIndex: number
  constName: string
}

/** Mesma correspondência área/módulo usada por `checkSeedDrift.ts` e pelos seeders. */
const ALVOS: Alvo[] = [
  { areaName: 'HTML', moduleIndex: 0, constName: 'HTML_BASIC_LESSONS' },
  { areaName: 'HTML', moduleIndex: 1, constName: 'HTML_INTERMEDIATE_LESSONS' },
  { areaName: 'HTML', moduleIndex: 2, constName: 'HTML_ADVANCED_LESSONS' },
  { areaName: 'HTML', moduleIndex: 3, constName: 'HTML_BEYOND_LESSONS' },
  { areaName: 'CSS', moduleIndex: 0, constName: 'CSS_BASIC_LESSONS' },
  { areaName: 'CSS', moduleIndex: 1, constName: 'CSS_INTERMEDIATE_LESSONS' },
  { areaName: 'CSS', moduleIndex: 2, constName: 'CSS_ADVANCED_LESSONS' },
  { areaName: 'CSS', moduleIndex: 3, constName: 'CSS_BEYOND_LESSONS' },
  { areaName: 'JavaScript', moduleIndex: 0, constName: 'JS_BASIC_LESSONS' },
  { areaName: 'JavaScript', moduleIndex: 1, constName: 'JS_INTERMEDIATE_LESSONS' },
  { areaName: 'JavaScript', moduleIndex: 2, constName: 'JS_ADVANCED_LESSONS' },
  { areaName: 'JavaScript', moduleIndex: 3, constName: 'JS_BEYOND_LESSONS' }
]

interface LessonDump {
  name: Record<LocaleCode, string>
  activities: Array<{ type: string; content: Record<LocaleCode, Record<string, unknown>> }>
}

// --- Busca no banco ---

async function fetchLessons (areaName: string, moduleIndex: number): Promise<LessonDump[]> {
  const area = await prisma.areas.findFirst({ where: { name: areaName }, orderBy: { id: 'asc' } })
  if (area === null) throw new Error(`Área ${areaName} não encontrada`)

  const module = await prisma.modules.findFirst({ where: { area_id: area.id, index: moduleIndex } })
  if (module === null) throw new Error(`Módulo ${moduleIndex} de ${areaName} não encontrado`)

  const locales = await prisma.locales.findMany()
  const codeByLocaleId = new Map(locales.map((l) => [l.id, l.locale as LocaleCode]))

  const lessons = await prisma.lessons.findMany({
    where: { module_id: module.id },
    orderBy: { index: 'asc' },
    include: {
      translations: true,
      activities: { orderBy: { index: 'asc' }, include: { translations: true } }
    }
  })

  return lessons.map((lesson) => {
    const name = { pt: '', en: '' }
    for (const t of lesson.translations) {
      const code = codeByLocaleId.get(t.locale_id)
      if (code !== undefined) name[code] = t.name
    }

    const activities = lesson.activities.map((activity) => {
      const content: Record<LocaleCode, Record<string, unknown>> = { pt: {}, en: {} }
      for (const t of activity.translations) {
        const code = codeByLocaleId.get(t.locale_id)
        if (code !== undefined) content[code] = t.content as Record<string, unknown>
      }
      return { type: activity.type, content }
    })

    return { name, activities }
  })
}

// --- Serialização: dump do banco -> literal TypeScript ---

const THEORY_FIELD_ORDER = [
  'firstParagraph', 'secondParagraph', 'thirdParagraph', 'endParagraph',
  'highlight', 'codeLanguage', 'code', 'additionalCode', 'onlyCode', 'noTerminal', 'terminalCode', 'tutorial'
]
const OPTION_FIELD_ORDER = [
  'question', 'aditionalParagraph', 'codeLanguage', 'code', 'highlight', 'tutorial', 'correctOption', 'options',
  'pool', 'draw', 'fixedOrder'
]
/** Ordem candidata, na ordem em que deve ser testada — a primeira que "cobre" exatamente as chaves do objeto vence. */
const FIELD_ORDER_TABLE = [['name', 'activities'], ['type', 'content'], ['pt', 'en'], THEORY_FIELD_ORDER, OPTION_FIELD_ORDER]

function orderedKeys (obj: Record<string, unknown>): string[] {
  const objKeys = new Set(Object.keys(obj))
  for (const candidate of FIELD_ORDER_TABLE) {
    const present = candidate.filter((k) => objKeys.has(k))
    if (present.length === objKeys.size) return present
  }
  return Object.keys(obj) // nunca deveria cair aqui para um `content` no formato conhecido
}

/** Sempre aspas simples — normaliza os poucos trechos do arquivo hand-authored que hoje usam template literal; funcionalmente idêntico. */
function quote (value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
  return `'${escaped}'`
}

function serializeValue (value: unknown, indent: string): string {
  if (typeof value === 'string') return quote(value)
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.every((v) => typeof v === 'string')) {
      return `[${(value as string[]).map(quote).join(', ')}]`
    }
    const inner = indent + '  '
    const items = value.map((v) => inner + serializeValue(v, inner)).join(',\n')
    return `[\n${items}\n${indent}]`
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const inner = indent + '  '
    const keys = orderedKeys(obj)
    const lines = keys.map((key) => `${inner}${key}: ${serializeValue(obj[key], inner)}`)
    return `{\n${lines.join(',\n')}\n${indent}}`
  }
  return JSON.stringify(value)
}

function serializeLessons (lessons: LessonDump[]): string {
  return serializeValue(lessons, '')
}

// --- Localização e substituição do array em seed.ts (Compiler API) ---

function findArrayLiteralSpan (sourceFile: ts.SourceFile, constName: string): { start: number; end: number } {
  let found: { start: number; end: number } | undefined
  sourceFile.forEachChild((node) => {
    if (found !== undefined || !ts.isVariableStatement(node)) return
    for (const decl of node.declarationList.declarations) {
      if (
        ts.isIdentifier(decl.name) &&
        decl.name.text === constName &&
        decl.initializer !== undefined &&
        ts.isArrayLiteralExpression(decl.initializer)
      ) {
        found = { start: decl.initializer.getStart(sourceFile), end: decl.initializer.getEnd() }
      }
    }
  })
  if (found === undefined) throw new Error(`export const ${constName}: LessonSeed[] não encontrado em seed.ts`)
  return found
}

async function main (): Promise<void> {
  const originalText = readFileSync(SEED_PATH, 'utf8')
  const sourceFile = ts.createSourceFile(SEED_PATH.pathname, originalText, ts.ScriptTarget.Latest, true)

  const replacements: Array<{ start: number; end: number; text: string }> = []

  for (const alvo of ALVOS) {
    const lessons = await fetchLessons(alvo.areaName, alvo.moduleIndex)
    const span = findArrayLiteralSpan(sourceFile, alvo.constName)
    replacements.push({ ...span, text: serializeLessons(lessons) })
    console.log(`${alvo.constName}: ${lessons.length} lição(ões) lida(s) do banco.`)
  }

  // De trás para frente, para os offsets das substituições anteriores não invalidarem os seguintes.
  replacements.sort((a, b) => b.start - a.start)

  let newText = originalText
  for (const { start, end, text } of replacements) {
    newText = newText.slice(0, start) + text + newText.slice(end)
  }

  writeFileSync(SEED_PATH, newText)
  console.log(`\nseed.ts regenerado (${replacements.length} array(s)). Rode "npx tsc --noEmit" e "pnpm seed:check" para conferir.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
