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

// Conteúdo curricular real do primeiro módulo de HTML ("HTML Básico"): 8
// lições cobrindo os fundamentos da linguagem, cada uma com até 2 atividades
// teóricas. Só `theory` por enquanto — a parte prática (`option`) ainda está
// em validação e entra depois, no lugar/complemento destas mesmas lições.
type ActivitySeed = {
  type: 'theory' | 'option';
  content: Record<LocaleCode, TheoryActivityContent | OptionActivityContent>;
}

type LessonSeed = {
  name: Record<LocaleCode, string>;
  activities: ActivitySeed[];
}

// Cada trecho de código tem uma versão por idioma: a sintaxe/tags são
// idênticas, mas o texto visível (rótulos, títulos, parágrafos dentro do
// próprio HTML de exemplo) é traduzido de verdade — mesmo padrão adotado nos
// textos das lições, para quem estuda em inglês não ver português dentro do
// próprio exemplo de código.
const HELLO_WORLD_CODE_PT = `<h1>Olá, mundo!</h1>
<p>Minha primeira página web.</p>`

const HELLO_WORLD_CODE_EN = `<h1>Hello, world!</h1>
<p>My first web page.</p>`

const PARAGRAPH_CODE_PT = '<p>Este é um parágrafo.</p>'

const PARAGRAPH_CODE_EN = '<p>This is a paragraph.</p>'

const DOCUMENT_STRUCTURE_CODE_PT = `<!DOCTYPE html>
<html>
  <head>
    <title>Minha página</title>
  </head>
  <body>
    <h1>Olá!</h1>
  </body>
</html>`

const DOCUMENT_STRUCTURE_CODE_EN = `<!DOCTYPE html>
<html>
  <head>
    <title>My page</title>
  </head>
  <body>
    <h1>Hello!</h1>
  </body>
</html>`

const HEAD_BODY_CODE_PT = `<head>
  <title>Meu site</title>
</head>

<body>
  <h1>Bem-vindo!</h1>
  <p>Este conteúdo aparece na página.</p>
</body>`

const HEAD_BODY_CODE_EN = `<head>
  <title>My site</title>
</head>

<body>
  <h1>Welcome!</h1>
  <p>This content appears on the page.</p>
</body>`

const HEADINGS_CODE_PT = `<h1>Título principal</h1>
<h2>Seção</h2>
<h3>Subseção</h3>`

const HEADINGS_CODE_EN = `<h1>Main heading</h1>
<h2>Section</h2>
<h3>Subsection</h3>`

const EMPHASIS_CODE_PT = `<p>
  Aprender <strong>HTML</strong> é importante
  para criar páginas web.
</p>

<p>
  Este texto tem <em>destaque</em>.
</p>`

const EMPHASIS_CODE_EN = `<p>
  Learning <strong>HTML</strong> is important
  for building web pages.
</p>

<p>
  This text has <em>emphasis</em>.
</p>`

const LINK_EXTERNAL_CODE_PT = `<a href="https://example.com">
  Visitar o site
</a>`

const LINK_EXTERNAL_CODE_EN = `<a href="https://example.com">
  Visit the site
</a>`

const LINK_RELATIVE_CODE_PT = `<a href="sobre.html">
  Sobre nós
</a>`

const LINK_RELATIVE_CODE_EN = `<a href="about.html">
  About us
</a>`

const IMAGE_CODE_PT = '<img src="imagem.jpg" alt="Uma paisagem" />'

const IMAGE_CODE_EN = '<img src="image.jpg" alt="A landscape" />'

const IMAGE_ALT_CODE_PT = '<img src="gato.jpg" alt="Gato sentado em uma cadeira" />'

const IMAGE_ALT_CODE_EN = '<img src="cat.jpg" alt="Cat sitting on a chair" />'

const LIST_UNORDERED_CODE = `<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>`

const LIST_ORDERED_CODE_PT = `<ol>
  <li>Abrir o navegador</li>
  <li>Acessar o site</li>
  <li>Fazer login</li>
</ol>`

const LIST_ORDERED_CODE_EN = `<ol>
  <li>Open the browser</li>
  <li>Go to the site</li>
  <li>Log in</li>
</ol>`

