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

// Conteúdo curricular real do primeiro módulo de CSS ("CSS Básico"): 9
// lições cobrindo os fundamentos de CSS para quem já tem contato com HTML,
// cada uma com até 2 atividades teóricas. Várias telas usam `additionalCode`
// (HTML + CSS juntos) para a aba "Web" do `CodeSection` conseguir renderizar
// a demonstração — ver `app/CLAUDE.md`.
const CSS1_T1_HTML_PT = '<p class="destaque">Olá, mundo!</p>'
const CSS1_T1_HTML_EN = '<p class="highlight">Hello, world!</p>'
const CSS1_T1_CSS_PT = '.destaque {\n  color: blue;\n}'
const CSS1_T1_CSS_EN = '.highlight {\n  color: blue;\n}'

const CSS1_T2_HTML_PT = '<h1>Meu site</h1>'
const CSS1_T2_HTML_EN = '<h1>My website</h1>'
const CSS1_T2_CSS = 'h1 {\n  color: blue;\n  font-size: 32px;\n}'

const CSS2_T1_HTML_PT = '<p style="color: blue;">\n  Texto com CSS inline.\n</p>\n\n<style>\n  p {\n    font-size: 20px;\n  }\n</style>'
const CSS2_T1_HTML_EN = '<p style="color: blue;">\n  Text with inline CSS.\n</p>\n\n<style>\n  p {\n    font-size: 20px;\n  }\n</style>'

const CSS2_T2_HTML_PT = '<link rel="stylesheet" href="style.css">\n\n<p>Texto do site</p>'
const CSS2_T2_HTML_EN = '<link rel="stylesheet" href="style.css">\n\n<p>Site text</p>'
const CSS2_T2_CSS = 'p {\n  color: blue;\n}'

const CSS3_T1_CSS = 'p {\n  color: blue;\n}'
const CSS3_T1_HTML_PT = '<p>Primeiro parágrafo.</p>\n<p>Segundo parágrafo.</p>'
const CSS3_T1_HTML_EN = '<p>First paragraph.</p>\n<p>Second paragraph.</p>'

const CSS3_T2_HTML_PT = '<p class="destaque">Primeiro texto</p>\n<p class="destaque">Segundo texto</p>\n\n<h1 id="titulo">Meu site</h1>'
const CSS3_T2_HTML_EN = '<p class="highlight">First text</p>\n<p class="highlight">Second text</p>\n\n<h1 id="title">My website</h1>'
const CSS3_T2_CSS_PT = '.destaque {\n  color: blue;\n}\n\n#titulo {\n  font-size: 32px;\n}'
const CSS3_T2_CSS_EN = '.highlight {\n  color: blue;\n}\n\n#title {\n  font-size: 32px;\n}'

const CSS4_T1_CSS = 'h1 {\n  color: blue;\n}\n\np {\n  color: #333;\n}'
const CSS4_T1_HTML_PT = '<h1>Título</h1>\n<p>Texto do parágrafo.</p>'
const CSS4_T1_HTML_EN = '<h1>Heading</h1>\n<p>Paragraph text.</p>'

const CSS4_T2_CSS = '.card {\n  background-color: #f2f2f2;\n}'
const CSS4_T2_HTML_PT = '<div class="card">\n  <p>Meu conteúdo</p>\n</div>'
const CSS4_T2_HTML_EN = '<div class="card">\n  <p>My content</p>\n</div>'

const CSS5_T1_CSS = 'h1 {\n  font-size: 32px;\n  font-weight: 700;\n}\n\np {\n  font-size: 16px;\n  font-weight: 400;\n}'
const CSS5_T1_HTML_PT = '<h1>Título grande</h1>\n<p>Texto menor.</p>'
const CSS5_T1_HTML_EN = '<h1>Big heading</h1>\n<p>Smaller text.</p>'

const CSS5_T2_CSS = 'body {\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  text-align: center;\n}'
const CSS5_T2_HTML_PT = '<h1>Meu site</h1>'
const CSS5_T2_HTML_EN = '<h1>My website</h1>'

const CSS6_T1_CSS = '.card {\n  width: 200px;\n  padding: 20px;\n  border: 2px solid black;\n  margin: 10px;\n}'
const CSS6_T2_CSS = '.card {\n  padding: 20px;\n  border: 2px solid black;\n  margin: 16px;\n}'
const CSS6_HTML_PT = '<div class="card">Conteúdo</div>'
const CSS6_HTML_EN = '<div class="card">Content</div>'

const CSS7_T1_CSS = '.card {\n  width: 300px;\n  height: 150px;\n}'
const CSS7_T1_HTML_PT = '<div class="card">Caixa</div>'
const CSS7_T1_HTML_EN = '<div class="card">Box</div>'
const CSS7_T2_CSS = '.container {\n  width: 80%;\n}\n\n.card {\n  width: 300px;\n}'

const CSS8_T1_CSS = 'div {\n  display: block;\n}\n\nspan {\n  display: inline;\n}'
const CSS8_T1_HTML = '<div>Div 1</div>\n<div>Div 2</div>\n<span>Span 1</span>\n<span>Span 2</span>'

const CSS8_T2_CSS = '.button {\n  display: inline-block;\n}\n\n.hidden {\n  display: none;\n}'
const CSS8_T2_HTML_PT = '<div class="button">Botão</div>\n<div class="hidden">Escondido</div>'
const CSS8_T2_HTML_EN = '<div class="button">Button</div>\n<div class="hidden">Hidden</div>'

