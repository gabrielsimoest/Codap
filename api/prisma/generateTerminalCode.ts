/**
 * Gera candidatos de `terminalCode` (JS pré-transpilado, ver
 * TheoryActivityContent.terminalCode em contracts.ts) para toda atividade
 * `codeLanguage: 'TypeScript'` do banco, usando `ts.transpileModule` (só
 * apaga tipos, não faz type-check — o mesmo pacote `typescript` já
 * devDependency de /api).
 *
 * NUNCA escreve no banco nem em seed.ts — só imprime pra revisão humana
 * (mesmo princípio de checkSeedDrift.ts: nunca escrita cega). Depois de
 * revisar, aplicar via um script avulso de patch (mesmo padrão dos outros
 * `_patch_*.ts` já usados neste projeto, descartável) + `pnpm seed:generate`
 * + `pnpm seed:check` + publicar uma content_version.
 *
 * Uso: pnpm --filter codap-api exec tsx prisma/generateTerminalCode.ts
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import ts from 'typescript'
import { PrismaClient } from '../src/generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type LocaleCode = 'pt' | 'en'

function transpile (code: string): string {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2019,
      removeComments: false
    },
    reportDiagnostics: false
  })
  return result.outputText.trim()
}

async function main (): Promise<void> {
  const area = await prisma.areas.findFirst({ where: { name: 'JavaScript' }, orderBy: { id: 'asc' } })
  if (area === null) throw new Error('Área JavaScript não encontrada')

  const module = await prisma.modules.findFirst({ where: { area_id: area.id, index: 2 } })
  if (module === null) throw new Error('Módulo Avançado de JavaScript não encontrado')

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

  const nomePt = (l: (typeof lessons)[number]): string =>
    l.translations.find((t) => codeByLocaleId.get(t.locale_id) === 'pt')?.name ?? '(sem nome)'

  for (const lesson of lessons) {
    lesson.activities.forEach((activity, activityIndex) => {
      const ptTranslation = activity.translations.find((t) => codeByLocaleId.get(t.locale_id) === 'pt')
      const enTranslation = activity.translations.find((t) => codeByLocaleId.get(t.locale_id) === 'en')
      const ptContent = ptTranslation?.content as Record<string, unknown> | undefined
      const enContent = enTranslation?.content as Record<string, unknown> | undefined

      if (ptContent?.codeLanguage !== 'TypeScript') return

      console.log(`\n${'='.repeat(70)}`)
      console.log(`"${nomePt(lesson)}" — atividade ${activityIndex + 1}`)
      console.log('='.repeat(70))

      console.log('\n--- [pt] código original ---')
      console.log(ptContent.code as string)
      console.log('\n--- [pt] terminalCode candidato ---')
      console.log(transpile(ptContent.code as string))

      if (enContent !== undefined) {
        console.log('\n--- [en] código original ---')
        console.log(enContent.code as string)
        console.log('\n--- [en] terminalCode candidato ---')
        console.log(transpile(enContent.code as string))
      }
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
