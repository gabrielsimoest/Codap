/**
 * Compara o conteúdo declarado em `seed.ts` com o que está no banco.
 *
 * Existe porque o dashboard passou a ser a ferramenta de autoria: o conteúdo é
 * criado e editado direto no banco, e `seed.ts` deixa de acompanhar sem que
 * ninguém perceba. Um banco novo nasceria com o currículo antigo, e a diferença
 * só apareceria muito depois.
 *
 * Não escreve nada — só relata. Sai com código 1 quando há divergência, para
 * poder ser usado em verificação automatizada.
 *
 * Uso: pnpm --filter codap-api seed:check
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'
import {
  CSS_ADVANCED_LESSONS,
  CSS_BASIC_LESSONS,
  CSS_BEYOND_LESSONS,
  CSS_INTERMEDIATE_LESSONS,
  HTML_ADVANCED_LESSONS,
  HTML_BASIC_LESSONS,
  HTML_BEYOND_LESSONS,
  HTML_INTERMEDIATE_LESSONS,
  JS_ADVANCED_LESSONS,
  JS_BASIC_LESSONS,
  JS_BEYOND_LESSONS,
  JS_INTERMEDIATE_LESSONS
} from './seed.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type LocaleCode = 'pt' | 'en'

interface Alvo {
  areaName: string;
  moduleIndex: number;
  lessons: typeof HTML_BASIC_LESSONS;
}

/** Mesma correspondência usada pelas funções de seed, reunida num lugar só. */
const ALVOS: Alvo[] = [
  { areaName: 'HTML', moduleIndex: 0, lessons: HTML_BASIC_LESSONS },
  { areaName: 'HTML', moduleIndex: 1, lessons: HTML_INTERMEDIATE_LESSONS },
  { areaName: 'HTML', moduleIndex: 2, lessons: HTML_ADVANCED_LESSONS },
  { areaName: 'HTML', moduleIndex: 3, lessons: HTML_BEYOND_LESSONS },
  { areaName: 'CSS', moduleIndex: 0, lessons: CSS_BASIC_LESSONS },
  { areaName: 'CSS', moduleIndex: 1, lessons: CSS_INTERMEDIATE_LESSONS },
  { areaName: 'CSS', moduleIndex: 2, lessons: CSS_ADVANCED_LESSONS },
  { areaName: 'CSS', moduleIndex: 3, lessons: CSS_BEYOND_LESSONS },
  { areaName: 'JavaScript', moduleIndex: 0, lessons: JS_BASIC_LESSONS },
  { areaName: 'JavaScript', moduleIndex: 1, lessons: JS_INTERMEDIATE_LESSONS },
  { areaName: 'JavaScript', moduleIndex: 2, lessons: JS_ADVANCED_LESSONS },
  { areaName: 'JavaScript', moduleIndex: 3, lessons: JS_BEYOND_LESSONS }
]

/**
 * Serialização estável para comparar dois `content`.
 *
 * Ordena as chaves porque o JSONB do Postgres não preserva a ordem de inserção:
 * sem isso, todo `content` acusaria diferença só por ter voltado do banco numa
 * ordem diferente da escrita em `seed.ts`.
 */
function estavel (valor: unknown): string {
  return JSON.stringify(valor, (_chave, v: unknown) => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) {
      return v
    }
    const registro = v as Record<string, unknown>
    return Object.fromEntries(Object.keys(registro).sort().map((k) => [k, registro[k]]))
  })
}

const problemas: string[] = []

function relatar (onde: string, mensagem: string): void {
  problemas.push(`${onde}: ${mensagem}`)
}

