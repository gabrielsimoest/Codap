import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'
import type { OptionActivityContent, TheoryActivityContent } from '../src/types/contracts.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type LocaleCode = 'pt' | 'en'

const LOCALES: { code: LocaleCode; name: string }[] = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' }
]

// Nomes de área não são traduzidos (termos técnicos, iguais em qualquer
// idioma) — ficam direto em `areas.name`, sem tabela de tradução.
const AREA_NAMES: string[] = ['HTML', 'CSS', 'JavaScript']

const MODULE_TRANSLATIONS: Record<LocaleCode, string>[] = [
  { pt: 'Módulo 1', en: 'Module 1' },
  { pt: 'Módulo 2', en: 'Module 2' },
  { pt: 'Módulo 3', en: 'Module 3' },
  { pt: 'Módulo 4', en: 'Module 4' }
]

async function seedLocales (): Promise<Map<LocaleCode, number>> {
  const localeIds = new Map<LocaleCode, number>()

  for (const { code, name } of LOCALES) {
    const existing = await prisma.locales.findFirst({ where: { locale: code } })
    const locale = existing ?? await prisma.locales.create({ data: { locale: code, name } })
    localeIds.set(code, locale.id)
  }

  return localeIds
}

async function seedAreasAndModules (localeIds: Map<LocaleCode, number>): Promise<void> {
  const existingAreas = await prisma.areas.count()
  if (existingAreas > 0) {
    console.log(`Áreas já seedadas (${existingAreas} encontradas) — pulando.`)
    return
  }

  for (const areaName of AREA_NAMES) {
    const area = await prisma.areas.create({ data: { name: areaName } })

    for (let index = 0; index < MODULE_TRANSLATIONS.length; index++) {
      const module = await prisma.modules.create({ data: { area_id: area.id, index } })

      await prisma.module_translations.createMany({
        data: LOCALES.map(({ code }) => ({
          module_id: module.id,
          locale_id: localeIds.get(code)!,
          name: MODULE_TRANSLATIONS[index][code]
        }))
      })
    }
  }

  console.log(`Seed concluído: ${AREA_NAMES.length} áreas, ${AREA_NAMES.length * MODULE_TRANSLATIONS.length} módulos.`)
}

// Conteúdo de exemplo do primeiro módulo de HTML. Transcrito (não importado)
// de app/src/screens/classes/lessons/html/content/basic-html.ts: o app é outro
// pacote do workspace e a API não depende dele. O bloco `en` de lá está em
// português e sem o exercício — aqui o inglês é real, para o seed servir de
// demonstração bilíngue de verdade.
const HTML_STRUCTURE_CODE = `<!DOCTYPE html>
  <html>
    <head>
      <title>Minha página</title>
    </head>
    <body>
      <h1>Minha página</h1>
      <p>Esta é a minha primeira página HTML!</p>
    </body>
  </html>`

type ActivitySeed = {
  type: 'theory' | 'option';
  content: Record<LocaleCode, TheoryActivityContent | OptionActivityContent>;
}

type LessonSeed = {
  name: Record<LocaleCode, string>;
  activities: ActivitySeed[];
}