const CSS9_T1_CSS = '.card {\n  width: 300px;\n  padding: 20px;\n  background-color: #f2f2f2;\n  border: 1px solid #ccc;\n}\n\n.card h2 {\n  color: #222;\n}'
const CSS9_T1_HTML_PT = '<div class="card">\n  <h2>Meu cartão</h2>\n  <p>Um conteúdo simples.</p>\n</div>'
const CSS9_T1_HTML_EN = '<div class="card">\n  <h2>My card</h2>\n  <p>Some simple content.</p>\n</div>'
const CSS9_T2_CSS = '.card {\n  width: 300px;\n  padding: 20px;\n  margin: 16px;\n  color: #222;\n  background-color: #f2f2f2;\n}'

const CSS_BASIC_LESSONS: LessonSeed[] = [
  {
    name: { pt: 'O que é CSS?', en: 'What is CSS?' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'CSS é a linguagem usada para definir a aparência de uma página web. Com ele, podemos controlar cores, tamanhos, espaçamentos, fontes e muitos outros aspectos visuais.',
            secondParagraph: 'Enquanto o HTML organiza o conteúdo da página, o CSS define como esse conteúdo será apresentado.',
            endParagraph: 'HTML fornece a estrutura. CSS acrescenta a apresentação visual. Os dois trabalham juntos para construir uma página web.',
            highlight: ['CSS', 'HTML'],
            codeLanguage: 'HTML',
            code: CSS1_T1_HTML_PT,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS1_T1_CSS_PT }]
          },
          en: {
            firstParagraph: "CSS is the language used to define the appearance of a web page. With it, we can control colors, sizes, spacing, fonts and many other visual aspects.",
            secondParagraph: "While HTML organizes the page's content, CSS defines how that content will be presented.",
            endParagraph: 'HTML provides the structure. CSS adds the visual presentation. The two work together to build a web page.',
            highlight: ['CSS', 'HTML'],
            codeLanguage: 'HTML',
            code: CSS1_T1_HTML_EN,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS1_T1_CSS_EN }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Para aplicar CSS, precisamos selecionar um elemento HTML e definir quais propriedades queremos alterar.',
            endParagraph: 'Uma regra CSS possui um seletor e um conjunto de declarações. O seletor indica o elemento que será estilizado.',
            highlight: ['CSS', 'seletor'],
            codeLanguage: 'HTML',
            code: CSS1_T2_HTML_PT,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS1_T2_CSS }]
          },
          en: {
            firstParagraph: 'To apply CSS, we need to select an HTML element and define which properties we want to change.',
            endParagraph: 'A CSS rule has a selector and a set of declarations. The selector indicates which element will be styled.',
            highlight: ['CSS', 'selector'],
            codeLanguage: 'HTML',
            code: CSS1_T2_HTML_EN,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS1_T2_CSS }]
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Como adicionar CSS', en: 'How to add CSS' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Existem diferentes formas de adicionar CSS a uma página. Podemos escrever estilos diretamente no elemento ou dentro do próprio documento HTML.',
            endParagraph: 'Essas formas funcionam, mas misturar muitos estilos ao HTML pode dificultar a manutenção da página.',
            highlight: ['CSS', 'inline'],
            codeLanguage: 'HTML',
            code: CSS2_T1_HTML_PT
          },
          en: {
            firstParagraph: 'There are different ways to add CSS to a page. We can write styles directly on the element or inside the HTML document itself.',
            endParagraph: 'These approaches work, but mixing too many styles into the HTML can make the page harder to maintain.',
            highlight: ['CSS', 'inline'],
            codeLanguage: 'HTML',
            code: CSS2_T1_HTML_EN
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Em projetos reais, é comum colocar os estilos em um arquivo CSS separado. Isso mantém estrutura e apresentação organizadas em arquivos diferentes.',
            endParagraph: 'Separar o CSS do HTML facilita a organização e permite reutilizar os mesmos estilos em várias páginas.',
            highlight: ['CSS', 'arquivo'],
            codeLanguage: 'HTML',
            code: CSS2_T2_HTML_PT,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS2_T2_CSS }]
          },
          en: {
            firstParagraph: "In real projects, it's common to put styles in a separate CSS file. This keeps structure and presentation organized in different files.",
            endParagraph: 'Separating CSS from HTML makes organization easier and allows reusing the same styles across multiple pages.',
            highlight: ['CSS', 'file'],
            codeLanguage: 'HTML',
            code: CSS2_T2_HTML_EN,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS2_T2_CSS }]
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Seletores', en: 'Selectors' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um seletor informa ao CSS quais elementos devem receber uma regra. O seletor mais simples é o seletor por elemento.',
            endParagraph: 'Nesse exemplo, todos os elementos p recebem a cor definida pela regra.',
            highlight: ['CSS', 'seletor'],
            codeLanguage: 'CSS',
            code: CSS3_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS3_T1_HTML_PT }]
          },
          en: {
            firstParagraph: 'A selector tells CSS which elements should receive a rule. The simplest selector is the element selector.',
            endParagraph: 'In this example, every p element receives the color defined by the rule.',
            highlight: ['CSS', 'selector'],
            codeLanguage: 'CSS',
            code: CSS3_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS3_T1_HTML_EN }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma classe permite aplicar um mesmo estilo a vários elementos. Um ID identifica um elemento específico dentro da página.',
            endParagraph: 'Use classe quando um estilo pode ser reutilizado. O ID representa uma identificação específica e deve ser utilizado com esse propósito.',
            highlight: ['classe', 'ID'],
            codeLanguage: 'HTML',
            code: CSS3_T2_HTML_PT,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS3_T2_CSS_PT }]
          },
          en: {
            firstParagraph: 'A class lets you apply the same style to several elements. An ID identifies one specific element on the page.',
            endParagraph: 'Use a class when a style can be reused. An ID represents a specific identification and should be used for that purpose.',
            highlight: ['class', 'ID'],
            codeLanguage: 'HTML',
            code: CSS3_T2_HTML_EN,
            additionalCode: [{ codeLanguage: 'CSS', code: CSS3_T2_CSS_EN }]
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Cores e fundos', en: 'Colors and backgrounds' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade color define a cor do texto de um elemento.',
            endParagraph: 'CSS permite representar cores de diferentes formas. Neste momento, basta conhecer nomes de cores e valores hexadecimais.',
            highlight: ['color', 'CSS'],
            codeLanguage: 'CSS',
            code: CSS4_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS4_T1_HTML_PT }]
          },
          en: {
            firstParagraph: "The color property defines the text color of an element.",
            endParagraph: "CSS lets you represent colors in different ways. For now, it's enough to know color names and hexadecimal values.",
            highlight: ['color', 'CSS'],
            codeLanguage: 'CSS',
            code: CSS4_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS4_T1_HTML_EN }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade background-color define a cor de fundo de um elemento.',
            endParagraph: 'Podemos combinar color e background-color para controlar o contraste entre o conteúdo e o fundo.',
            highlight: ['background-color'],
            codeLanguage: 'CSS',
            code: CSS4_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS4_T2_HTML_PT }]
          },
          en: {
            firstParagraph: 'The background-color property defines the background color of an element.',
            endParagraph: 'We can combine color and background-color to control the contrast between content and background.',
            highlight: ['background-color'],
            codeLanguage: 'CSS',
            code: CSS4_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS4_T2_HTML_EN }]
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Texto e fontes', en: 'Text and fonts' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'As propriedades font-size e font-weight controlam, respectivamente, o tamanho e o peso da fonte.',
            endParagraph: 'Essas propriedades ajudam a criar uma hierarquia visual entre títulos, textos e outras informações.',
            highlight: ['font-size', 'font-weight'],
            codeLanguage: 'CSS',
            code: CSS5_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS5_T1_HTML_PT }]
          },
          en: {
            firstParagraph: 'The font-size and font-weight properties control, respectively, the size and weight of the font.',
            endParagraph: "These properties help create a visual hierarchy between headings, text and other information.",
            highlight: ['font-size', 'font-weight'],
            codeLanguage: 'CSS',
            code: CSS5_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS5_T1_HTML_EN }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'font-family define a família tipográfica utilizada. Já text-align controla o alinhamento horizontal do texto.',
            endParagraph: 'Escolher uma fonte adequada e organizar o alinhamento ajuda a tornar o conteúdo mais legível.',
            highlight: ['font-family', 'text-align'],
            codeLanguage: 'CSS',
            code: CSS5_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS5_T2_HTML_PT }]
          },
          en: {
            firstParagraph: 'font-family defines the typeface used. text-align, in turn, controls the horizontal alignment of the text.',
            endParagraph: 'Choosing a suitable font and organizing alignment helps make content more readable.',
            highlight: ['font-family', 'text-align'],
            codeLanguage: 'CSS',
            code: CSS5_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS5_T2_HTML_EN }]
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Box Model', en: 'Box Model' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'No CSS, os elementos são tratados como caixas. Cada caixa possui conteúdo, espaçamento interno, borda e espaço externo.',
            endParagraph: 'Entender o Box Model é essencial para controlar o tamanho e o espaçamento dos elementos de uma página.',
            highlight: ['Box Model', 'CSS'],
            codeLanguage: 'CSS',
            code: CSS6_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS6_HTML_PT }]
          },
          en: {
            firstParagraph: 'In CSS, elements are treated as boxes. Each box has content, inner spacing, a border and outer spacing.',
            endParagraph: "Understanding the Box Model is essential for controlling the size and spacing of a page's elements.",
            highlight: ['Box Model', 'CSS'],
            codeLanguage: 'CSS',
            code: CSS6_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS6_HTML_EN }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'padding cria espaço entre o conteúdo e a borda. margin cria espaço ao redor da caixa. border define a borda do elemento.',
            endParagraph: 'Uma forma simples de lembrar é: padding fica dentro da borda; margin fica fora dela.',
            highlight: ['padding', 'margin', 'border'],
            codeLanguage: 'CSS',
            code: CSS6_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS6_HTML_PT }]
          },
          en: {
            firstParagraph: "padding creates space between the content and the border. margin creates space around the box. border defines the element's border.",
            endParagraph: 'A simple way to remember it: padding stays inside the border; margin stays outside it.',
            highlight: ['padding', 'margin', 'border'],
            codeLanguage: 'CSS',
            code: CSS6_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS6_HTML_EN }]
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Largura e altura', en: 'Width and height' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'As propriedades width e height definem a largura e a altura de um elemento.',
            endParagraph: 'As dimensões podem ser definidas utilizando diferentes unidades. Neste exemplo, usamos pixels.',
            highlight: ['width', 'height'],
            codeLanguage: 'CSS',
            code: CSS7_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS7_T1_HTML_PT }]
          },
          en: {
            firstParagraph: "The width and height properties define an element's width and height.",
            endParagraph: 'Dimensions can be defined using different units. In this example, we used pixels.',
            highlight: ['width', 'height'],
            codeLanguage: 'CSS',
            code: CSS7_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS7_T1_HTML_EN }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'CSS possui diferentes unidades para definir tamanhos. px representa uma medida em pixels, enquanto % utiliza uma proporção em relação ao elemento de referência.',
            secondParagraph: 'Também existem unidades como em, rem, vh e vw. Elas serão exploradas conforme avançarmos no CSS.',
            endParagraph: 'Escolher a unidade adequada ajuda a criar interfaces que se adaptam melhor a diferentes tamanhos de tela.',
            highlight: ['px', 'CSS'],
            codeLanguage: 'CSS',
            code: CSS7_T2_CSS,
            onlyCode: true
          },
          en: {
            firstParagraph: 'CSS has different units for defining sizes. px represents a measurement in pixels, while % uses a proportion relative to the reference element.',
            secondParagraph: "There are also units like em, rem, vh and vw. We'll explore them as we go further into CSS.",
            endParagraph: 'Choosing the right unit helps create interfaces that adapt better to different screen sizes.',
            highlight: ['px', 'CSS'],
            codeLanguage: 'CSS',
            code: CSS7_T2_CSS,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Display', en: 'Display' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade display define como um elemento participa do fluxo da página. Os valores block e inline são dois comportamentos fundamentais.',
            endParagraph: 'Elementos block normalmente ocupam toda a largura disponível e começam em uma nova linha. Elementos inline permanecem na mesma linha quando existe espaço.',
            highlight: ['display', 'block', 'inline'],
            codeLanguage: 'CSS',
            code: CSS8_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS8_T1_HTML }]
          },
          en: {
            firstParagraph: "The display property defines how an element takes part in the page's flow. The values block and inline are two fundamental behaviors.",
            endParagraph: "Block elements usually take up the full available width and start on a new line. Inline elements stay on the same line when there's space.",
            highlight: ['display', 'block', 'inline'],
            codeLanguage: 'CSS',
            code: CSS8_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS8_T1_HTML }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'inline-block combina características dos elementos inline e block. Já none remove o elemento da renderização da página.',
            endParagraph: 'O display controla como o elemento participa do layout. No módulo intermediário, veremos recursos mais poderosos para organizar layouts.',
            highlight: ['inline-block', 'display'],
            codeLanguage: 'CSS',
            code: CSS8_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS8_T2_HTML_PT }]
          },
          en: {
            firstParagraph: 'inline-block combines characteristics of inline and block elements. none, in turn, removes the element from the page rendering.',
            endParagraph: "display controls how the element takes part in the layout. In the intermediate module, we'll see more powerful layout resources.",
            highlight: ['inline-block', 'display'],
            codeLanguage: 'CSS',
            code: CSS8_T2_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS8_T2_HTML_EN }]
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Organizando estilos', en: 'Organizing styles' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma regra CSS pode combinar várias propriedades para criar um estilo completo.',
            endParagraph: 'CSS fica mais poderoso quando combinamos pequenas regras para construir componentes visuais completos.',
            highlight: ['CSS'],
            codeLanguage: 'CSS',
            code: CSS9_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS9_T1_HTML_PT }]
          },
          en: {
            firstParagraph: 'A CSS rule can combine several properties to create a complete style.',
            endParagraph: 'CSS becomes more powerful when we combine small rules to build complete visual components.',
            highlight: ['CSS'],
            codeLanguage: 'CSS',
            code: CSS9_T1_CSS,
            additionalCode: [{ codeLanguage: 'HTML', code: CSS9_T1_HTML_EN }]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Neste módulo, você conheceu os fundamentos necessários para começar a estilizar páginas HTML com CSS.',
            secondParagraph: 'Você aprendeu a criar regras CSS, utilizar seletores, trabalhar com cores e textos, controlar dimensões, entender o Box Model e modificar o comportamento básico dos elementos.',
            endParagraph: 'Agora você já consegue transformar uma estrutura HTML simples em uma interface com aparência organizada. No próximo nível, o foco será construir layouts com Flexbox, Grid e outros recursos de posicionamento.',
            highlight: ['CSS', 'Box Model'],
            codeLanguage: 'CSS',
            code: CSS9_T2_CSS,
            onlyCode: true
          },
          en: {
            firstParagraph: 'In this module, you learned the fundamentals needed to start styling HTML pages with CSS.',
            secondParagraph: 'You learned how to write CSS rules, use selectors, work with colors and text, control dimensions, understand the Box Model and change the basic behavior of elements.',
            endParagraph: 'Now you can turn a simple HTML structure into an interface with an organized appearance. In the next level, the focus will be building layouts with Flexbox, Grid and other positioning resources.',
            highlight: ['CSS', 'Box Model'],
            codeLanguage: 'CSS',
            code: CSS9_T2_CSS,
            onlyCode: true
          }
        }
      }
    ]
  }
]