const ATTRIBUTE_LINK_CODE_PT = `<a href="https://example.com">
  Acessar
</a>`

const ATTRIBUTE_LINK_CODE_EN = `<a href="https://example.com">
  Access
</a>`

const ATTRIBUTE_MULTI_CODE_PT = `<img src="gato.jpg" alt="Gato sentado" />

<a href="sobre.html">
  Sobre
</a>`

const ATTRIBUTE_MULTI_CODE_EN = `<img src="cat.jpg" alt="Cat sitting" />

<a href="about.html">
  About
</a>`

const DIV_CODE_PT = `<div>
  <h2>Perfil</h2>
  <p>Desenvolvedor web</p>
</div>`

const DIV_CODE_EN = `<div>
  <h2>Profile</h2>
  <p>Web developer</p>
</div>`

const SPAN_CODE_PT = `<p>
  Meu nome é
  <span>Gabriel</span>.
</p>`

const SPAN_CODE_EN = `<p>
  My name is
  <span>Gabriel</span>.
</p>`

const HTML_BASIC_LESSONS: LessonSeed[] = [
  {
    name: { pt: 'O que é HTML?', en: 'What is HTML?' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Olá, aqui é o Cody! HTML é a linguagem usada para estruturar o conteúdo de uma página web. Ele informa ao navegador o que cada parte da página representa, como títulos, parágrafos, imagens e links.',
            secondParagraph: 'HTML significa HyperText Markup Language. Apesar do nome, HTML não é uma linguagem de programação: ele é uma linguagem de marcação.',
            endParagraph: 'O HTML define a estrutura e o significado do conteúdo. A aparência será trabalhada depois, com CSS.',
            highlight: ['Cody', 'HTML', 'CSS', 'web'],
            codeLanguage: 'HTML',
            code: HELLO_WORLD_CODE_PT
          },
          en: {
            firstParagraph: "Hi, it's Cody! HTML is the language used to structure the content of a web page. It tells the browser what each part of the page represents, like headings, paragraphs, images and links.",
            secondParagraph: 'HTML stands for HyperText Markup Language. Despite the name, HTML is not a programming language: it is a markup language.',
            endParagraph: 'HTML defines the structure and meaning of the content. Appearance comes later, with CSS.',
            highlight: ['Cody', 'HTML', 'CSS', 'web'],
            codeLanguage: 'HTML',
            code: HELLO_WORLD_CODE_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um elemento HTML normalmente é formado por uma tag de abertura, seu conteúdo e uma tag de fechamento.',
            secondParagraph: 'No exemplo abaixo, <p> indica o início de um parágrafo e </p> indica o fim dele.',
            endParagraph: 'Tags informam ao navegador como interpretar cada parte do conteúdo. Combinando elementos diferentes, é possível montar uma página inteira.',
            highlight: ['HTML', 'p'],
            codeLanguage: 'HTML',
            code: PARAGRAPH_CODE_PT
          },
          en: {
            firstParagraph: 'An HTML element is usually made of an opening tag, its content, and a closing tag.',
            secondParagraph: 'In the example below, <p> marks the start of a paragraph and </p> marks its end.',
            endParagraph: 'Tags tell the browser how to interpret each part of the content. By combining different elements, you can build an entire page.',
            highlight: ['HTML', 'p'],
            codeLanguage: 'HTML',
            code: PARAGRAPH_CODE_EN
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Estrutura de um documento HTML', en: 'Structure of an HTML document' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma página HTML tem uma estrutura básica que organiza suas informações. O navegador usa essa estrutura para interpretar o documento corretamente.',
            endParagraph: 'Todo documento HTML começa com uma estrutura parecida com essa. Dentro dela, cada parte tem uma função específica.',
            highlight: ['HTML'],
            codeLanguage: 'HTML',
            code: DOCUMENT_STRUCTURE_CODE_PT
          },
          en: {
            firstParagraph: 'An HTML page has a basic structure that organizes its information. The browser uses this structure to interpret the document correctly.',
            endParagraph: 'Every HTML document starts with a structure like this one. Inside it, each part has a specific role.',
            highlight: ['HTML'],
            codeLanguage: 'HTML',
            code: DOCUMENT_STRUCTURE_CODE_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O <head> guarda informações sobre a página que não aparecem diretamente para quem visita, como o título mostrado na aba do navegador. Já o <body> reúne tudo que é exibido: textos, imagens, botões e o restante.',
            endParagraph: 'Pense no <head> como dados sobre o documento, e no <body> como o conteúdo da página.',
            highlight: ['head', 'body'],
            codeLanguage: 'HTML',
            code: HEAD_BODY_CODE_PT
          },
          en: {
            firstParagraph: "The <head> holds information about the page that isn't shown directly to visitors, like the title shown on the browser tab. The <body> holds everything that's displayed: text, images, buttons, and more.",
            endParagraph: "Think of the <head> as data about the document, and the <body> as the page's content.",
            highlight: ['head', 'body'],
            codeLanguage: 'HTML',
            code: HEAD_BODY_CODE_EN
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Texto e títulos', en: 'Text and headings' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'HTML tem seis níveis de título, de <h1> a <h6>. Eles representam diferentes níveis de importância dentro da estrutura do conteúdo.',
            endParagraph: 'Os títulos ajudam a organizar o conteúdo em uma hierarquia. Use o nível que representa a posição daquele conteúdo na página.',
            highlight: ['HTML', 'h1', 'h6'],
            codeLanguage: 'HTML',
            code: HEADINGS_CODE_PT
          },
          en: {
            firstParagraph: 'HTML has six heading levels, from <h1> to <h6>. They represent different levels of importance within the structure of the content.',
            endParagraph: "Headings help organize content into a hierarchy. Use the level that matches that content's position on the page.",
            highlight: ['HTML', 'h1', 'h6'],
            codeLanguage: 'HTML',
            code: HEADINGS_CODE_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <p> representa um parágrafo. Para destacar uma informação, é possível usar elementos como <strong> e <em>.',
            endParagraph: 'Use elementos de texto pensando no significado que você quer transmitir, e não só na aparência.',
            highlight: ['p', 'strong'],
            codeLanguage: 'HTML',
            code: EMPHASIS_CODE_PT
          },
          en: {
            firstParagraph: 'The <p> element represents a paragraph. To emphasize information, you can use elements like <strong> and <em>.',
            endParagraph: 'Choose text elements based on the meaning you want to convey, not just how they look.',
            highlight: ['p', 'strong'],
            codeLanguage: 'HTML',
            code: EMPHASIS_CODE_EN
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Links', en: 'Links' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <a> cria links para outras páginas, arquivos ou endereços. O destino é definido pelo atributo href.',
            endParagraph: 'O texto dentro do <a> é o que a pessoa vê. O atributo href informa para onde o link leva.',
            highlight: ['href', 'link', 'links'],
            codeLanguage: 'HTML',
            code: LINK_EXTERNAL_CODE_PT
          },
          en: {
            firstParagraph: 'The <a> element creates links to other pages, files, or addresses. The destination is set by the href attribute.',
            endParagraph: 'The text inside the <a> is what the reader sees. The href attribute tells the browser where the link goes.',
            highlight: ['href', 'link', 'links'],
            codeLanguage: 'HTML',
            code: LINK_EXTERNAL_CODE_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Nem todo link aponta para outro site. Também é possível apontar para arquivos ou páginas que fazem parte do próprio projeto.',
            endParagraph: 'Links relativos são úteis para conectar páginas diferentes de um mesmo site. O caminho é interpretado a partir da localização do arquivo atual.',
            highlight: ['link', 'links'],
            codeLanguage: 'HTML',
            code: LINK_RELATIVE_CODE_PT
          },
          en: {
            firstParagraph: 'Not every link points to another site. You can also point to files or pages that are part of your own project.',
            endParagraph: 'Relative links are useful for connecting different pages of the same site. The path is interpreted based on the location of the current file.',
            highlight: ['link', 'links'],
            codeLanguage: 'HTML',
            code: LINK_RELATIVE_CODE_EN
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Imagens', en: 'Images' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <img> permite adicionar uma imagem à página. Diferente de muitos elementos HTML, ele não tem uma tag de fechamento.',
            endParagraph: 'O atributo src indica onde está a imagem. O navegador usa esse caminho para carregá-la.',
            highlight: ['img', 'src', 'HTML'],
            codeLanguage: 'HTML',
            code: IMAGE_CODE_PT
          },
          en: {
            firstParagraph: "The <img> element lets you add an image to the page. Unlike many HTML elements, it doesn't have a closing tag.",
            endParagraph: 'The src attribute points to the image. The browser uses that path to load it.',
            highlight: ['img', 'src', 'HTML'],
            codeLanguage: 'HTML',
            code: IMAGE_CODE_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O atributo alt traz uma descrição em texto da imagem. Ele é importante quando a imagem não carrega, e também para tecnologias assistivas.',
            endParagraph: 'Escreva um alt que descreva o propósito ou o conteúdo relevante da imagem. Não deixe esse atributo de lado.',
            highlight: ['alt'],
            codeLanguage: 'HTML',
            code: IMAGE_ALT_CODE_PT
          },
          en: {
            firstParagraph: "The alt attribute gives a text description of the image. It matters when the image fails to load, and also for assistive technologies.",
            endParagraph: "Write an alt that describes the image's purpose or relevant content. Don't skip this attribute.",
            highlight: ['alt'],
            codeLanguage: 'HTML',
            code: IMAGE_ALT_CODE_EN
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Listas', en: 'Lists' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Use <ul> quando a ordem dos itens não for importante. Cada item da lista é representado por <li>.',
            endParagraph: 'A estrutura é simples: <ul> representa a lista, e cada <li> representa um item.',
            highlight: ['ul', 'li'],
            codeLanguage: 'HTML',
            code: LIST_UNORDERED_CODE
          },
          en: {
            firstParagraph: "Use <ul> when the order of the items doesn't matter. Each list item is represented by <li>.",
            endParagraph: 'The structure is simple: <ul> represents the list, and each <li> represents one item.',
            highlight: ['ul', 'li'],
            codeLanguage: 'HTML',
            code: LIST_UNORDERED_CODE
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando a ordem dos itens importa, é possível usar <ol>. Os itens continuam sendo representados por <li>.',
            endParagraph: 'A escolha entre <ul> e <ol> depende do significado da lista, não só da aparência.',
            highlight: ['ol', 'li', 'ul'],
            codeLanguage: 'HTML',
            code: LIST_ORDERED_CODE_PT
          },
          en: {
            firstParagraph: 'When the order of the items matters, you can use <ol>. Items are still represented by <li>.',
            endParagraph: 'The choice between <ul> and <ol> depends on the meaning of the list, not just how it looks.',
            highlight: ['ol', 'li', 'ul'],
            codeLanguage: 'HTML',
            code: LIST_ORDERED_CODE_EN
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Atributos', en: 'Attributes' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Atributos trazem informações adicionais sobre um elemento HTML. Eles aparecem na tag de abertura e costumam ter um nome e um valor.',
            secondParagraph: 'No exemplo abaixo, href é um atributo. Ele informa ao elemento <a> qual endereço deve ser aberto.',
            endParagraph: 'Tags definem elementos. Atributos adicionam informações ou configurações a esses elementos.',
            highlight: ['HTML', 'href'],
            codeLanguage: 'HTML',
            code: ATTRIBUTE_LINK_CODE_PT
          },
          en: {
            firstParagraph: 'Attributes provide extra information about an HTML element. They appear in the opening tag and usually have a name and a value.',
            secondParagraph: 'In the example below, href is an attribute. It tells the <a> element which address to open.',
            endParagraph: 'Tags define elements. Attributes add information or settings to those elements.',
            highlight: ['HTML', 'href'],
            codeLanguage: 'HTML',
            code: ATTRIBUTE_LINK_CODE_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Elementos diferentes têm atributos próprios, de acordo com sua necessidade.',
            endParagraph: 'No <img>, src indica a imagem e alt traz uma descrição. No <a>, href indica o destino do link.',
            highlight: ['img', 'src', 'alt', 'href'],
            codeLanguage: 'HTML',
            code: ATTRIBUTE_MULTI_CODE_PT
          },
          en: {
            firstParagraph: 'Different elements have their own attributes, depending on what they need.',
            endParagraph: "In <img>, src points to the image and alt provides a description. In <a>, href points to the link's destination.",
            highlight: ['img', 'src', 'alt', 'href'],
            codeLanguage: 'HTML',
            code: ATTRIBUTE_MULTI_CODE_EN
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Div e Span', en: 'Div and Span' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <div> é um contêiner genérico usado para agrupar outros elementos. Ele é útil para organizar partes da página.',
            endParagraph: 'O <div> não indica um significado específico para o conteúdo. Ele serve, principalmente, como um contêiner.',
            highlight: ['div'],
            codeLanguage: 'HTML',
            code: DIV_CODE_PT
          },
          en: {
            firstParagraph: "The <div> element is a generic container used to group other elements. It's useful for organizing parts of the page.",
            endParagraph: "The <div> doesn't carry a specific meaning for the content. It mainly works as a container.",
            highlight: ['div'],
            codeLanguage: 'HTML',
            code: DIV_CODE_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O <span> também é um contêiner genérico, mas costuma ser usado para pequenos trechos de conteúdo dentro de uma linha.',
            endParagraph: 'A diferença principal está no uso: <div> costuma agrupar blocos maiores, enquanto <span> envolve pequenos trechos de conteúdo.',
            highlight: ['div', 'span'],
            codeLanguage: 'HTML',
            code: SPAN_CODE_PT
          },
          en: {
            firstParagraph: "The <span> is also a generic container, but it's typically used for small pieces of content inside a line of text.",
            endParagraph: 'The key difference is in the use: <div> usually groups larger blocks, while <span> wraps small pieces of content.',
            highlight: ['div', 'span'],
            codeLanguage: 'HTML',
            code: SPAN_CODE_EN
          }
        }
      }
    ]
  }
]