const EXAMPLE_LESSONS: LessonSeed[] = [
  {
    name: { pt: 'Descobrindo HTML', en: 'Discovering HTML' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Olá, aqui é o Cody. Vamos aprender HTML? O HTML é uma linguagem de marcação muito utilizada na construção de páginas na Web.',
            secondParagraph: 'Primeiramente estarei mostrando um exemplo bem básico de estrutura para você já ir tendo uma ideia de como o HTML se parece.',
            endParagraph: 'Como você pôde ver ela é bem simples, mas existem vários outros elementos que podem ser adicionados nessa estrutura para termos sites incríveis.',
            highlight: ['HTML', 'Cody', 'Web'],
            codeLanguage: 'HTML',
            code: HTML_STRUCTURE_CODE
          },
          en: {
            firstParagraph: "Hi, it's Cody here. Shall we learn HTML? HTML is a markup language widely used to build pages on the Web.",
            secondParagraph: 'First I will show you a very basic structure example, so you get an idea of what HTML looks like.',
            endParagraph: 'As you can see it is quite simple, but there are many other elements that can be added to this structure to build amazing websites.',
            highlight: ['HTML', 'Cody', 'Web'],
            codeLanguage: 'HTML',
            code: HTML_STRUCTURE_CODE
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Agora que vimos a estrutura, vamos entender melhor o que está nela.',
            secondParagraph: 'A estrutura é formada por tags de abertura e fechamento, que são indicadas por essas setas <>. Dentro delas vai o nome do elemento.',
            endParagraph: 'Lembre-se, a estrutura DEVE estar entre as tags <html> </html>. Se não seu site não vai funcionar!',
            highlight: ['HTML', 'DEVE'],
            codeLanguage: 'HTML',
            code: HTML_STRUCTURE_CODE
          },
          en: {
            firstParagraph: 'Now that we have seen the structure, let us understand better what is inside it.',
            secondParagraph: 'The structure is made of opening and closing tags, marked by these arrows <>. The element name goes inside them.',
            endParagraph: 'Remember, the structure MUST sit between the <html> </html> tags. Otherwise your website will not work!',
            highlight: ['HTML', 'MUST'],
            codeLanguage: 'HTML',
            code: HTML_STRUCTURE_CODE
          }
        }
      },
      {
        type: 'option',
        content: {
          pt: {
            question: '<html> representa uma tag de abertura, como seria uma tag de fechamento?',
            highlight: ['HTML'],
            options: ['<html>', '<end html>', '>html<', '</html>'],
            // 1-based: a resposta certa é a 4ª opção, não o índice 3.
            correctOption: 4
          },
          en: {
            question: '<html> is an opening tag — what would the closing tag look like?',
            highlight: ['HTML'],
            options: ['<html>', '<end html>', '>html<', '</html>'],
            correctOption: 4
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Cabeçalho e corpo', en: 'Head and body' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Toda página HTML se divide em duas partes principais: o <head> e o <body>.',
            secondParagraph: 'O <head> guarda informações sobre a página que a pessoa não vê diretamente, como o título que aparece na aba do navegador.',
            endParagraph: 'Já o <body> é onde fica todo o conteúdo visível: textos, imagens, botões e tudo mais.',
            highlight: ['head', 'body', 'HTML'],
            codeLanguage: 'HTML',
            code: HTML_STRUCTURE_CODE
          },
          en: {
            firstParagraph: 'Every HTML page is split into two main parts: the <head> and the <body>.',
            secondParagraph: 'The <head> holds information about the page that the reader does not see directly, such as the title shown on the browser tab.',
            endParagraph: 'The <body> is where all the visible content lives: text, images, buttons and everything else.',
            highlight: ['head', 'body', 'HTML'],
            codeLanguage: 'HTML',
            code: HTML_STRUCTURE_CODE
          }
        }
      },
      {
        type: 'option',
        content: {
          pt: {
            question: 'Em qual das tags abaixo fica o conteúdo visível da página?',
            highlight: ['HTML'],
            options: ['<head>', '<body>', '<title>', '<doctype>'],
            correctOption: 2
          },
          en: {
            question: 'Which of the tags below holds the visible content of the page?',
            highlight: ['HTML'],
            options: ['<head>', '<body>', '<title>', '<doctype>'],
            correctOption: 2
          }
        }
      }
    ]
  }
]

async function seedExampleLessons (localeIds: Map<LocaleCode, number>): Promise<void> {
  // A área é localizada por `name` (coluna real, escrita por este mesmo
  // seeder) e nunca por um `id` literal — ids são autoincrement e não voltam
  // atrás depois de um DELETE, então não há valor previsível para supor.
  const htmlArea = await prisma.areas.findFirst({ where: { name: 'HTML' }, orderBy: { id: 'asc' } })
  if (htmlArea === null) {
    console.log('Área HTML não encontrada — pulando lições de exemplo.')
    return
  }

  const firstModule = await prisma.modules.findFirst({
    where: { area_id: htmlArea.id },
    orderBy: { index: 'asc' }
  })
  if (firstModule === null) {
    console.log('Primeiro módulo de HTML não encontrado — pulando lições de exemplo.')
    return
  }

  // Guarda própria e escopada a este módulo. Não pode depender do guard de
  // `seedAreasAndModules` (que já está satisfeito em qualquer banco seedado,
  // e portanto nunca deixaria este bloco rodar), nem ser uma contagem global
  // de `lessons` — senão qualquer lição criada em outro módulo, no futuro,
  // impediria este seed de exemplo de rodar.
  const existingLessons = await prisma.lessons.count({ where: { module_id: firstModule.id } })
  if (existingLessons > 0) {
    console.log(`Lições de exemplo já seedadas (${existingLessons} encontradas) — pulando.`)
    return
  }

  for (let lessonIndex = 0; lessonIndex < EXAMPLE_LESSONS.length; lessonIndex++) {
    const lessonSeed = EXAMPLE_LESSONS[lessonIndex]
    const lesson = await prisma.lessons.create({
      data: { module_id: firstModule.id, index: lessonIndex }
    })

    await prisma.lesson_translations.createMany({
      data: LOCALES.map(({ code }) => ({
        lesson_id: lesson.id,
        locale_id: localeIds.get(code)!,
        name: lessonSeed.name[code]
      }))
    })

    for (let activityIndex = 0; activityIndex < lessonSeed.activities.length; activityIndex++) {
      const activitySeed = lessonSeed.activities[activityIndex]
      const activity = await prisma.activities.create({
        data: { lesson_id: lesson.id, index: activityIndex, type: activitySeed.type }
      })

      await prisma.activity_translations.createMany({
        data: LOCALES.map(({ code }) => ({
          activity_id: activity.id,
          locale_id: localeIds.get(code)!,
          content: activitySeed.content[code]
        }))
      })
    }
  }

  const activityCount = EXAMPLE_LESSONS.reduce((total, lesson) => total + lesson.activities.length, 0)
  console.log(`Seed de conteúdo concluído: ${EXAMPLE_LESSONS.length} lições, ${activityCount} atividades no primeiro módulo de HTML.`)
}

async function main (): Promise<void> {
  const localeIds = await seedLocales()
  await seedAreasAndModules(localeIds)
  await seedExampleLessons(localeIds)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