async function seedCssBasicLessons (localeIds: Map<LocaleCode, number>): Promise<void> {
  const cssArea = await prisma.areas.findFirst({ where: { name: 'CSS' }, orderBy: { id: 'asc' } })
  if (cssArea === null) {
    console.log('Área CSS não encontrada — pulando lições do módulo básico.')
    return
  }

  const firstModule = await prisma.modules.findFirst({
    where: { area_id: cssArea.id },
    orderBy: { index: 'asc' }
  })
  if (firstModule === null) {
    console.log('Primeiro módulo de CSS não encontrado — pulando lições do módulo básico.')
    return
  }

  const existingLessons = await prisma.lessons.count({ where: { module_id: firstModule.id } })
  if (existingLessons > 0) {
    console.log(`Lições do módulo básico de CSS já seedadas (${existingLessons} encontradas) — pulando.`)
    return
  }

  for (let lessonIndex = 0; lessonIndex < CSS_BASIC_LESSONS.length; lessonIndex++) {
    const lessonSeed = CSS_BASIC_LESSONS[lessonIndex]
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

  const activityCount = CSS_BASIC_LESSONS.reduce((total, lesson) => total + lesson.activities.length, 0)
  console.log(`Seed de conteúdo concluído: ${CSS_BASIC_LESSONS.length} lições, ${activityCount} atividades no primeiro módulo de CSS.`)
}

// Conteúdo curricular real do primeiro módulo de JavaScript ("JavaScript
// Básico"): 10 lições cobrindo os fundamentos da linguagem e conceitos
// básicos de programação, cada uma com até 2 atividades teóricas. Nenhuma
// tela usa WebView aqui — este módulo ainda não executa JS de verdade (ver
// Fase 3 do roadmap em docs/roadmap-atividades-praticas.md), então todas as
// atividades são `onlyCode: true`.
const JS1_T1_PT = 'const nome = "Mundo";\n\nconsole.log("Olá, " + nome + "!");'
const JS1_T1_EN = 'const name = "World";\n\nconsole.log("Hello, " + name + "!");'
const JS1_T2_PT = 'console.log("Olá, mundo!");'
const JS1_T2_EN = 'console.log("Hello, world!");'

const JS2_T1_PT = 'let idade = 20;\n\nconsole.log(idade);'
const JS2_T1_EN = 'let age = 20;\n\nconsole.log(age);'
const JS2_T2_PT = 'let idade = 20;\nidade = 21;\n\nconst nome = "Ana";'
const JS2_T2_EN = 'let age = 20;\nage = 21;\n\nconst name = "Ana";'

const JS3_T1_PT = 'const nome = "Ana";\nconst idade = 20;\nconst estudante = true;\n\nconsole.log(nome);\nconsole.log(idade);\nconsole.log(estudante);'
const JS3_T1_EN = 'const name = "Ana";\nconst age = 20;\nconst student = true;\n\nconsole.log(name);\nconsole.log(age);\nconsole.log(student);'
const JS3_T2_PT = 'const nome = "Gabriel";\nconst idade = 21;\nconst aprovado = true;'
const JS3_T2_EN = 'const name = "Gabriel";\nconst age = 21;\nconst approved = true;'

const JS4_T1_PT = 'const soma = 10 + 5;\nconst subtracao = 10 - 5;\nconst multiplicacao = 10 * 5;\nconst divisao = 10 / 5;'
const JS4_T1_EN = 'const sum = 10 + 5;\nconst subtraction = 10 - 5;\nconst multiplication = 10 * 5;\nconst division = 10 / 5;'
const JS4_T2 = 'console.log(10 > 5);\nconsole.log(10 === 10);\nconsole.log(10 !== 5);'

const JS5_T1_PT = 'const idade = 20;\n\nif (idade >= 18) {\n  console.log("Maior de idade");\n}'
const JS5_T1_EN = 'const age = 20;\n\nif (age >= 18) {\n  console.log("Adult");\n}'
const JS5_T2_PT = 'const idade = 16;\n\nif (idade >= 18) {\n  console.log("Maior de idade");\n} else {\n  console.log("Menor de idade");\n}'
const JS5_T2_EN = 'const age = 16;\n\nif (age >= 18) {\n  console.log("Adult");\n} else {\n  console.log("Minor");\n}'

const JS6_T1 = 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}'
const JS6_T2_PT = 'let contador = 0;\n\nwhile (contador < 3) {\n  console.log(contador);\n  contador++;\n}'
const JS6_T2_EN = 'let counter = 0;\n\nwhile (counter < 3) {\n  console.log(counter);\n  counter++;\n}'