async function seedHtmlBasicLessons (localeIds: Map<LocaleCode, number>): Promise<void> {
  // A área é localizada por `name` (coluna real, escrita por este mesmo
  // seeder) e nunca por um `id` literal — ids são autoincrement e não voltam
  // atrás depois de um DELETE, então não há valor previsível para supor.
  const htmlArea = await prisma.areas.findFirst({ where: { name: 'HTML' }, orderBy: { id: 'asc' } })
  if (htmlArea === null) {
    console.log('Área HTML não encontrada — pulando lições do módulo básico.')
    return
  }

  const firstModule = await prisma.modules.findFirst({
    where: { area_id: htmlArea.id },
    orderBy: { index: 'asc' }
  })
  if (firstModule === null) {
    console.log('Primeiro módulo de HTML não encontrado — pulando lições do módulo básico.')
    return
  }

  // Guarda própria e escopada a este módulo. Não pode depender do guard de
  // `seedAreasAndModules` (que já está satisfeito em qualquer banco seedado,
  // e portanto nunca deixaria este bloco rodar), nem ser uma contagem global
  // de `lessons` — senão qualquer lição criada em outro módulo, no futuro,
  // impediria este seed de rodar.
  const existingLessons = await prisma.lessons.count({ where: { module_id: firstModule.id } })
  if (existingLessons > 0) {
    console.log(`Lições do módulo básico já seedadas (${existingLessons} encontradas) — pulando.`)
    return
  }

  for (let lessonIndex = 0; lessonIndex < HTML_BASIC_LESSONS.length; lessonIndex++) {
    const lessonSeed = HTML_BASIC_LESSONS[lessonIndex]
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

  const activityCount = HTML_BASIC_LESSONS.reduce((total, lesson) => total + lesson.activities.length, 0)
  console.log(`Seed de conteúdo concluído: ${HTML_BASIC_LESSONS.length} lições, ${activityCount} atividades no primeiro módulo de HTML.`)
}

async function main (): Promise<void> {
  const localeIds = await seedLocales()
  await seedAreasAndModules(localeIds)
  await seedHtmlBasicLessons(localeIds)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