async function verificar (alvo: Alvo): Promise<void> {
  const onde = `${alvo.areaName} M${alvo.moduleIndex + 1}`

  const area = await prisma.areas.findFirst({
    where: { name: alvo.areaName },
    orderBy: { id: 'asc' }
  })
  if (area === null) {
    relatar(onde, 'área não encontrada no banco')
    return
  }

  const module = await prisma.modules.findFirst({
    where: { area_id: area.id, index: alvo.moduleIndex }
  })
  if (module === null) {
    relatar(onde, 'módulo não encontrado no banco')
    return
  }

  // A coluna do código do idioma chama-se `locale` (não `code`) — ver
  // `model locales` em schema.prisma.
  const locales = await prisma.locales.findMany()
  const codigoPorId = new Map(locales.map((l) => [l.id, l.locale as LocaleCode]))

  const noBanco = await prisma.lessons.findMany({
    where: { module_id: module.id },
    orderBy: { index: 'asc' },
    include: {
      translations: true,
      activities: { orderBy: { index: 'asc' }, include: { translations: true } }
    }
  })

  const nomePt = (l: (typeof noBanco)[number]): string =>
    l.translations.find((t) => codigoPorId.get(t.locale_id) === 'pt')?.name ?? ''

  /*
   * A correspondência é **pelo nome em português**, nunca pela posição.
   *
   * Comparar por índice transforma uma única lição inserida no meio num
   * relatório em que todas as seguintes aparecem como divergentes — o ruído
   * esconde a diferença real. Ordem é uma dimensão à parte, relatada abaixo.
   */
  const bancoPorNome = new Map(noBanco.map((l) => [nomePt(l), l]))
  const seedPorNome = new Map(alvo.lessons.map((l) => [l.name.pt, l]))

  for (const l of noBanco) {
    if (!seedPorNome.has(nomePt(l))) {
      relatar(onde, `lição "${nomePt(l)}" existe no banco e falta no seed`)
    }
  }
  for (const l of alvo.lessons) {
    if (!bancoPorNome.has(l.name.pt)) {
      relatar(onde, `lição "${l.name.pt}" existe no seed e falta no banco`)
    }
  }

  const ordemBanco = noBanco.map(nomePt).filter((n) => seedPorNome.has(n))
  const ordemSeed = alvo.lessons.map((l) => l.name.pt).filter((n) => bancoPorNome.has(n))
  if (ordemBanco.join(' | ') !== ordemSeed.join(' | ')) {
    relatar(onde, `ordem das lições difere\n      seed:  ${ordemSeed.join(' > ')}\n      banco: ${ordemBanco.join(' > ')}`)
  }

  for (const doSeed of alvo.lessons) {
    const doBanco = bancoPorNome.get(doSeed.name.pt)
    if (doBanco === undefined) {
      continue // já relatado acima
    }
    const posicao = `${onde} "${doSeed.name.pt}"`

    for (const locale of ['pt', 'en'] as LocaleCode[]) {
      const nomeBanco = doBanco.translations.find((t) => codigoPorId.get(t.locale_id) === locale)?.name
      if (nomeBanco !== doSeed.name[locale]) {
        relatar(posicao, `nome [${locale}] difere — seed "${doSeed.name[locale]}", banco "${nomeBanco ?? '(ausente)'}"`)
      }
    }

    if (doBanco.activities.length !== doSeed.activities.length) {
      relatar(
        posicao,
        `${doSeed.activities.length} atividade(s) no seed, ${doBanco.activities.length} no banco`
      )
    }

    const totalAtiv = Math.max(doBanco.activities.length, doSeed.activities.length)
    for (let j = 0; j < totalAtiv; j++) {
      const ativSeed = doSeed.activities[j]
      const ativBanco = doBanco.activities[j]
      if (ativSeed === undefined || ativBanco === undefined) {
        continue // já relatado pela diferença de contagem
      }

      if (ativBanco.type !== ativSeed.type) {
        relatar(`${posicao} ativ${j + 1}`, `type difere — seed "${ativSeed.type}", banco "${ativBanco.type}"`)
      }

      for (const locale of ['pt', 'en'] as LocaleCode[]) {
        const conteudoBanco = ativBanco.translations
          .find((t) => codigoPorId.get(t.locale_id) === locale)?.content
        if (conteudoBanco === undefined) {
          relatar(`${posicao} ativ${j + 1}`, `sem tradução [${locale}] no banco`)
          continue
        }
        if (estavel(conteudoBanco) !== estavel(ativSeed.content[locale])) {
          relatar(`${posicao} ativ${j + 1}`, `content [${locale}] difere`)
        }
      }
    }
  }
}

async function main (): Promise<void> {
  for (const alvo of ALVOS) {
    await verificar(alvo)
  }

  if (problemas.length === 0) {
    console.log('seed.ts está em dia com o banco.')
    return
  }

  console.log(`${problemas.length} divergência(s) entre seed.ts e o banco:\n`)
  for (const p of problemas) {
    console.log(`  ${p}`)
  }
  console.log('\nO seeder precisa ser atualizado para refletir o conteúdo do banco.')
  process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