const JS7_T1_PT = 'const frutas = [\n  "maçã",\n  "banana",\n  "laranja"\n];'
const JS7_T1_EN = 'const fruits = [\n  "apple",\n  "banana",\n  "orange"\n];'
const JS7_T2_PT = 'const frutas = [\n  "maçã",\n  "banana",\n  "laranja"\n];\n\nconsole.log(frutas[0]);\nconsole.log(frutas[1]);'
const JS7_T2_EN = 'const fruits = [\n  "apple",\n  "banana",\n  "orange"\n];\n\nconsole.log(fruits[0]);\nconsole.log(fruits[1]);'

const JS8_T1_PT = 'const pessoa = {\n  nome: "Ana",\n  idade: 20\n};'
const JS8_T1_EN = 'const person = {\n  name: "Ana",\n  age: 20\n};'
const JS8_T2_PT = 'const pessoa = {\n  nome: "Ana",\n  idade: 20\n};\n\nconsole.log(pessoa.nome);\nconsole.log(pessoa.idade);'
const JS8_T2_EN = 'const person = {\n  name: "Ana",\n  age: 20\n};\n\nconsole.log(person.name);\nconsole.log(person.age);'

const JS9_T1_PT = 'function saudacao() {\n  console.log("Olá!");\n}\n\nsaudacao();'
const JS9_T1_EN = 'function greeting() {\n  console.log("Hello!");\n}\n\ngreeting();'
const JS9_T2_PT = 'function somar(a, b) {\n  return a + b;\n}\n\nconst resultado = somar(5, 3);\n\nconsole.log(resultado);'
const JS9_T2_EN = 'function add(a, b) {\n  return a + b;\n}\n\nconst result = add(5, 3);\n\nconsole.log(result);'

const JS10_T1_PT = 'const somar = (a, b) => {\n  return a + b;\n};\n\nconsole.log(somar(2, 3));\n\nconst dobrar = numero => numero * 2;'
const JS10_T1_EN = 'const add = (a, b) => {\n  return a + b;\n};\n\nconsole.log(add(2, 3));\n\nconst double = number => number * 2;'
const JS10_T2_PT = 'if (true) {\n  const mensagem = "Olá";\n  console.log(mensagem);\n}\n\n// mensagem não está disponível aqui'
const JS10_T2_EN = 'if (true) {\n  const message = "Hello";\n  console.log(message);\n}\n\n// message is not available here'

const JS_BASIC_LESSONS: LessonSeed[] = [
  {
    name: { pt: 'Conhecendo o JavaScript', en: 'Getting to know JavaScript' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript é uma linguagem de programação usada para criar comportamentos e interações em aplicações. No desenvolvimento web, ele pode fazer uma página responder às ações do usuário e processar informações.',
            secondParagraph: 'HTML define a estrutura, CSS define a aparência e JavaScript permite adicionar comportamento.',
            endParagraph: 'JavaScript permite que o programa receba informações, tome decisões, repita ações e transforme dados. Neste módulo, vamos começar pelos fundamentos da linguagem.',
            highlight: ['JavaScript', 'HTML', 'CSS'],
            codeLanguage: 'JavaScript',
            code: JS1_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript is a programming language used to create behaviors and interactions in applications. In web development, it can make a page respond to user actions and process information.',
            secondParagraph: 'HTML defines the structure, CSS defines the appearance and JavaScript lets you add behavior.',
            endParagraph: "JavaScript lets a program receive information, make decisions, repeat actions and transform data. In this module, we'll start with the fundamentals of the language.",
            highlight: ['JavaScript', 'HTML', 'CSS'],
            codeLanguage: 'JavaScript',
            code: JS1_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript pode ser executado no navegador. O código abaixo utiliza console.log() para mostrar uma informação no console.',
            endParagraph: 'O console.log() é uma ferramenta muito útil para visualizar valores durante o desenvolvimento. Agora vamos começar a trabalhar com dados.',
            highlight: ['JavaScript', 'console.log'],
            codeLanguage: 'JavaScript',
            code: JS1_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript can run in the browser. The code below uses console.log() to show information in the console.',
            endParagraph: "console.log() is a very useful tool for viewing values during development. Now let's start working with data.",
            highlight: ['JavaScript', 'console.log'],
            codeLanguage: 'JavaScript',
            code: JS1_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Variáveis', en: 'Variables' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma variável permite armazenar um valor para utilizá-lo posteriormente no programa.',
            secondParagraph: 'Aqui, idade é o nome da variável e 20 é o valor armazenado.',
            endParagraph: 'Variáveis permitem dar nomes aos dados que o programa precisa utilizar.',
            highlight: ['variável'],
            codeLanguage: 'JavaScript',
            code: JS2_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: "A variable lets you store a value to use later in the program.",
            secondParagraph: "Here, age is the variable's name and 20 is the stored value.",
            endParagraph: 'Variables let you give names to the data your program needs to use.',
            highlight: ['variable'],
            codeLanguage: 'JavaScript',
            code: JS2_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript possui diferentes formas de declarar variáveis. let permite atribuir um novo valor posteriormente, enquanto const deve permanecer com a mesma referência após sua criação.',
            endParagraph: 'Prefira const quando o valor não precisar ser reatribuído e use let quando precisar alterá-lo.',
            highlight: ['let', 'const'],
            codeLanguage: 'JavaScript',
            code: JS2_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript has different ways to declare variables. let lets you assign a new value later, while const must keep the same reference after it is created.',
            endParagraph: "Prefer const when the value doesn't need to be reassigned, and use let when you need to change it.",
            highlight: ['let', 'const'],
            codeLanguage: 'JavaScript',
            code: JS2_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Tipos de dados', en: 'Data types' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um programa trabalha com diferentes tipos de valores. JavaScript possui tipos como string, number, boolean, null e undefined.',
            endParagraph: 'O tipo de um valor indica que tipo de informação ele representa. Conhecer esses tipos é essencial para trabalhar com dados.',
            highlight: ['string', 'number', 'boolean'],
            codeLanguage: 'JavaScript',
            code: JS3_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'A program works with different types of values. JavaScript has types like string, number, boolean, null and undefined.',
            endParagraph: "A value's type indicates what kind of information it represents. Knowing these types is essential for working with data.",
            highlight: ['string', 'number', 'boolean'],
            codeLanguage: 'JavaScript',
            code: JS3_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Strings representam textos, numbers representam valores numéricos e booleans representam apenas dois estados: true ou false.',
            secondParagraph: 'Também existem null, usado para representar uma ausência intencional de valor, e undefined, normalmente associado a um valor que ainda não foi definido.',
            endParagraph: 'Identificar o tipo de dado correto ajuda o programa a trabalhar com cada informação da maneira esperada.',
            highlight: ['string', 'number', 'boolean'],
            codeLanguage: 'JavaScript',
            code: JS3_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'Strings represent text, numbers represent numeric values and booleans represent just two states: true or false.',
            secondParagraph: "There's also null, used to represent an intentional absence of value, and undefined, usually associated with a value that hasn't been defined yet.",
            endParagraph: 'Identifying the correct data type helps the program work with each piece of information as expected.',
            highlight: ['string', 'number', 'boolean'],
            codeLanguage: 'JavaScript',
            code: JS3_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Operadores', en: 'Operators' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Operadores permitem realizar operações com valores. Os operadores +, -, * e / são utilizados para cálculos matemáticos.',
            endParagraph: 'Operadores permitem que o programa transforme e combine valores para produzir novos resultados.',
            highlight: ['operadores'],
            codeLanguage: 'JavaScript',
            code: JS4_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'Operators let you perform operations with values. The +, -, * and / operators are used for mathematical calculations.',
            endParagraph: 'Operators let the program transform and combine values to produce new results.',
            highlight: ['operators'],
            codeLanguage: 'JavaScript',
            code: JS4_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Operadores de comparação verificam uma relação entre valores e produzem um resultado booleano.',
            secondParagraph: '> significa "maior que", === verifica igualdade estrita e !== verifica diferença.',
            endParagraph: 'Como comparações produzem true ou false, elas são especialmente úteis para tomar decisões no programa.',
            highlight: ['booleano'],
            codeLanguage: 'JavaScript',
            code: JS4_T2,
            onlyCode: true
          },
          en: {
            firstParagraph: 'Comparison operators check a relationship between values and produce a boolean result.',
            secondParagraph: '> means "greater than", === checks strict equality and !== checks difference.',
            endParagraph: 'Since comparisons produce true or false, they are especially useful for making decisions in the program.',
            highlight: ['boolean'],
            codeLanguage: 'JavaScript',
            code: JS4_T2,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Condicionais', en: 'Conditionals' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um programa pode executar diferentes códigos dependendo de uma condição. O if permite executar um bloco quando uma condição é verdadeira.',
            endParagraph: 'A condição dentro do if é avaliada como verdadeira ou falsa. Isso permite que o programa escolha quando executar determinado código.',
            highlight: ['if'],
            codeLanguage: 'JavaScript',
            code: JS5_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'A program can run different code depending on a condition. if lets you run a block when a condition is true.',
            endParagraph: 'The condition inside an if is evaluated as true or false. This lets the program choose when to run certain code.',
            highlight: ['if'],
            codeLanguage: 'JavaScript',
            code: JS5_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O else permite definir o que deve acontecer quando a condição do if não for verdadeira.',
            endParagraph: 'Com if e else, o programa pode seguir caminhos diferentes de acordo com os dados que recebe.',
            highlight: ['if', 'else'],
            codeLanguage: 'JavaScript',
            code: JS5_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: "else lets you define what should happen when the if condition isn't true.",
            endParagraph: 'With if and else, the program can follow different paths depending on the data it receives.',
            highlight: ['if', 'else'],
            codeLanguage: 'JavaScript',
            code: JS5_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Repetição', en: 'Loops' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando precisamos executar uma ação várias vezes, podemos utilizar estruturas de repetição. O for é uma das formas mais comuns de fazer isso.',
            secondParagraph: 'Nesse exemplo, o código dentro do for é executado enquanto i for menor que 5.',
            endParagraph: 'Loops evitam que precisemos escrever a mesma instrução várias vezes manualmente.',
            highlight: ['for'],
            codeLanguage: 'JavaScript',
            code: JS6_T1,
            onlyCode: true
          },
          en: {
            firstParagraph: 'When we need to run an action several times, we can use loop structures. for is one of the most common ways to do this.',
            secondParagraph: 'In this example, the code inside for runs as long as i is less than 5.',
            endParagraph: 'Loops let you avoid writing the same instruction several times manually.',
            highlight: ['for'],
            codeLanguage: 'JavaScript',
            code: JS6_T1,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O while repete um bloco de código enquanto sua condição for verdadeira.',
            endParagraph: 'Escolher entre diferentes estruturas de repetição depende da situação. O importante é entender que elas permitem automatizar ações repetitivas.',
            highlight: ['while'],
            codeLanguage: 'JavaScript',
            code: JS6_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'while repeats a block of code for as long as its condition is true.',
            endParagraph: 'Choosing between different loop structures depends on the situation. What matters is understanding that they let you automate repetitive actions.',
            highlight: ['while'],
            codeLanguage: 'JavaScript',
            code: JS6_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Arrays', en: 'Arrays' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um array permite armazenar vários valores em uma única estrutura. Os elementos são organizados por posições chamadas índices.',
            endParagraph: 'Arrays são úteis quando precisamos trabalhar com uma coleção de valores relacionados.',
            highlight: ['array'],
            codeLanguage: 'JavaScript',
            code: JS7_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'An array lets you store several values in a single structure. The elements are organized by positions called indexes.',
            endParagraph: 'Arrays are useful when we need to work with a collection of related values.',
            highlight: ['array'],
            codeLanguage: 'JavaScript',
            code: JS7_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Os índices de um array começam em 0. Por isso, o primeiro elemento está na posição 0, o segundo na posição 1 e assim por diante.',
            endParagraph: 'Saber acessar os elementos de um array é fundamental para trabalhar com listas de dados.',
            highlight: ['array'],
            codeLanguage: 'JavaScript',
            code: JS7_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: "An array's indexes start at 0. That's why the first element is at position 0, the second at position 1, and so on.",
            endParagraph: "Knowing how to access an array's elements is essential for working with lists of data.",
            highlight: ['array'],
            codeLanguage: 'JavaScript',
            code: JS7_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Objetos', en: 'Objects' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um objeto permite agrupar informações relacionadas por meio de propriedades. Cada propriedade possui um nome e um valor.',
            secondParagraph: 'Nesse exemplo, nome e idade são propriedades do objeto pessoa.',
            endParagraph: 'Objetos são muito utilizados para representar entidades e agrupar informações que pertencem umas às outras.',
            highlight: ['objeto'],
            codeLanguage: 'JavaScript',
            code: JS8_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'An object lets you group related information through properties. Each property has a name and a value.',
            secondParagraph: 'In this example, name and age are properties of the person object.',
            endParagraph: 'Objects are widely used to represent entities and group information that belongs together.',
            highlight: ['object'],
            codeLanguage: 'JavaScript',
            code: JS8_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos acessar uma propriedade utilizando a notação de ponto.',
            endParagraph: 'A notação de ponto permite acessar diretamente uma propriedade pelo seu nome.',
            highlight: ['propriedade'],
            codeLanguage: 'JavaScript',
            code: JS8_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can access a property using dot notation.',
            endParagraph: 'Dot notation lets you access a property directly by its name.',
            highlight: ['property'],
            codeLanguage: 'JavaScript',
            code: JS8_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Funções', en: 'Functions' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma função é um bloco de código que pode ser executado quando necessário. Ela permite organizar e reutilizar comportamentos.',
            endParagraph: 'Primeiro definimos a função. Depois podemos chamá-la sempre que quisermos executar seu código.',
            highlight: ['função'],
            codeLanguage: 'JavaScript',
            code: JS9_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'A function is a block of code that can run whenever needed. It lets you organize and reuse behaviors.',
            endParagraph: 'First we define the function. Then we can call it whenever we want to run its code.',
            highlight: ['function'],
            codeLanguage: 'JavaScript',
            code: JS9_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma função pode receber informações por meio de parâmetros e devolver um resultado utilizando return.',
            secondParagraph: 'Nesse exemplo, a e b são parâmetros. A função retorna o resultado da soma.',
            endParagraph: 'Parâmetros tornam as funções mais flexíveis, enquanto return permite utilizar o resultado produzido por elas.',
            highlight: ['parâmetro', 'return'],
            codeLanguage: 'JavaScript',
            code: JS9_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'A function can receive information through parameters and give back a result using return.',
            secondParagraph: 'In this example, a and b are parameters. The function gives back the result of the sum.',
            endParagraph: 'Parameters make functions more flexible, while return lets you use the result they produce.',
            highlight: ['parameter', 'return'],
            codeLanguage: 'JavaScript',
            code: JS9_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: { pt: 'Arrow Functions e escopo básico', en: 'Arrow functions and basic scope' },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Arrow functions são uma sintaxe alternativa para criar funções em JavaScript. Elas são muito utilizadas no desenvolvimento moderno.',
            secondParagraph: 'Para funções simples, a sintaxe pode ser ainda mais curta.',
            endParagraph: 'Arrow functions não criam um novo tipo de função. Elas oferecem uma sintaxe diferente e muito comum em projetos JavaScript modernos.',
            highlight: ['arrow function'],
            codeLanguage: 'JavaScript',
            code: JS10_T1_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'Arrow functions are an alternative syntax for creating functions in JavaScript. They are widely used in modern development.',
            secondParagraph: 'For simple functions, the syntax can be even shorter.',
            endParagraph: 'Arrow functions do not create a new type of function. They offer a different syntax that is very common in modern JavaScript projects.',
            highlight: ['arrow function'],
            codeLanguage: 'JavaScript',
            code: JS10_T1_EN,
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Escopo define onde uma variável pode ser acessada. Variáveis declaradas dentro de um bloco com let ou const ficam disponíveis apenas naquele bloco.',
            endParagraph: 'Entender escopo ajuda a evitar conflitos entre variáveis e prepara o caminho para conceitos mais avançados da linguagem.',
            highlight: ['escopo'],
            codeLanguage: 'JavaScript',
            code: JS10_T2_PT,
            onlyCode: true
          },
          en: {
            firstParagraph: 'Scope defines where a variable can be accessed. Variables declared inside a block with let or const are only available within that block.',
            endParagraph: 'Understanding scope helps avoid conflicts between variables and prepares the way for more advanced concepts of the language.',
            highlight: ['scope'],
            codeLanguage: 'JavaScript',
            code: JS10_T2_EN,
            onlyCode: true
          }
        }
      }
    ]
  }
]

async function seedJsBasicLessons (localeIds: Map<LocaleCode, number>): Promise<void> {
  const jsArea = await prisma.areas.findFirst({ where: { name: 'JavaScript' }, orderBy: { id: 'asc' } })
  if (jsArea === null) {
    console.log('Área JavaScript não encontrada — pulando lições do módulo básico.')
    return
  }

  const firstModule = await prisma.modules.findFirst({
    where: { area_id: jsArea.id },
    orderBy: { index: 'asc' }
  })
  if (firstModule === null) {
    console.log('Primeiro módulo de JavaScript não encontrado — pulando lições do módulo básico.')
    return
  }

  const existingLessons = await prisma.lessons.count({ where: { module_id: firstModule.id } })
  if (existingLessons > 0) {
    console.log(`Lições do módulo básico de JavaScript já seedadas (${existingLessons} encontradas) — pulando.`)
    return
  }

  for (let lessonIndex = 0; lessonIndex < JS_BASIC_LESSONS.length; lessonIndex++) {
    const lessonSeed = JS_BASIC_LESSONS[lessonIndex]
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

  const activityCount = JS_BASIC_LESSONS.reduce((total, lesson) => total + lesson.activities.length, 0)
  console.log(`Seed de conteúdo concluído: ${JS_BASIC_LESSONS.length} lições, ${activityCount} atividades no primeiro módulo de JavaScript.`)
}

async function main (): Promise<void> {
  const localeIds = await seedLocales()
  await seedAreasAndModules(localeIds)
  await seedHtmlBasicLessons(localeIds)
  await seedCssBasicLessons(localeIds)
  await seedJsBasicLessons(localeIds)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
