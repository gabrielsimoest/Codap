import 'dotenv/config'
import { pathToFileURL } from 'node:url'
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

// Subtítulo descritivo de cada módulo (`module_translations.subtitle`), por
// área — diferente do `name` genérico acima ("Módulo N"), que é igual nas
// três áreas. Antes vivia hardcoded no app (`areaMetadata.ts` + i18n, por
// posição); ver api/CLAUDE.md, "Conteúdo pedagógico", sobre por que isso
// virou dado da API. `null` = módulo ainda sem conteúdo/nome definitivo (só
// os módulos 1-3 de HTML/CSS têm conteúdo por enquanto; o 4º módulo delas
// mantém o texto de "maestria" como placeholder, igual já era no app).
const MODULE_SUBTITLES: Record<string, Array<Record<LocaleCode, string>>> = {
  HTML: [
    { pt: 'Conceitos de HTML', en: 'Concepts of HTML' },
    { pt: 'HTML intermediário', en: 'Intermediate HTML' },
    { pt: 'HTML avançado', en: 'Advanced HTML' },
    { pt: 'Além do HTML', en: 'Beyond HTML' }
  ],
  CSS: [
    { pt: 'Conceitos de CSS', en: 'Concepts of CSS' },
    { pt: 'CSS intermediário', en: 'Intermediate CSS' },
    { pt: 'CSS avançado', en: 'Advanced CSS' },
    { pt: 'Além do CSS', en: 'Beyond CSS' }
  ],
  JavaScript: [
    { pt: 'Conceitos de JavaScript', en: 'Concepts of JavaScript' },
    { pt: 'JavaScript intermediário', en: 'Intermediate JavaScript' },
    { pt: 'JavaScript avançado', en: 'Advanced JavaScript' },
    { pt: 'Além do JavaScript', en: 'Beyond JavaScript' }
  ]
}

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

// Roda sempre (sem guard de contagem), diferente de `seedAreasAndModules`:
// como `subtitle` é uma coluna nova, um banco que já tinha `areas`/`modules`
// seedados antes dela existir nunca passaria pelo bloco de criação acima de
// novo, e o subtítulo ficaria `null` para sempre. `update` sobre uma linha
// que já existe (sempre existe, por causa de `seedAreasAndModules`) é
// idempotente — reescrever o mesmo valor de novo é inofensivo.
async function seedModuleSubtitles (localeIds: Map<LocaleCode, number>): Promise<void> {
  for (const areaName of AREA_NAMES) {
    const area = await prisma.areas.findFirst({ where: { name: areaName }, orderBy: { id: 'asc' } })
    if (area === null) continue

    const modules = await prisma.modules.findMany({ where: { area_id: area.id } })
    const subtitles = MODULE_SUBTITLES[areaName]

    for (const module of modules) {
      const subtitle = subtitles[module.index]
      if (subtitle === undefined) continue

      for (const { code } of LOCALES) {
        await prisma.module_translations.update({
          where: { module_id_locale_id: { module_id: module.id, locale_id: localeIds.get(code)! } },
          data: { subtitle: subtitle[code] }
        })
      }
    }
  }

  console.log('Subtítulos de módulo atualizados.')
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































// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).






export const HTML_BASIC_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'O que é HTML?',
      en: 'What is HTML?'
    },
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
            code: '<h1>Olá, mundo!</h1>\n<p>Minha primeira página web.</p>'
          },
          en: {
            firstParagraph: 'Hi, it\'s Cody! HTML is the language used to structure the content of a web page. It tells the browser what each part of the page represents, like headings, paragraphs, images and links.',
            secondParagraph: 'HTML stands for HyperText Markup Language. Despite the name, HTML is not a programming language: it is a markup language.',
            endParagraph: 'HTML defines the structure and meaning of the content. Appearance comes later, with CSS.',
            highlight: ['Cody', 'HTML', 'CSS', 'web'],
            codeLanguage: 'HTML',
            code: '<h1>Hello, world!</h1>\n<p>My first web page.</p>'
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
            code: '<p>Este é um parágrafo.</p>'
          },
          en: {
            firstParagraph: 'An HTML element is usually made of an opening tag, its content, and a closing tag.',
            secondParagraph: 'In the example below, <p> marks the start of a paragraph and </p> marks its end.',
            endParagraph: 'Tags tell the browser how to interpret each part of the content. By combining different elements, you can build an entire page.',
            highlight: ['HTML', 'p'],
            codeLanguage: 'HTML',
            code: '<p>This is a paragraph.</p>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Estrutura de um documento HTML',
      en: 'Structure of an HTML document'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma página HTML tem uma estrutura básica que organiza suas informações. O navegador usa essa estrutura para interpretar o documento corretamente.',
            endParagraph: 'Todo documento HTML começa com uma estrutura parecida com essa. Dentro dela, cada parte tem uma função específica.',
            highlight: ['HTML'],
            codeLanguage: 'HTML',
            code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Minha página</title>\n  </head>\n  <body>\n    <h1>Olá!</h1>\n  </body>\n</html>'
          },
          en: {
            firstParagraph: 'An HTML page has a basic structure that organizes its information. The browser uses this structure to interpret the document correctly.',
            endParagraph: 'Every HTML document starts with a structure like this one. Inside it, each part has a specific role.',
            highlight: ['HTML'],
            codeLanguage: 'HTML',
            code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My page</title>\n  </head>\n  <body>\n    <h1>Hello!</h1>\n  </body>\n</html>'
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
            code: '<head>\n  <title>Meu site</title>\n</head>\n\n<body>\n  <h1>Bem-vindo!</h1>\n  <p>Este conteúdo aparece na página.</p>\n</body>'
          },
          en: {
            firstParagraph: 'The <head> holds information about the page that isn\'t shown directly to visitors, like the title shown on the browser tab. The <body> holds everything that\'s displayed: text, images, buttons, and more.',
            endParagraph: 'Think of the <head> as data about the document, and the <body> as the page\'s content.',
            highlight: ['head', 'body'],
            codeLanguage: 'HTML',
            code: '<head>\n  <title>My site</title>\n</head>\n\n<body>\n  <h1>Welcome!</h1>\n  <p>This content appears on the page.</p>\n</body>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Elementos HTML podem ficar dentro de outros elementos. Chamamos isso de aninhamento.',
            secondParagraph: 'No exemplo, o <body> contém uma <div>, que por sua vez contém um título e um parágrafo. O elemento de fora é o pai; os de dentro são os filhos.',
            endParagraph: 'A indentação não muda o resultado no navegador, mas deixa o aninhamento visível para quem lê o código.',
            highlight: ['aninhamento', 'body', 'div'],
            codeLanguage: 'HTML',
            code: '<body>\n  <div>\n    <h1>Título da página</h1>\n    <p>Um parágrafo dentro da div.</p>\n  </div>\n</body>'
          },
          en: {
            firstParagraph: 'HTML elements can live inside other elements. This is called nesting.',
            secondParagraph: 'In the example, the <body> contains a <div>, which in turn contains a heading and a paragraph. The outer element is the parent; the inner ones are its children.',
            endParagraph: 'Indentation does not change the result in the browser, but it makes the nesting visible to anyone reading the code.',
            highlight: ['nesting', 'body', 'div'],
            codeLanguage: 'HTML',
            code: '<body>\n  <div>\n    <h1>Page title</h1>\n    <p>A paragraph inside the div.</p>\n  </div>\n</body>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Comentários',
      en: 'Comments'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Comentários são trechos que o navegador ignora. Eles servem para deixar anotações no código.',
            secondParagraph: 'Um comentário começa com <!-- e termina com -->. Tudo que estiver entre os dois não aparece na página.',
            endParagraph: 'Comentários ajudam a explicar decisões e a organizar o código para quem for lê-lo depois.',
            highlight: ['Comentários', 'comentário'],
            codeLanguage: 'HTML',
            code: '<!-- Cabeçalho do site -->\n<h1>Minha página</h1>\n\n<p>Este texto aparece na página.</p>'
          },
          en: {
            firstParagraph: 'Comments are snippets the browser ignores. They exist to leave notes in the code.',
            secondParagraph: 'A comment starts with <!-- and ends with -->. Anything between the two does not show up on the page.',
            endParagraph: 'Comments help explain decisions and organize the code for whoever reads it later.',
            highlight: ['Comments', 'comment'],
            codeLanguage: 'HTML',
            code: '<!-- Site header -->\n<h1>My page</h1>\n\n<p>This text shows up on the page.</p>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Comentários também servem para desativar temporariamente um trecho de código, sem precisar apagá-lo.',
            secondParagraph: 'Isso é útil para testar mudanças: basta comentar a parte que você quer esconder e depois tirá-la do comentário.',
            endParagraph: 'Lembre-se de que comentários ficam visíveis para quem abrir o código-fonte da página. Não use comentários para guardar informações sensíveis.',
            highlight: ['comentário', 'comentários', 'código-fonte'],
            codeLanguage: 'HTML',
            code: '<ul>\n  <li>Item ativo</li>\n  <!-- <li>Item desativado por enquanto</li> -->\n</ul>'
          },
          en: {
            firstParagraph: 'Comments are also used to temporarily disable a snippet of code without deleting it.',
            secondParagraph: 'This is handy when testing changes: comment out the part you want to hide, then take it back out of the comment.',
            endParagraph: 'Keep in mind that comments are visible to anyone who opens the page source. Do not use comments to store sensitive information.',
            highlight: ['comment', 'comments', 'page source'],
            codeLanguage: 'HTML',
            code: '<ul>\n  <li>Active item</li>\n  <!-- <li>Item disabled for now</li> -->\n</ul>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Texto e títulos',
      en: 'Text and headings'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'HTML tem seis níveis de título, de <h1> a <h6>. Eles representam diferentes níveis de importância dentro da estrutura do conteúdo.',
            endParagraph: 'Os títulos ajudam a organizar o conteúdo em uma hierarquia. Use o nível que representa a posição daquele conteúdo na página.',
            highlight: ['HTML', 'h1', 'h6'],
            codeLanguage: 'HTML',
            code: '<h1>Título principal</h1>\n<h2>Seção</h2>\n<h3>Subseção</h3>'
          },
          en: {
            firstParagraph: 'HTML has six heading levels, from <h1> to <h6>. They represent different levels of importance within the structure of the content.',
            endParagraph: 'Headings help organize content into a hierarchy. Use the level that matches that content\'s position on the page.',
            highlight: ['HTML', 'h1', 'h6'],
            codeLanguage: 'HTML',
            code: '<h1>Main heading</h1>\n<h2>Section</h2>\n<h3>Subsection</h3>'
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
            code: '<p>\n  Aprender <strong>HTML</strong> é importante\n  para criar páginas web.\n</p>\n\n<p>\n  Este texto tem <em>destaque</em>.\n</p>'
          },
          en: {
            firstParagraph: 'The <p> element represents a paragraph. To emphasize information, you can use elements like <strong> and <em>.',
            endParagraph: 'Choose text elements based on the meaning you want to convey, not just how they look.',
            highlight: ['p', 'strong'],
            codeLanguage: 'HTML',
            code: '<p>\n  Learning <strong>HTML</strong> is important\n  for building web pages.\n</p>\n\n<p>\n  This text has <em>emphasis</em>.\n</p>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Links',
      en: 'Links'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <a> cria links para outras páginas, arquivos ou endereços. O destino é definido pelo atributo href.',
            endParagraph: 'O texto dentro do <a> é o que a pessoa vê. O atributo href informa para onde o link leva.',
            highlight: ['href', 'link', 'links', '<a>'],
            codeLanguage: 'HTML',
            code: '<a href="https://example.com">\n  Visitar o site\n</a>'
          },
          en: {
            firstParagraph: 'The <a> element creates links to other pages, files, or addresses. The destination is set by the href attribute.',
            endParagraph: 'The text inside the <a> is what the reader sees. The href attribute tells the browser where the link goes.',
            highlight: ['href', 'link', 'links'],
            codeLanguage: 'HTML',
            code: '<a href="https://example.com">\n  Visit the site\n</a>'
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
            code: '<a href="sobre.html">\n  Sobre nós\n</a>'
          },
          en: {
            firstParagraph: 'Not every link points to another site. You can also point to files or pages that are part of your own project.',
            endParagraph: 'Relative links are useful for connecting different pages of the same site. The path is interpreted based on the location of the current file.',
            highlight: ['link', 'links'],
            codeLanguage: 'HTML',
            code: '<a href="about.html">\n  About us\n</a>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Imagens',
      en: 'Images'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <img> permite adicionar uma imagem à página. Diferente de muitos elementos HTML, ele não tem uma tag de fechamento.',
            endParagraph: 'O atributo src indica onde está a imagem. O navegador usa esse caminho para carregá-la.',
            highlight: ['img', 'src', 'HTML'],
            codeLanguage: 'HTML',
            code: '<img src="imagem.jpg" alt="Uma paisagem" />'
          },
          en: {
            firstParagraph: 'The <img> element lets you add an image to the page. Unlike many HTML elements, it doesn\'t have a closing tag.',
            endParagraph: 'The src attribute points to the image. The browser uses that path to load it.',
            highlight: ['img', 'src', 'HTML'],
            codeLanguage: 'HTML',
            code: '<img src="image.jpg" alt="A landscape" />'
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
            code: '<img src="gato.jpg" alt="Gato sentado em uma cadeira" />'
          },
          en: {
            firstParagraph: 'The alt attribute gives a text description of the image. It matters when the image fails to load, and also for assistive technologies.',
            endParagraph: 'Write an alt that describes the image\'s purpose or relevant content. Don\'t skip this attribute.',
            highlight: ['alt'],
            codeLanguage: 'HTML',
            code: '<img src="cat.jpg" alt="Cat sitting on a chair" />'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Listas',
      en: 'Lists'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Use <ul> quando a ordem dos itens não for importante. Cada item da lista é representado por <li>.',
            endParagraph: 'A estrutura é simples: <ul> representa a lista, e cada <li> representa um item.',
            highlight: ['ul', 'li'],
            codeLanguage: 'HTML',
            code: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>'
          },
          en: {
            firstParagraph: 'Use <ul> when the order of the items doesn\'t matter. Each list item is represented by <li>.',
            endParagraph: 'The structure is simple: <ul> represents the list, and each <li> represents one item.',
            highlight: ['ul', 'li'],
            codeLanguage: 'HTML',
            code: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>'
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
            code: '<ol>\n  <li>Abrir o navegador</li>\n  <li>Acessar o site</li>\n  <li>Fazer login</li>\n</ol>'
          },
          en: {
            firstParagraph: 'When the order of the items matters, you can use <ol>. Items are still represented by <li>.',
            endParagraph: 'The choice between <ul> and <ol> depends on the meaning of the list, not just how it looks.',
            highlight: ['ol', 'li', 'ul'],
            codeLanguage: 'HTML',
            code: '<ol>\n  <li>Open the browser</li>\n  <li>Go to the site</li>\n  <li>Log in</li>\n</ol>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Atributos',
      en: 'Attributes'
    },
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
            code: '<a href="https://example.com">\n  Acessar\n</a>'
          },
          en: {
            firstParagraph: 'Attributes provide extra information about an HTML element. They appear in the opening tag and usually have a name and a value.',
            secondParagraph: 'In the example below, href is an attribute. It tells the <a> element which address to open.',
            endParagraph: 'Tags define elements. Attributes add information or settings to those elements.',
            highlight: ['HTML', 'href'],
            codeLanguage: 'HTML',
            code: '<a href="https://example.com">\n  Access\n</a>'
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
            code: '<img src="gato.jpg" alt="Gato sentado" />\n\n<a href="sobre.html">\n  Sobre\n</a>'
          },
          en: {
            firstParagraph: 'Different elements have their own attributes, depending on what they need.',
            endParagraph: 'In <img>, src points to the image and alt provides a description. In <a>, href points to the link\'s destination.',
            highlight: ['img', 'src', 'alt', 'href'],
            codeLanguage: 'HTML',
            code: '<img src="cat.jpg" alt="Cat sitting" />\n\n<a href="about.html">\n  About\n</a>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Div e Span',
      en: 'Div and Span'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <div> é um contêiner genérico usado para agrupar outros elementos. Ele é útil para organizar partes da página.',
            endParagraph: 'O <div> não indica um significado específico para o conteúdo. Ele serve, principalmente, como um contêiner.',
            highlight: ['div'],
            codeLanguage: 'HTML',
            code: '<div>\n  <h2>Perfil</h2>\n  <p>Desenvolvedor web</p>\n</div>'
          },
          en: {
            firstParagraph: 'The <div> element is a generic container used to group other elements. It\'s useful for organizing parts of the page.',
            endParagraph: 'The <div> doesn\'t carry a specific meaning for the content. It mainly works as a container.',
            highlight: ['div'],
            codeLanguage: 'HTML',
            code: '<div>\n  <h2>Profile</h2>\n  <p>Web developer</p>\n</div>'
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
            code: '<p>\n  Meu nome é\n  <span>Gabriel</span>.\n</p>'
          },
          en: {
            firstParagraph: 'The <span> is also a generic container, but it\'s typically used for small pieces of content inside a line of text.',
            endParagraph: 'The key difference is in the use: <div> usually groups larger blocks, while <span> wraps small pieces of content.',
            highlight: ['div', 'span'],
            codeLanguage: 'HTML',
            code: '<p>\n  My name is\n  <span>Gabriel</span>.\n</p>'
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















// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).




















export const CSS_BASIC_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'O que é CSS?',
      en: 'What is CSS?'
    },
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
            code: '<p class="destaque">Olá, mundo!</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.destaque {\n  color: blue;\n}'
              }
            ]
          },
          en: {
            firstParagraph: 'CSS is the language used to define the appearance of a web page. With it, we can control colors, sizes, spacing, fonts and many other visual aspects.',
            secondParagraph: 'While HTML organizes the page\'s content, CSS defines how that content will be presented.',
            endParagraph: 'HTML provides the structure. CSS adds the visual presentation. The two work together to build a web page.',
            highlight: ['CSS', 'HTML'],
            codeLanguage: 'HTML',
            code: '<p class="highlight">Hello, world!</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.highlight {\n  color: blue;\n}'
              }
            ]
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
            code: '<h1>Meu site</h1>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: 'h1 {\n  color: blue;\n  font-size: 32px;\n}'
              }
            ]
          },
          en: {
            firstParagraph: 'To apply CSS, we need to select an HTML element and define which properties we want to change.',
            endParagraph: 'A CSS rule has a selector and a set of declarations. The selector indicates which element will be styled.',
            highlight: ['CSS', 'selector'],
            codeLanguage: 'HTML',
            code: '<h1>My website</h1>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: 'h1 {\n  color: blue;\n  font-size: 32px;\n}'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Como adicionar CSS',
      en: 'How to add CSS'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Existem três formas de adicionar CSS a uma página.',
            secondParagraph: 'No CSS inline, o estilo vai direto no atributo style do elemento. No CSS interno, ele fica dentro de uma tag style, no próprio documento HTML.',
            endParagraph: 'Essas duas formas funcionam, mas misturar muitos estilos ao HTML pode dificultar a manutenção da página.',
            highlight: ['CSS', 'inline', 'interno'],
            codeLanguage: 'HTML',
            code: '<p style="color: blue;">\n  Texto com CSS inline.\n</p>\n\n<style>\n  p {\n    font-size: 20px;\n  }\n</style>'
          },
          en: {
            firstParagraph: 'There are three ways to add CSS to a page.',
            secondParagraph: 'With inline CSS, the style goes straight into the style attribute of the element. With internal CSS, it lives inside a style tag, in the HTML document itself.',
            endParagraph: 'Both of these work, but mixing too many styles into the HTML can make the page harder to maintain.',
            highlight: ['CSS', 'inline', 'internal'],
            codeLanguage: 'HTML',
            code: '<p style="color: blue;">\n  Text with inline CSS.\n</p>\n\n<style>\n  p {\n    font-size: 20px;\n  }\n</style>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A terceira forma é o CSS externo: os estilos ficam em um arquivo separado, ligado ao HTML por uma tag link.',
            secondParagraph: 'Em projetos reais essa é a forma mais comum, porque mantém estrutura e apresentação organizadas em arquivos diferentes.',
            endParagraph: 'Separar o CSS do HTML facilita a organização e permite reutilizar os mesmos estilos em várias páginas.',
            highlight: ['CSS', 'externo', 'link'],
            codeLanguage: 'HTML',
            code: '<link rel="stylesheet" href="style.css">\n\n<p>Texto do site</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: 'p {\n  color: blue;\n}'
              }
            ]
          },
          en: {
            firstParagraph: 'The third way is external CSS: the styles live in a separate file, linked to the HTML by a link tag.',
            secondParagraph: 'In real projects this is the most common form, because it keeps structure and presentation organized in different files.',
            endParagraph: 'Separating CSS from HTML makes organization easier and lets you reuse the same styles across several pages.',
            highlight: ['CSS', 'external', 'link'],
            codeLanguage: 'HTML',
            code: '<link rel="stylesheet" href="style.css">\n\n<p>Site text</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: 'p {\n  color: blue;\n}'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Seletores',
      en: 'Selectors'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um seletor informa ao CSS quais elementos devem receber uma regra. O seletor mais simples é o seletor por elemento.',
            endParagraph: 'Nesse exemplo, todos os elementos p recebem a cor definida pela regra.',
            highlight: ['CSS', 'seletor'],
            codeLanguage: 'CSS',
            code: 'p {\n  color: blue;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p>Primeiro parágrafo.</p>\n<p>Segundo parágrafo.</p>'
              }
            ]
          },
          en: {
            firstParagraph: 'A selector tells CSS which elements should receive a rule. The simplest selector is the element selector.',
            endParagraph: 'In this example, every p element receives the color defined by the rule.',
            highlight: ['CSS', 'selector'],
            codeLanguage: 'CSS',
            code: 'p {\n  color: blue;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p>First paragraph.</p>\n<p>Second paragraph.</p>'
              }
            ]
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
            code: '<p class="destaque">Primeiro texto</p>\n<p class="destaque">Segundo texto</p>\n\n<h1 id="titulo">Meu site</h1>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.destaque {\n  color: blue;\n}\n\n#titulo {\n  font-size: 32px;\n}'
              }
            ]
          },
          en: {
            firstParagraph: 'A class lets you apply the same style to several elements. An ID identifies one specific element on the page.',
            endParagraph: 'Use a class when a style can be reused. An ID represents a specific identification and should be used for that purpose.',
            highlight: ['class', 'ID'],
            codeLanguage: 'HTML',
            code: '<p class="highlight">First text</p>\n<p class="highlight">Second text</p>\n\n<h1 id="title">My website</h1>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.highlight {\n  color: blue;\n}\n\n#title {\n  font-size: 32px;\n}'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Cores e fundos',
      en: 'Colors and backgrounds'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade color define a cor do texto de um elemento.',
            endParagraph: 'CSS permite representar cores de diferentes formas. Neste momento, basta conhecer nomes de cores e valores hexadecimais.',
            highlight: ['color', 'CSS'],
            codeLanguage: 'CSS',
            code: 'h1 {\n  color: blue;\n}\n\np {\n  color: #333;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>Título</h1>\n<p>Texto do parágrafo.</p>'
              }
            ]
          },
          en: {
            firstParagraph: 'The color property defines the text color of an element.',
            endParagraph: 'CSS lets you represent colors in different ways. For now, it\'s enough to know color names and hexadecimal values.',
            highlight: ['color', 'CSS'],
            codeLanguage: 'CSS',
            code: 'h1 {\n  color: blue;\n}\n\np {\n  color: #333;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>Heading</h1>\n<p>Paragraph text.</p>'
              }
            ]
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
            code: '.card {\n  background-color: #f2f2f2;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <p>Meu conteúdo</p>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The background-color property defines the background color of an element.',
            endParagraph: 'We can combine color and background-color to control the contrast between content and background.',
            highlight: ['background-color'],
            codeLanguage: 'CSS',
            code: '.card {\n  background-color: #f2f2f2;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <p>My content</p>\n</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Texto e fontes',
      en: 'Text and fonts'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'As propriedades font-size e font-weight controlam, respectivamente, o tamanho e o peso da fonte.',
            endParagraph: 'Essas propriedades ajudam a criar uma hierarquia visual entre títulos, textos e outras informações.',
            highlight: ['font-size', 'font-weight'],
            codeLanguage: 'CSS',
            code: 'h1 {\n  font-size: 32px;\n  font-weight: 700;\n}\n\np {\n  font-size: 16px;\n  font-weight: 400;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>Título grande</h1>\n<p>Texto menor.</p>'
              }
            ]
          },
          en: {
            firstParagraph: 'The font-size and font-weight properties control, respectively, the size and weight of the font.',
            endParagraph: 'These properties help create a visual hierarchy between headings, text and other information.',
            highlight: ['font-size', 'font-weight'],
            codeLanguage: 'CSS',
            code: 'h1 {\n  font-size: 32px;\n  font-weight: 700;\n}\n\np {\n  font-size: 16px;\n  font-weight: 400;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>Big heading</h1>\n<p>Smaller text.</p>'
              }
            ]
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
            code: 'body {\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  text-align: center;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>Meu site</h1>'
              }
            ]
          },
          en: {
            firstParagraph: 'font-family defines the typeface used. text-align, in turn, controls the horizontal alignment of the text.',
            endParagraph: 'Choosing a suitable font and organizing alignment helps make content more readable.',
            highlight: ['font-family', 'text-align'],
            codeLanguage: 'CSS',
            code: 'body {\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  text-align: center;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>My website</h1>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade text-decoration controla linhas aplicadas ao texto, como o sublinhado e o riscado.',
            secondParagraph: 'Os valores mais comuns são underline, line-through e none.',
            endParagraph: 'O valor none é bastante usado em links, que já vêm sublinhados por padrão no navegador.',
            highlight: ['text-decoration', 'underline', 'line-through', 'none'],
            codeLanguage: 'CSS',
            code: '.destaque {\n  text-decoration: underline;\n}\n\n.removido {\n  text-decoration: line-through;\n}\n\n.limpo {\n  text-decoration: none;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p class="destaque">Texto sublinhado</p>\n<p class="removido">Texto riscado</p>\n<a class="limpo" href="#">Link sem sublinhado</a>'
              }
            ]
          },
          en: {
            firstParagraph: 'The text-decoration property controls lines applied to text, such as underline and strikethrough.',
            secondParagraph: 'The most common values are underline, line-through and none.',
            endParagraph: 'The value none is widely used on links, which come underlined by default in the browser.',
            highlight: ['text-decoration', 'underline', 'line-through', 'none'],
            codeLanguage: 'CSS',
            code: '.destaque {\n  text-decoration: underline;\n}\n\n.removido {\n  text-decoration: line-through;\n}\n\n.limpo {\n  text-decoration: none;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p class="destaque">Underlined text</p>\n<p class="removido">Struck-through text</p>\n<a class="limpo" href="#">Link with no underline</a>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Box Model',
      en: 'Box Model'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'No CSS, os elementos são tratados como caixas. Cada caixa possui conteúdo, espaçamento interno, borda e espaço externo.',
            endParagraph: 'Entender o Box Model é essencial para controlar o tamanho e o espaçamento dos elementos de uma página.',
            highlight: ['Box Model', 'CSS'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 200px;\n  padding: 20px;\n  border: 2px solid black;\n  margin: 10px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Conteúdo</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'In CSS, elements are treated as boxes. Each box has content, inner spacing, a border and outer spacing.',
            endParagraph: 'Understanding the Box Model is essential for controlling the size and spacing of a page\'s elements.',
            highlight: ['Box Model', 'CSS'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 200px;\n  padding: 20px;\n  border: 2px solid black;\n  margin: 10px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Content</div>'
              }
            ]
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
            code: '.card {\n  padding: 20px;\n  border: 2px solid black;\n  margin: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Conteúdo</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'padding creates space between the content and the border. margin creates space around the box. border defines the element\'s border.',
            endParagraph: 'A simple way to remember it: padding stays inside the border; margin stays outside it.',
            highlight: ['padding', 'margin', 'border'],
            codeLanguage: 'CSS',
            code: '.card {\n  padding: 20px;\n  border: 2px solid black;\n  margin: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Content</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'box-sizing',
      en: 'box-sizing'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Por padrão, width define apenas a largura do conteúdo. O padding e a borda são somados por fora dela.',
            secondParagraph: 'No exemplo, a caixa tem width de 200px, mas ocupa 250px na tela: 200 de conteúdo, mais 20 de padding de cada lado, mais 5 de borda de cada lado.',
            endParagraph: 'Esse comportamento padrão se chama content-box, e é a causa mais comum de layouts que estouram o espaço previsto.',
            highlight: ['width', 'padding', 'content-box'],
            codeLanguage: 'CSS',
            code: '.caixa {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid #333;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="caixa">Conteúdo</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'By default, width sets only the width of the content. Padding and border are added on top of it.',
            secondParagraph: 'In the example, the box has a width of 200px but takes up 250px on screen: 200 of content, plus 20 of padding on each side, plus 5 of border on each side.',
            endParagraph: 'This default behaviour is called content-box, and it is the most common cause of layouts that overflow their expected space.',
            highlight: ['width', 'padding', 'content-box'],
            codeLanguage: 'CSS',
            code: '.caixa {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid #333;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="caixa">Content</div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade box-sizing muda essa conta. Com o valor border-box, o width passa a incluir o padding e a borda.',
            secondParagraph: 'No exemplo, a caixa ocupa exatamente 200px na tela, e o conteúdo se ajusta ao espaço que sobra.',
            endParagraph: 'border-box costuma ser aplicado a todos os elementos da página, porque torna os tamanhos muito mais previsíveis.',
            highlight: ['box-sizing', 'border-box', 'width'],
            codeLanguage: 'CSS',
            code: '* {\n  box-sizing: border-box;\n}\n\n.caixa {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid #333;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="caixa">Conteúdo</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The box-sizing property changes that math. With the value border-box, width starts including padding and border.',
            secondParagraph: 'In the example, the box takes up exactly 200px on screen, and the content adjusts to the space left over.',
            endParagraph: 'border-box is usually applied to every element on the page, because it makes sizes far more predictable.',
            highlight: ['box-sizing', 'border-box', 'width'],
            codeLanguage: 'CSS',
            code: '* {\n  box-sizing: border-box;\n}\n\n.caixa {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid #333;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="caixa">Content</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Largura e altura',
      en: 'Width and height'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'As propriedades width e height definem a largura e a altura de um elemento.',
            endParagraph: 'As dimensões podem ser definidas utilizando diferentes unidades. Neste exemplo, usamos pixels.',
            highlight: ['width', 'height'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 300px;\n  height: 150px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Caixa</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The width and height properties define an element\'s width and height.',
            endParagraph: 'Dimensions can be defined using different units. In this example, we used pixels.',
            highlight: ['width', 'height'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 300px;\n  height: 150px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Box</div>'
              }
            ]
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
            code: '.container {\n  width: 80%;\n}\n\n.card {\n  width: 300px;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'CSS has different units for defining sizes. px represents a measurement in pixels, while % uses a proportion relative to the reference element.',
            secondParagraph: 'There are also units like em, rem, vh and vw. We\'ll explore them as we go further into CSS.',
            endParagraph: 'Choosing the right unit helps create interfaces that adapt better to different screen sizes.',
            highlight: ['px', 'CSS'],
            codeLanguage: 'CSS',
            code: '.container {\n  width: 80%;\n}\n\n.card {\n  width: 300px;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Unidades de medida',
      en: 'Measurement units'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Além de px e de porcentagem, o CSS tem unidades que se apoiam no tamanho da fonte.',
            secondParagraph: 'A unidade rem toma como referência a fonte raiz da página, definida no elemento html. Já a unidade em toma como referência a fonte do próprio elemento.',
            endParagraph: 'Como rem parte sempre da mesma referência, ela é mais previsível quando há elementos aninhados.',
            highlight: ['px', 'rem'],
            codeLanguage: 'CSS',
            code: 'html {\n  font-size: 16px;\n}\n\n.titulo {\n  font-size: 2rem;\n}\n\n.aviso {\n  padding: 1em;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1 class="titulo">Título</h1>\n<p class="aviso">Um aviso com espaçamento interno.</p>'
              }
            ]
          },
          en: {
            firstParagraph: 'Besides px and percentages, CSS has units based on font size.',
            secondParagraph: 'The rem unit uses the page root font as its reference, set on the html element. The em unit uses the font of the element itself.',
            endParagraph: 'Because rem always starts from the same reference, it is more predictable when elements are nested.',
            highlight: ['px', 'rem'],
            codeLanguage: 'CSS',
            code: 'html {\n  font-size: 16px;\n}\n\n.titulo {\n  font-size: 2rem;\n}\n\n.aviso {\n  padding: 1em;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1 class="titulo">Title</h1>\n<p class="aviso">A notice with inner spacing.</p>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'As unidades vh e vw são relativas ao tamanho da janela do navegador.',
            secondParagraph: 'Uma unidade vh equivale a 1% da altura da janela, e uma unidade vw equivale a 1% da largura. Assim, uma altura de 100vh ocupa exatamente a altura visível da tela.',
            endParagraph: 'Essas unidades são úteis para seções que precisam preencher a tela inteira, seja qual for o tamanho do dispositivo.',
            highlight: ['vh', 'vw'],
            codeLanguage: 'CSS',
            code: '.banner {\n  width: 100vw;\n  height: 100vh;\n  background-color: #cfe8ff;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="banner">Ocupa a tela toda</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The vh and vw units are relative to the size of the browser window.',
            secondParagraph: 'One vh unit equals 1% of the window height, and one vw unit equals 1% of its width. So a height of 100vh takes up exactly the visible height of the screen.',
            endParagraph: 'These units are useful for sections that need to fill the whole screen, whatever the device size.',
            highlight: ['vh', 'vw'],
            codeLanguage: 'CSS',
            code: '.banner {\n  width: 100vw;\n  height: 100vh;\n  background-color: #cfe8ff;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="banner">Fills the whole screen</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Display',
      en: 'Display'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade display define como um elemento participa do fluxo da página. Os valores block e inline são dois comportamentos fundamentais.',
            endParagraph: 'Elementos block normalmente ocupam toda a largura disponível e começam em uma nova linha. Elementos inline permanecem na mesma linha quando existe espaço.',
            highlight: ['display', 'block', 'inline'],
            codeLanguage: 'CSS',
            code: 'div {\n  display: block;\n}\n\nspan {\n  display: inline;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div>Div 1</div>\n<div>Div 2</div>\n<span>Span 1</span>\n<span>Span 2</span>'
              }
            ]
          },
          en: {
            firstParagraph: 'The display property defines how an element takes part in the page\'s flow. The values block and inline are two fundamental behaviors.',
            endParagraph: 'Block elements usually take up the full available width and start on a new line. Inline elements stay on the same line when there\'s space.',
            highlight: ['display', 'block', 'inline'],
            codeLanguage: 'CSS',
            code: 'div {\n  display: block;\n}\n\nspan {\n  display: inline;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div>Div 1</div>\n<div>Div 2</div>\n<span>Span 1</span>\n<span>Span 2</span>'
              }
            ]
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
            code: '.button {\n  display: inline-block;\n}\n\n.hidden {\n  display: none;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="button">Botão</div>\n<div class="hidden">Escondido</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'inline-block combines characteristics of inline and block elements. none, in turn, removes the element from the page rendering.',
            endParagraph: 'display controls how the element takes part in the layout. In the intermediate module, we\'ll see more powerful layout resources.',
            highlight: ['inline-block', 'display'],
            codeLanguage: 'CSS',
            code: '.button {\n  display: inline-block;\n}\n\n.hidden {\n  display: none;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="button">Button</div>\n<div class="hidden">Hidden</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Organizando estilos',
      en: 'Organizing styles'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma regra CSS pode combinar várias propriedades para criar um estilo completo.',
            endParagraph: 'CSS fica mais poderoso quando combinamos pequenas regras para construir componentes visuais completos.',
            highlight: ['CSS'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 300px;\n  padding: 20px;\n  background-color: #f2f2f2;\n  border: 1px solid #ccc;\n}\n\n.card h2 {\n  color: #222;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <h2>Meu cartão</h2>\n  <p>Um conteúdo simples.</p>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'A CSS rule can combine several properties to create a complete style.',
            endParagraph: 'CSS becomes more powerful when we combine small rules to build complete visual components.',
            highlight: ['CSS'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 300px;\n  padding: 20px;\n  background-color: #f2f2f2;\n  border: 1px solid #ccc;\n}\n\n.card h2 {\n  color: #222;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <h2>My card</h2>\n  <p>Some simple content.</p>\n</div>'
              }
            ]
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
            code: '.card {\n  width: 300px;\n  padding: 20px;\n  margin: 16px;\n  color: #222;\n  background-color: #f2f2f2;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'In this module, you learned the fundamentals needed to start styling HTML pages with CSS.',
            secondParagraph: 'You learned how to write CSS rules, use selectors, work with colors and text, control dimensions, understand the Box Model and change the basic behavior of elements.',
            endParagraph: 'Now you can turn a simple HTML structure into an interface with an organized appearance. In the next level, the focus will be building layouts with Flexbox, Grid and other positioning resources.',
            highlight: ['CSS', 'Box Model'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 300px;\n  padding: 20px;\n  margin: 16px;\n  color: #222;\n  background-color: #f2f2f2;\n}',
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










// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).






export const JS_BASIC_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'Conhecendo o JavaScript',
      en: 'Getting to know JavaScript'
    },
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
            code: 'const nome = "Mundo";\n\nconsole.log("Olá, " + nome + "!");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript is a programming language used to create behaviors and interactions in applications. In web development, it can make a page respond to user actions and process information.',
            secondParagraph: 'HTML defines the structure, CSS defines the appearance and JavaScript lets you add behavior.',
            endParagraph: 'JavaScript lets a program receive information, make decisions, repeat actions and transform data. In this module, we\'ll start with the fundamentals of the language.',
            highlight: ['JavaScript', 'HTML', 'CSS'],
            codeLanguage: 'JavaScript',
            code: 'const name = "World";\n\nconsole.log("Hello, " + name + "!");',
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
            code: 'console.log("Olá, mundo!");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript can run in the browser. The code below uses console.log() to show information in the console.',
            endParagraph: 'console.log() is a very useful tool for viewing values during development. Now let\'s start working with data.',
            highlight: ['JavaScript', 'console.log'],
            codeLanguage: 'JavaScript',
            code: 'console.log("Hello, world!");',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Variáveis',
      en: 'Variables'
    },
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
            code: 'let idade = 20;\n\nconsole.log(idade);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A variable lets you store a value to use later in the program.',
            secondParagraph: 'Here, age is the variable\'s name and 20 is the stored value.',
            endParagraph: 'Variables let you give names to the data your program needs to use.',
            highlight: ['variable'],
            codeLanguage: 'JavaScript',
            code: 'let age = 20;\n\nconsole.log(age);',
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
            code: 'let idade = 20;\nidade = 21;\n\nconst nome = "Ana";',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript has different ways to declare variables. let lets you assign a new value later, while const must keep the same reference after it is created.',
            endParagraph: 'Prefer const when the value doesn\'t need to be reassigned, and use let when you need to change it.',
            highlight: ['let', 'const'],
            codeLanguage: 'JavaScript',
            code: 'let age = 20;\nage = 21;\n\nconst name = "Ana";',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tipos de dados',
      en: 'Data types'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um programa trabalha com diferentes tipos de valores. JavaScript possui tipos como string, number, boolean, null e undefined.',
            endParagraph: 'O tipo de um valor indica que tipo de informação ele representa. Conhecer esses tipos é essencial para trabalhar com dados.',
            highlight: ['string', 'number', 'boolean'],
            codeLanguage: 'JavaScript',
            code: 'const nome = "Ana";\nconst idade = 20;\nconst estudante = true;\n\nconsole.log(nome);\nconsole.log(idade);\nconsole.log(estudante);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A program works with different types of values. JavaScript has types like string, number, boolean, null and undefined.',
            endParagraph: 'A value\'s type indicates what kind of information it represents. Knowing these types is essential for working with data.',
            highlight: ['string', 'number', 'boolean'],
            codeLanguage: 'JavaScript',
            code: 'const name = "Ana";\nconst age = 20;\nconst student = true;\n\nconsole.log(name);\nconsole.log(age);\nconsole.log(student);',
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
            highlight: ['strings', 'numbers', 'booleans'],
            codeLanguage: 'JavaScript',
            code: 'const nome = "Gabriel";\nconst idade = 21;\nconst aprovado = true;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Strings represent text, numbers represent numeric values and booleans represent just two states: true or false.',
            secondParagraph: 'There\'s also null, used to represent an intentional absence of value, and undefined, usually associated with a value that hasn\'t been defined yet.',
            endParagraph: 'Identifying the correct data type helps the program work with each piece of information as expected.',
            highlight: ['strings', 'numbers', 'booleans'],
            codeLanguage: 'JavaScript',
            code: 'const name = "Gabriel";\nconst age = 21;\nconst approved = true;',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Operadores',
      en: 'Operators'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Operadores permitem realizar operações com valores. Os operadores +, -, * e / são utilizados para cálculos matemáticos.',
            endParagraph: 'Operadores permitem que o programa transforme e combine valores para produzir novos resultados.',
            highlight: ['operadores'],
            codeLanguage: 'JavaScript',
            code: 'const soma = 10 + 5;\nconst subtracao = 10 - 5;\nconst multiplicacao = 10 * 5;\nconst divisao = 10 / 5;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Operators let you perform operations with values. The +, -, * and / operators are used for mathematical calculations.',
            endParagraph: 'Operators let the program transform and combine values to produce new results.',
            highlight: ['operators'],
            codeLanguage: 'JavaScript',
            code: 'const sum = 10 + 5;\nconst subtraction = 10 - 5;\nconst multiplication = 10 * 5;\nconst division = 10 / 5;',
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
            code: 'console.log(10 > 5);\nconsole.log(10 === 10);\nconsole.log(10 !== 5);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Comparison operators check a relationship between values and produce a boolean result.',
            secondParagraph: '> means "greater than", === checks strict equality and !== checks difference.',
            endParagraph: 'Since comparisons produce true or false, they are especially useful for making decisions in the program.',
            highlight: ['boolean'],
            codeLanguage: 'JavaScript',
            code: 'console.log(10 > 5);\nconsole.log(10 === 10);\nconsole.log(10 !== 5);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Condicionais',
      en: 'Conditionals'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um programa pode executar diferentes códigos dependendo de uma condição. O if permite executar um bloco quando uma condição é verdadeira.',
            endParagraph: 'A condição dentro do if é avaliada como verdadeira ou falsa. Isso permite que o programa escolha quando executar determinado código.',
            highlight: ['if'],
            codeLanguage: 'JavaScript',
            code: 'const idade = 20;\n\nif (idade >= 18) {\n  console.log("Maior de idade");\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A program can run different code depending on a condition. if lets you run a block when a condition is true.',
            endParagraph: 'The condition inside an if is evaluated as true or false. This lets the program choose when to run certain code.',
            highlight: ['if'],
            codeLanguage: 'JavaScript',
            code: 'const age = 20;\n\nif (age >= 18) {\n  console.log("Adult");\n}',
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
            code: 'const idade = 16;\n\nif (idade >= 18) {\n  console.log("Maior de idade");\n} else {\n  console.log("Menor de idade");\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'else lets you define what should happen when the if condition isn\'t true.',
            endParagraph: 'With if and else, the program can follow different paths depending on the data it receives.',
            highlight: ['if', 'else'],
            codeLanguage: 'JavaScript',
            code: 'const age = 16;\n\nif (age >= 18) {\n  console.log("Adult");\n} else {\n  console.log("Minor");\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'switch e operador ternário',
      en: 'switch and the ternary operator'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando precisamos comparar um mesmo valor com várias opções, o switch costuma ficar mais legível do que uma sequência de if e else.',
            secondParagraph: 'Cada case testa um valor. O break encerra o bloco, e o default cobre os casos que não combinaram com nenhum case.',
            endParagraph: 'Sem o break, a execução continua nos casos seguintes, o que quase nunca é o resultado desejado.',
            highlight: ['switch', 'case', 'break', 'default'],
            codeLanguage: 'JavaScript',
            code: 'const dia = "sabado";\n\nswitch (dia) {\n  case "sabado":\n    console.log("Fim de semana");\n    break;\n  case "domingo":\n    console.log("Fim de semana");\n    break;\n  default:\n    console.log("Dia de semana");\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When we need to compare one value against several options, switch is usually more readable than a chain of if and else.',
            secondParagraph: 'Each case tests a value. break ends the block, and default covers the cases that did not match any case.',
            endParagraph: 'Without break, execution keeps going into the following cases, which is almost never the desired result.',
            highlight: ['switch', 'case', 'break', 'default'],
            codeLanguage: 'JavaScript',
            code: 'const day = "saturday";\n\nswitch (day) {\n  case "saturday":\n    console.log("Weekend");\n    break;\n  case "sunday":\n    console.log("Weekend");\n    break;\n  default:\n    console.log("Weekday");\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O operador ternário é uma forma curta de escrever uma condição que devolve um valor.',
            secondParagraph: 'A estrutura tem três partes: a condição, o valor usado quando ela é verdadeira e o valor usado quando é falsa.',
            endParagraph: 'Ele é útil para decisões simples. Para lógicas maiores, o if e o else continuam sendo mais legíveis.',
            highlight: ['ternário', 'if', 'else'],
            codeLanguage: 'JavaScript',
            code: 'const idade = 20;\n\nconst situacao = idade >= 18 ? "maior de idade" : "menor de idade";\n\nconsole.log(situacao);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The ternary operator is a short way to write a condition that returns a value.',
            secondParagraph: 'It has three parts: the condition, the value used when it is true, and the value used when it is false.',
            endParagraph: 'It is useful for simple decisions. For larger logic, if and else are still more readable.',
            highlight: ['ternary', 'if', 'else'],
            codeLanguage: 'JavaScript',
            code: 'const age = 20;\n\nconst status = age >= 18 ? "adult" : "minor";\n\nconsole.log(status);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Repetição',
      en: 'Loops'
    },
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
            code: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When we need to run an action several times, we can use loop structures. for is one of the most common ways to do this.',
            secondParagraph: 'In this example, the code inside for runs as long as i is less than 5.',
            endParagraph: 'Loops let you avoid writing the same instruction several times manually.',
            highlight: ['for'],
            codeLanguage: 'JavaScript',
            code: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
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
            code: 'let contador = 0;\n\nwhile (contador < 3) {\n  console.log(contador);\n  contador++;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'while repeats a block of code for as long as its condition is true.',
            endParagraph: 'Choosing between different loop structures depends on the situation. What matters is understanding that they let you automate repetitive actions.',
            highlight: ['while'],
            codeLanguage: 'JavaScript',
            code: 'let counter = 0;\n\nwhile (counter < 3) {\n  console.log(counter);\n  counter++;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O laço do while é parecido com o while, mas testa a condição depois de executar o bloco.',
            secondParagraph: 'Isso garante que o bloco rode pelo menos uma vez, mesmo que a condição já comece falsa.',
            endParagraph: 'Use o do while quando a primeira execução precisa acontecer de qualquer forma, como ao pedir um dado à pessoa usuária.',
            highlight: ['do while'],
            codeLanguage: 'JavaScript',
            code: 'let contador = 5;\n\ndo {\n  console.log("Executou ao menos uma vez");\n  contador++;\n} while (contador < 3);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The do while loop is similar to while, but it tests the condition after running the block.',
            secondParagraph: 'That guarantees the block runs at least once, even if the condition starts out false.',
            endParagraph: 'Use do while when the first run has to happen no matter what, such as when asking the user for input.',
            highlight: ['do while'],
            codeLanguage: 'JavaScript',
            code: 'let counter = 5;\n\ndo {\n  console.log("Ran at least once");\n  counter++;\n} while (counter < 3);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Arrays',
      en: 'Arrays'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um array permite armazenar vários valores em uma única estrutura. Os elementos são organizados por posições chamadas índices.',
            endParagraph: 'Arrays são úteis quando precisamos trabalhar com uma coleção de valores relacionados.',
            highlight: ['array'],
            codeLanguage: 'JavaScript',
            code: 'const frutas = [\n  "maçã",\n  "banana",\n  "laranja"\n];',
            onlyCode: true
          },
          en: {
            firstParagraph: 'An array lets you store several values in a single structure. The elements are organized by positions called indexes.',
            endParagraph: 'Arrays are useful when we need to work with a collection of related values.',
            highlight: ['array'],
            codeLanguage: 'JavaScript',
            code: 'const fruits = [\n  "apple",\n  "banana",\n  "orange"\n];',
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
            code: 'const frutas = [\n  "maçã",\n  "banana",\n  "laranja"\n];\n\nconsole.log(frutas[0]);\nconsole.log(frutas[1]);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'An array\'s indexes start at 0. That\'s why the first element is at position 0, the second at position 1, and so on.',
            endParagraph: 'Knowing how to access an array\'s elements is essential for working with lists of data.',
            highlight: ['array'],
            codeLanguage: 'JavaScript',
            code: 'const fruits = [\n  "apple",\n  "banana",\n  "orange"\n];\n\nconsole.log(fruits[0]);\nconsole.log(fruits[1]);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Objetos',
      en: 'Objects'
    },
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
            code: 'const pessoa = {\n  nome: "Ana",\n  idade: 20\n};',
            onlyCode: true
          },
          en: {
            firstParagraph: 'An object lets you group related information through properties. Each property has a name and a value.',
            secondParagraph: 'In this example, name and age are properties of the person object.',
            endParagraph: 'Objects are widely used to represent entities and group information that belongs together.',
            highlight: ['object'],
            codeLanguage: 'JavaScript',
            code: 'const person = {\n  name: "Ana",\n  age: 20\n};',
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
            code: 'const pessoa = {\n  nome: "Ana",\n  idade: 20\n};\n\nconsole.log(pessoa.nome);\nconsole.log(pessoa.idade);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can access a property using dot notation.',
            endParagraph: 'Dot notation lets you access a property directly by its name.',
            highlight: ['property'],
            codeLanguage: 'JavaScript',
            code: 'const person = {\n  name: "Ana",\n  age: 20\n};\n\nconsole.log(person.name);\nconsole.log(person.age);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Funções',
      en: 'Functions'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma função é um bloco de código que pode ser executado quando necessário. Ela permite organizar e reutilizar comportamentos.',
            endParagraph: 'Primeiro definimos a função. Depois podemos chamá-la sempre que quisermos executar seu código.',
            highlight: ['função'],
            codeLanguage: 'JavaScript',
            code: 'function saudacao() {\n  console.log("Olá!");\n}\n\nsaudacao();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A function is a block of code that can run whenever needed. It lets you organize and reuse behaviors.',
            endParagraph: 'First we define the function. Then we can call it whenever we want to run its code.',
            highlight: ['function'],
            codeLanguage: 'JavaScript',
            code: 'function greeting() {\n  console.log("Hello!");\n}\n\ngreeting();',
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
            highlight: ['parâmetros', 'return'],
            codeLanguage: 'JavaScript',
            code: 'function somar(a, b) {\n  return a + b;\n}\n\nconst resultado = somar(5, 3);\n\nconsole.log(resultado);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A function can receive information through parameters and give back a result using return.',
            secondParagraph: 'In this example, a and b are parameters. The function gives back the result of the sum.',
            endParagraph: 'Parameters make functions more flexible, while return lets you use the result they produce.',
            highlight: ['parameters', 'return'],
            codeLanguage: 'JavaScript',
            code: 'function add(a, b) {\n  return a + b;\n}\n\nconst result = add(5, 3);\n\nconsole.log(result);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Arrow Functions e escopo básico',
      en: 'Arrow functions and basic scope'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Arrow functions são uma sintaxe alternativa para criar funções em JavaScript. Elas são muito utilizadas no desenvolvimento moderno.',
            secondParagraph: 'Para funções simples, a sintaxe pode ser ainda mais curta.',
            endParagraph: 'Arrow functions não criam um novo tipo de função. Elas oferecem uma sintaxe diferente e muito comum em projetos JavaScript modernos.',
            highlight: ['arrow functions'],
            codeLanguage: 'JavaScript',
            code: 'const somar = (a, b) => {\n  return a + b;\n};\n\nconsole.log(somar(2, 3));\n\nconst dobrar = numero => numero * 2;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Arrow functions are an alternative syntax for creating functions in JavaScript. They are widely used in modern development.',
            secondParagraph: 'For simple functions, the syntax can be even shorter.',
            endParagraph: 'Arrow functions do not create a new type of function. They offer a different syntax that is very common in modern JavaScript projects.',
            highlight: ['arrow functions'],
            codeLanguage: 'JavaScript',
            code: 'const add = (a, b) => {\n  return a + b;\n};\n\nconsole.log(add(2, 3));\n\nconst double = number => number * 2;',
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
            code: 'if (true) {\n  const mensagem = "Olá";\n  console.log(mensagem);\n}\n\n// mensagem não está disponível aqui',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Scope defines where a variable can be accessed. Variables declared inside a block with let or const are only available within that block.',
            endParagraph: 'Understanding scope helps avoid conflicts between variables and prepares the way for more advanced concepts of the language.',
            highlight: ['scope'],
            codeLanguage: 'JavaScript',
            code: 'if (true) {\n  const message = "Hello";\n  console.log(message);\n}\n\n// message is not available here',
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

// ============================================================
// Conteúdo curricular do segundo módulo ("Intermediário") de cada área.
// Parte do princípio de que o aluno já concluiu o módulo básico da mesma
// área, então nada aqui repete fundamentos já ensinados lá. Só `theory` por
// enquanto, pelo mesmo motivo dos módulos básicos: a parte prática (`option`
// e os tipos novos do roadmap) entra depois, complementando estas lições.
//
// Duas limitações do componente existente moldaram a apresentação (a
// arquitetura foi preservada, o conteúdo é que se adaptou a ela):
//   - `TheoryActivityContent` não tem campo de título — os títulos de tela da
//     proposta pedagógica viram a ideia central do `firstParagraph`, não um
//     campo novo.
//   - `CodeSection` monta a aba "Web" com HTML + CSS apenas (`buildPreviewHtml`
//     ignora JavaScript de propósito). Por isso toda atividade de JavaScript é
//     `onlyCode: true`, mesmo onde a proposta pedia WebView — ver Fase 3 do
//     roadmap em docs/roadmap-atividades-praticas.md.
// ============================================================

// --- HTML Intermediário: trechos de código ---















// Só tipos de input, sem texto visível — igual nos dois idiomas.

















// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).








export const HTML_INTERMEDIATE_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'Estrutura da página',
      en: 'Page structure'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma página pode ser dividida em regiões com diferentes responsabilidades. <header> representa uma introdução ou cabeçalho e <nav> representa uma área de navegação.',
            endParagraph: 'Usar elementos específicos torna a estrutura mais clara do que agrupar tudo em <div>.',
            highlight: ['header', 'nav', 'div'],
            codeLanguage: 'HTML',
            code: '<header>\n  <h1>Meu site</h1>\n\n  <nav>\n    <a href="/">Início</a>\n    <a href="/sobre">Sobre</a>\n  </nav>\n</header>'
          },
          en: {
            firstParagraph: 'A page can be split into regions with different responsibilities. <header> represents an introduction or heading area, and <nav> represents a navigation area.',
            endParagraph: 'Using specific elements makes the structure clearer than wrapping everything in <div>.',
            highlight: ['header', 'nav', 'div'],
            codeLanguage: 'HTML',
            code: '<header>\n  <h1>My site</h1>\n\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</header>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<main> representa o conteúdo principal da página. <section> agrupa uma seção temática e <footer> representa informações de rodapé.',
            endParagraph: 'Uma boa estrutura semântica cria uma hierarquia que pode ser compreendida tanto por pessoas quanto por tecnologias.',
            highlight: ['main', 'section', 'footer', 'semântica'],
            codeLanguage: 'HTML',
            code: '<main>\n  <section>\n    <h2>Produtos</h2>\n    <p>Confira nossos produtos.</p>\n  </section>\n</main>\n\n<footer>\n  <p>Todos os direitos reservados.</p>\n</footer>'
          },
          en: {
            firstParagraph: '<main> represents the primary content of the page. <section> groups a thematic part of it and <footer> represents information shown at the bottom.',
            endParagraph: 'A good semantic structure creates a hierarchy that both people and technologies can understand.',
            highlight: ['main', 'section', 'footer', 'semantic'],
            codeLanguage: 'HTML',
            code: '<main>\n  <section>\n    <h2>Products</h2>\n    <p>Check out our products.</p>\n  </section>\n</main>\n\n<footer>\n  <p>All rights reserved.</p>\n</footer>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Por que HTML semântico?',
      en: 'Why semantic HTML?'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'HTML semântico significa utilizar elementos que descrevem o significado do conteúdo. Em vez de usar qualquer elemento como contêiner, escolhemos aquele que representa melhor sua função.',
            secondParagraph: 'Uma estrutura semântica ajuda navegadores, mecanismos de busca, tecnologias assistivas e outros desenvolvedores a compreenderem a página.',
            endParagraph: 'O código funciona, mas não comunica claramente a estrutura da página. Elementos semânticos resolvem esse problema.',
            highlight: ['HTML', 'semântico', 'semântica', 'semânticos'],
            codeLanguage: 'HTML',
            code: '<div>\n  <div>Meu site</div>\n  <div>Conteúdo principal</div>\n</div>'
          },
          en: {
            firstParagraph: 'Semantic HTML means using elements that describe the meaning of the content. Instead of using any element as a container, we choose the one that best represents its role.',
            secondParagraph: 'A semantic structure helps browsers, search engines, assistive technologies and other developers understand the page.',
            endParagraph: 'The code works, but it does not clearly communicate the structure of the page. Semantic elements solve that problem.',
            highlight: ['HTML', 'semantic'],
            codeLanguage: 'HTML',
            code: '<div>\n  <div>My site</div>\n  <div>Main content</div>\n</div>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Elementos como <header>, <nav>, <main>, <section>, <article>, <aside> e <footer> representam partes diferentes de uma página.',
            endParagraph: 'A semântica não serve apenas para organizar visualmente. Ela comunica a estrutura e o significado do conteúdo.',
            highlight: ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'semântica'],
            codeLanguage: 'HTML',
            code: '<header>Meu site</header>\n\n<nav>Menu</nav>\n\n<main>\n  <section>\n    <h1>Notícias</h1>\n  </section>\n</main>\n\n<footer>Contato</footer>'
          },
          en: {
            firstParagraph: 'Elements like <header>, <nav>, <main>, <section>, <article>, <aside> and <footer> represent different parts of a page.',
            endParagraph: 'Semantics is not only about visual organization. It communicates the structure and the meaning of the content.',
            highlight: ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'semantics'],
            codeLanguage: 'HTML',
            code: '<header>My site</header>\n\n<nav>Menu</nav>\n\n<main>\n  <section>\n    <h1>News</h1>\n  </section>\n</main>\n\n<footer>Contact</footer>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Article e aside',
      en: 'Article and aside'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <article> representa um conteúdo que pode fazer sentido de forma independente, como uma notícia, postagem ou comentário.',
            endParagraph: 'Uma boa pergunta para identificar um <article> é: esse conteúdo poderia ser distribuído ou reutilizado como uma unidade independente?',
            highlight: ['article'],
            codeLanguage: 'HTML',
            code: '<article>\n  <h2>Nova versão disponível</h2>\n  <p>\n    Uma nova versão do aplicativo foi lançada.\n  </p>\n</article>'
          },
          en: {
            firstParagraph: 'The <article> element represents content that can make sense on its own, like a news item, a post or a comment.',
            endParagraph: 'A good question to identify an <article> is: could this content be distributed or reused as an independent unit?',
            highlight: ['article'],
            codeLanguage: 'HTML',
            code: '<article>\n  <h2>New version available</h2>\n  <p>\n    A new version of the app has been released.\n  </p>\n</article>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O <aside> representa conteúdo relacionado ao conteúdo principal, mas que não faz parte diretamente dele.',
            endParagraph: '<article> representa conteúdo independente; <aside> representa conteúdo complementar.',
            highlight: ['aside', 'article'],
            codeLanguage: 'HTML',
            code: '<main>\n  <article>\n    <h1>Aprendendo HTML</h1>\n    <p>Conteúdo principal.</p>\n  </article>\n\n  <aside>\n    <h2>Leia também</h2>\n    <p>Outros conteúdos relacionados.</p>\n  </aside>\n</main>'
          },
          en: {
            firstParagraph: 'The <aside> element represents content related to the primary content, but not directly part of it.',
            endParagraph: '<article> represents independent content; <aside> represents complementary content.',
            highlight: ['aside', 'article'],
            codeLanguage: 'HTML',
            code: '<main>\n  <article>\n    <h1>Learning HTML</h1>\n    <p>Main content.</p>\n  </article>\n\n  <aside>\n    <h2>Read also</h2>\n    <p>Other related content.</p>\n  </aside>\n</main>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Formulários',
      en: 'Forms'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Formulários permitem coletar informações fornecidas pelo usuário. O elemento <form> representa o formulário e pode conter diferentes campos de entrada.',
            endParagraph: 'Um formulário deve deixar claro o que cada campo representa e qual ação o usuário pode realizar.',
            highlight: ['form', 'formulário', 'Formulários'],
            codeLanguage: 'HTML',
            code: '<form>\n  <label for="nome">Nome</label>\n\n  <input\n    id="nome"\n    name="nome"\n    type="text"\n  >\n\n  <button type="submit">\n    Enviar\n  </button>\n</form>'
          },
          en: {
            firstParagraph: 'Forms let you collect information provided by the user. The <form> element represents the form and can hold different input fields.',
            endParagraph: 'A form should make clear what each field represents and which action the user can take.',
            highlight: ['form', 'Forms', 'input'],
            codeLanguage: 'HTML',
            code: '<form>\n  <label for="name">Name</label>\n\n  <input\n    id="name"\n    name="name"\n    type="text"\n  >\n\n  <button type="submit">\n    Submit\n  </button>\n</form>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <input> possui diferentes tipos para representar diferentes informações.',
            endParagraph: 'Escolher o tipo adequado ajuda o navegador a interpretar corretamente a informação e pode melhorar a experiência do usuário.',
            highlight: ['input'],
            codeLanguage: 'HTML',
            code: '<input type="text">\n<input type="email">\n<input type="number">\n<input type="date">\n<input type="checkbox">'
          },
          en: {
            firstParagraph: 'The <input> element has different types to represent different kinds of information.',
            endParagraph: 'Choosing the right type helps the browser interpret the information correctly and can improve the user experience.',
            highlight: ['input'],
            codeLanguage: 'HTML',
            code: '<input type="text">\n<input type="email">\n<input type="number">\n<input type="date">\n<input type="checkbox">'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Formulários melhores',
      en: 'Better forms'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O <label> identifica um campo do formulário. O atributo for deve corresponder ao id do campo relacionado.',
            endParagraph: 'Relacionar corretamente o label ao campo melhora a usabilidade e a acessibilidade do formulário.',
            highlight: ['label', 'id'],
            codeLanguage: 'HTML',
            code: '<label for="email">\n  E-mail\n</label>\n\n<input\n  id="email"\n  name="email"\n  type="email"\n>'
          },
          en: {
            firstParagraph: 'The <label> element identifies a form field. Its for attribute must match the id of the related field.',
            endParagraph: 'Linking the label to the field correctly improves the usability and the accessibility of the form.',
            highlight: ['label', 'id'],
            codeLanguage: 'HTML',
            code: '<label for="email">\n  Email\n</label>\n\n<input\n  id="email"\n  name="email"\n  type="email"\n>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Alguns atributos permitem indicar regras básicas para os campos antes que o formulário seja enviado.',
            secondParagraph: 'required indica que o campo é obrigatório. minlength define um tamanho mínimo para o texto.',
            endParagraph: 'Esses recursos oferecem uma primeira camada de validação diretamente no HTML.',
            highlight: ['required', 'minlength', 'HTML'],
            codeLanguage: 'HTML',
            code: '<input\n  type="email"\n  name="email"\n  required\n>\n\n<input\n  type="text"\n  name="nome"\n  minlength="3"\n>'
          },
          en: {
            firstParagraph: 'Some attributes let you define basic rules for the fields before the form is submitted.',
            secondParagraph: 'required marks the field as mandatory. minlength sets a minimum length for the text.',
            endParagraph: 'These features provide a first layer of validation directly in HTML.',
            highlight: ['required', 'minlength', 'HTML'],
            codeLanguage: 'HTML',
            code: '<input\n  type="email"\n  name="email"\n  required\n>\n\n<input\n  type="text"\n  name="name"\n  minlength="3"\n>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Outros campos de formulário',
      en: 'Other form fields'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Nem todo campo de formulário é um input. Para textos longos, existe o textarea.',
            secondParagraph: 'Diferente do input, o textarea tem tag de abertura e de fechamento, e aceita várias linhas de texto.',
            endParagraph: 'O atributo rows define a altura inicial do campo, em número de linhas.',
            highlight: ['input', 'textarea', 'rows'],
            codeLanguage: 'HTML',
            code: '<label for="mensagem">Mensagem</label>\n<textarea id="mensagem" name="mensagem" rows="4"></textarea>'
          },
          en: {
            firstParagraph: 'Not every form field is an input. For long text, there is the textarea.',
            secondParagraph: 'Unlike input, textarea has an opening and a closing tag, and it accepts multiple lines of text.',
            endParagraph: 'The rows attribute sets the initial height of the field, in number of lines.',
            highlight: ['input', 'textarea', 'rows'],
            codeLanguage: 'HTML',
            code: '<label for="message">Message</label>\n<textarea id="message" name="message" rows="4"></textarea>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O select cria uma lista de opções, e cada alternativa é um option.',
            secondParagraph: 'O texto dentro de option é o que a pessoa vê na tela. O atributo value é o que o formulário envia.',
            endParagraph: 'Listas de opções reduzem erros de digitação, porque limitam a resposta a valores previstos.',
            highlight: ['select', 'option', 'value'],
            codeLanguage: 'HTML',
            code: '<label for="estado">Estado</label>\n<select id="estado" name="estado">\n  <option value="sp">São Paulo</option>\n  <option value="rj">Rio de Janeiro</option>\n</select>'
          },
          en: {
            firstParagraph: 'The select element creates a list of options, and each alternative is an option.',
            secondParagraph: 'The text inside option is what the person sees on screen. The value attribute is what the form sends.',
            endParagraph: 'Option lists reduce typing mistakes, because they limit the answer to expected values.',
            highlight: ['select', 'option', 'value'],
            codeLanguage: 'HTML',
            code: '<label for="state">State</label>\n<select id="state" name="state">\n  <option value="ny">New York</option>\n  <option value="ca">California</option>\n</select>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tabelas',
      en: 'Tables'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tabelas são utilizadas para representar dados organizados em linhas e colunas.',
            endParagraph: '<table> representa a tabela, <tr> uma linha, <th> uma célula de cabeçalho e <td> uma célula de dados.',
            highlight: ['table', 'tr', 'th', 'td'],
            codeLanguage: 'HTML',
            code: '<table>\n  <thead>\n    <tr>\n      <th>Produto</th>\n      <th>Preço</th>\n    </tr>\n  </thead>\n\n  <tbody>\n    <tr>\n      <td>Mouse</td>\n      <td>R$ 50</td>\n    </tr>\n  </tbody>\n</table>'
          },
          en: {
            firstParagraph: 'Tables are used to represent data organized into rows and columns.',
            endParagraph: '<table> represents the table, <tr> a row, <th> a header cell and <td> a data cell.',
            highlight: ['table', 'tr', 'th', 'td'],
            codeLanguage: 'HTML',
            code: '<table>\n  <thead>\n    <tr>\n      <th>Product</th>\n      <th>Price</th>\n    </tr>\n  </thead>\n\n  <tbody>\n    <tr>\n      <td>Mouse</td>\n      <td>$ 50</td>\n    </tr>\n  </tbody>\n</table>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tabelas podem ser divididas semanticamente em <thead>, <tbody> e <tfoot>.',
            endParagraph: 'Separar as partes da tabela melhora sua organização e deixa sua estrutura mais compreensível.',
            highlight: ['thead', 'tbody', 'tfoot'],
            codeLanguage: 'HTML',
            code: '<table>\n  <thead>\n    <tr>\n      <th>Produto</th>\n      <th>Preço</th>\n    </tr>\n  </thead>\n\n  <tbody>\n    <tr>\n      <td>Teclado</td>\n      <td>R$ 100</td>\n    </tr>\n  </tbody>\n\n  <tfoot>\n    <tr>\n      <td>Total</td>\n      <td>R$ 100</td>\n    </tr>\n  </tfoot>\n</table>'
          },
          en: {
            firstParagraph: 'Tables can be split semantically into <thead>, <tbody> and <tfoot>.',
            endParagraph: 'Splitting a table into parts improves its organization and makes its structure easier to understand.',
            highlight: ['thead', 'tbody', 'tfoot'],
            codeLanguage: 'HTML',
            code: '<table>\n  <thead>\n    <tr>\n      <th>Product</th>\n      <th>Price</th>\n    </tr>\n  </thead>\n\n  <tbody>\n    <tr>\n      <td>Keyboard</td>\n      <td>$ 100</td>\n    </tr>\n  </tbody>\n\n  <tfoot>\n    <tr>\n      <td>Total</td>\n      <td>$ 100</td>\n    </tr>\n  </tfoot>\n</table>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Às vezes uma célula precisa ocupar mais de uma coluna ou mais de uma linha.',
            secondParagraph: 'O atributo colspan estende a célula por várias colunas. O rowspan faz o mesmo na vertical, por várias linhas.',
            endParagraph: 'Esses atributos permitem montar cabeçalhos agrupados sem quebrar a estrutura de linhas e colunas da tabela.',
            highlight: ['colspan', 'rowspan'],
            codeLanguage: 'HTML',
            code: '<table>\n  <tr>\n    <th colspan="2">Contato</th>\n  </tr>\n  <tr>\n    <td>E-mail</td>\n    <td>ana@exemplo.com</td>\n  </tr>\n</table>'
          },
          en: {
            firstParagraph: 'Sometimes a cell needs to span more than one column or more than one row.',
            secondParagraph: 'The colspan attribute stretches the cell across several columns. rowspan does the same vertically, across several rows.',
            endParagraph: 'These attributes let you build grouped headers without breaking the table row and column structure.',
            highlight: ['colspan', 'rowspan'],
            codeLanguage: 'HTML',
            code: '<table>\n  <tr>\n    <th colspan="2">Contact</th>\n  </tr>\n  <tr>\n    <td>E-mail</td>\n    <td>ana@example.com</td>\n  </tr>\n</table>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Metadados',
      en: 'Metadata'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Metadados são informações sobre o documento que não aparecem diretamente como conteúdo da página.',
            endParagraph: 'O <head> concentra informações importantes para o navegador interpretar e apresentar corretamente o documento.',
            highlight: ['Metadados', 'head'],
            codeLanguage: 'HTML',
            code: '<head>\n  <meta charset="UTF-8">\n\n  <meta\n    name="viewport"\n    content="width=device-width, initial-scale=1"\n  >\n\n  <title>Meu site</title>\n</head>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Metadata is information about the document that does not appear directly as page content.',
            endParagraph: 'The <head> gathers information the browser needs to interpret and present the document correctly.',
            highlight: ['Metadata', 'head'],
            codeLanguage: 'HTML',
            code: '<head>\n  <meta charset="UTF-8">\n\n  <meta\n    name="viewport"\n    content="width=device-width, initial-scale=1"\n  >\n\n  <title>My site</title>\n</head>',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A meta tag description fornece uma descrição do conteúdo da página.',
            endParagraph: 'Metadados não são apenas detalhes técnicos. Eles ajudam diferentes ferramentas a compreenderem a página.',
            highlight: ['meta', 'description', 'Metadados'],
            codeLanguage: 'HTML',
            code: '<meta\n  name="description"\n  content="Aprenda desenvolvimento web."\n>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The description meta tag provides a description of the page content.',
            endParagraph: 'Metadata is not just a technical detail. It helps different tools understand the page.',
            highlight: ['meta', 'description', 'Metadata'],
            codeLanguage: 'HTML',
            code: '<meta\n  name="description"\n  content="Learn web development."\n>',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O favicon é o ícone que aparece na aba do navegador, ao lado do título da página.',
            secondParagraph: 'Ele é declarado no head por um link, e o atributo rel com o valor icon indica a função desse arquivo.',
            endParagraph: 'É um detalhe pequeno, mas é o que ajuda a reconhecer a página quando há muitas abas abertas.',
            highlight: ['favicon', 'head', 'link', 'rel'],
            codeLanguage: 'HTML',
            code: '<head>\n  <title>Meu site</title>\n  <link rel="icon" href="/favicon.png">\n</head>'
          },
          en: {
            firstParagraph: 'The favicon is the icon shown on the browser tab, next to the page title.',
            secondParagraph: 'It is declared in the head by a link, and the rel attribute with the value icon states what that file is for.',
            endParagraph: 'It is a small detail, but it is what helps people recognize the page when many tabs are open.',
            highlight: ['favicon', 'head', 'link', 'rel'],
            codeLanguage: 'HTML',
            code: '<head>\n  <title>My site</title>\n  <link rel="icon" href="/favicon.png">\n</head>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Acessibilidade',
      en: 'Accessibility'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Acessibilidade significa construir páginas que possam ser utilizadas por pessoas com diferentes necessidades e formas de interação.',
            secondParagraph: 'HTML semântico, textos alternativos e formulários corretamente identificados são exemplos de práticas que melhoram a acessibilidade.',
            endParagraph: 'Antes de procurar soluções complexas, utilize corretamente os recursos semânticos que o próprio HTML oferece.',
            highlight: ['Acessibilidade', 'acessibilidade', 'HTML', 'semântico', 'semânticos'],
            codeLanguage: 'HTML',
            code: '<main>\n  <h1>Perfil</h1>\n\n  <img\n    src="perfil.jpg"\n    alt="Foto de perfil"\n  >\n\n  <button type="button">\n    Seguir\n  </button>\n</main>'
          },
          en: {
            firstParagraph: 'Accessibility means building pages that can be used by people with different needs and ways of interacting.',
            secondParagraph: 'Semantic HTML, alternative text and properly labeled form fields are examples of practices that improve accessibility.',
            endParagraph: 'Before looking for complex solutions, use the semantic resources HTML already offers.',
            highlight: ['Accessibility', 'accessibility', 'HTML', 'semantic'],
            codeLanguage: 'HTML',
            code: '<main>\n  <h1>Profile</h1>\n\n  <img\n    src="profile.jpg"\n    alt="Profile photo"\n  >\n\n  <button type="button">\n    Follow\n  </button>\n</main>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Os títulos devem representar a hierarquia do conteúdo. Um <h2> representa uma seção dentro de um contexto, enquanto <h3> representa uma subseção.',
            endParagraph: 'A hierarquia de títulos ajuda usuários e tecnologias assistivas a entenderem a organização do conteúdo.',
            highlight: ['h2', 'h3', 'hierarquia'],
            codeLanguage: 'HTML',
            code: '<h1>Curso de HTML</h1>\n\n<h2>Fundamentos</h2>\n<h3>Elementos</h3>\n\n<h2>Formulários</h2>\n<h3>Inputs</h3>'
          },
          en: {
            firstParagraph: 'Headings should represent the hierarchy of the content. An <h2> represents a section inside a context, while <h3> represents a subsection.',
            endParagraph: 'A heading hierarchy helps users and assistive technologies understand how the content is organized.',
            highlight: ['h2', 'h3', 'hierarchy'],
            codeLanguage: 'HTML',
            code: '<h1>HTML course</h1>\n\n<h2>Fundamentals</h2>\n<h3>Elements</h3>\n\n<h2>Forms</h2>\n<h3>Inputs</h3>'
          }
        }
      }
    ]
  }
]

// --- CSS Intermediário: trechos de código ---
// Onde a aba "Web" agrega (Flexbox, Grid, posicionamento, pseudo-elementos),
// o HTML mínimo que a demonstração precisa vai em `additionalCode` — mesmo
// padrão já usado no módulo básico de CSS. As telas conceituais (escolher
// entre Flexbox e Grid, reutilização de variáveis, fechamento do módulo) e as
// que dependem de interação indisponível no toque (`:hover`) ficam
// `onlyCode: true`.



































// A proposta fecha o módulo sem trecho de código, mas `TheoryActivityContent`
// exige `code` — mesma situação da última tela do módulo básico de CSS, que já
// resolve isso com um trecho curto de consolidação e `onlyCode: true`.


// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).
























export const CSS_INTERMEDIATE_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'Flexbox',
      en: 'Flexbox'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Flexbox é um modelo de layout criado para organizar elementos em uma dimensão. Ele facilita o alinhamento e a distribuição dos itens dentro de um contêiner.',
            endParagraph: 'Ao utilizar display: flex, o elemento se torna um flex container e seus filhos passam a ser flex items.',
            highlight: ['Flexbox', 'flex', 'display', 'container'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="container">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'Flexbox is a layout model created to organize elements along one dimension. It makes it easier to align and distribute items inside a container.',
            endParagraph: 'When you use display: flex, the element becomes a flex container and its children become flex items.',
            highlight: ['Flexbox', 'flex', 'display', 'container'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="container">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n</div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'flex-direction define a direção dos itens. justify-content e align-items controlam o alinhamento em diferentes eixos.',
            endParagraph: 'Essas propriedades formam a base do Flexbox e permitem criar muitos layouts sem depender de posicionamento manual.',
            highlight: ['flex-direction', 'justify-content', 'align-items', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'flex-direction defines the direction of the items. justify-content and align-items control alignment along different axes.',
            endParagraph: 'These properties are the base of Flexbox and let you build many layouts without manual positioning.',
            highlight: ['flex-direction', 'justify-content', 'align-items', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Flexbox na prática',
      en: 'Flexbox in practice'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade gap define o espaço entre os itens de um flex container.',
            endParagraph: 'gap é uma forma simples de controlar o espaço entre itens sem precisar adicionar margens individualmente.',
            highlight: ['gap', 'flex'],
            codeLanguage: 'CSS',
            code: '.menu {\n  display: flex;\n  gap: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="menu">\n  <div>Início</div>\n  <div>Sobre</div>\n  <div>Contato</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The gap property defines the space between the items of a flex container.',
            endParagraph: 'gap is a simple way to control the space between items without adding individual margins.',
            highlight: ['gap', 'flex'],
            codeLanguage: 'CSS',
            code: '.menu {\n  display: flex;\n  gap: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="menu">\n  <div>Home</div>\n  <div>About</div>\n  <div>Contact</div>\n</div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Por padrão, os itens podem permanecer na mesma linha. flex-wrap permite que eles ocupem novas linhas quando necessário.',
            endParagraph: 'Combinar flex-wrap com gap é útil para criar grupos de elementos que precisam se adaptar ao espaço disponível.',
            highlight: ['flex-wrap', 'gap'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'By default, the items can stay on the same line. flex-wrap lets them move to new lines when needed.',
            endParagraph: 'Combining flex-wrap with gap is useful for groups of elements that need to adapt to the available space.',
            highlight: ['flex-wrap', 'gap'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Distribuindo espaço no Flexbox',
      en: 'Distributing space in Flexbox'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Dentro de um contêiner flex, os itens podem crescer ou encolher para acompanhar o espaço disponível.',
            secondParagraph: 'A propriedade flex-grow define quanto um item cresce em relação aos outros. A flex-shrink define o quanto ele pode encolher, e a flex-basis define o tamanho inicial antes da distribuição.',
            endParagraph: 'No exemplo, o item em destaque cresce o dobro dos demais, porque tem flex-grow maior.',
            highlight: ['flex-grow', 'flex-shrink', 'flex-basis'],
            codeLanguage: 'CSS',
            code: '.lista {\n  display: flex;\n  gap: 8px;\n}\n\n.item {\n  flex-grow: 1;\n  flex-basis: 80px;\n  background-color: #cfe8ff;\n  padding: 12px;\n}\n\n.item.destaque {\n  flex-grow: 2;\n  background-color: #ffd9a0;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="lista">\n  <div class="item">Um</div>\n  <div class="item destaque">Dois</div>\n  <div class="item">Três</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'Inside a flex container, items can grow or shrink to follow the available space.',
            secondParagraph: 'The flex-grow property sets how much an item grows compared to the others. flex-shrink sets how much it can shrink, and flex-basis sets the starting size before distribution.',
            endParagraph: 'In the example, the highlighted item grows twice as much as the others, because it has a larger flex-grow.',
            highlight: ['flex-grow', 'flex-shrink', 'flex-basis'],
            codeLanguage: 'CSS',
            code: '.lista {\n  display: flex;\n  gap: 8px;\n}\n\n.item {\n  flex-grow: 1;\n  flex-basis: 80px;\n  background-color: #cfe8ff;\n  padding: 12px;\n}\n\n.item.destaque {\n  flex-grow: 2;\n  background-color: #ffd9a0;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="lista">\n  <div class="item">One</div>\n  <div class="item destaque">Two</div>\n  <div class="item">Three</div>\n</div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade order muda a ordem visual dos itens, sem alterar o HTML.',
            secondParagraph: 'Por padrão, todos os itens têm order igual a zero. Um valor menor faz o item aparecer antes; um valor maior faz aparecer depois.',
            endParagraph: 'Use com cuidado: a ordem de leitura por tecnologias assistivas continua sendo a do HTML, e não a visual.',
            highlight: ['order', 'HTML'],
            codeLanguage: 'CSS',
            code: '.lista {\n  display: flex;\n  gap: 8px;\n}\n\n.lista div {\n  background-color: #cfe8ff;\n  padding: 12px;\n}\n\n.primeiro {\n  order: -1;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="lista">\n  <div>Um</div>\n  <div class="primeiro">Dois</div>\n  <div>Três</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The order property changes the visual position of the items, without changing the HTML.',
            secondParagraph: 'By default, every item has order equal to zero. A smaller value makes the item appear earlier; a larger value makes it appear later.',
            endParagraph: 'Use it carefully: assistive technology still follows the HTML sequence, not the visual one.',
            highlight: ['order', 'HTML'],
            codeLanguage: 'CSS',
            code: '.lista {\n  display: flex;\n  gap: 8px;\n}\n\n.lista div {\n  background-color: #cfe8ff;\n  padding: 12px;\n}\n\n.primeiro {\n  order: -1;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="lista">\n  <div>One</div>\n  <div class="primeiro">Two</div>\n  <div>Three</div>\n</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'CSS Grid',
      en: 'CSS Grid'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'CSS Grid é um modelo de layout que permite organizar elementos em linhas e colunas.',
            endParagraph: 'Enquanto Flexbox é especialmente útil para uma dimensão, Grid facilita a organização simultânea de linhas e colunas.',
            highlight: ['CSS', 'Grid', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="container">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n  <div>D</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'CSS Grid is a layout model that lets you organize elements into rows and columns.',
            endParagraph: 'While Flexbox is especially useful for one dimension, Grid makes it easier to organize rows and columns at the same time.',
            highlight: ['CSS', 'Grid', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="container">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n  <div>D</div>\n</div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A função repeat() permite repetir uma definição de coluna ou linha sem escrever a mesma regra várias vezes.',
            endParagraph: 'Grid permite criar estruturas organizadas com poucas regras, tornando-se uma ferramenta importante para layouts modernos.',
            highlight: ['repeat', 'Grid'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="container">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n  <div>D</div>\n  <div>E</div>\n  <div>F</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The repeat() function lets you repeat a column or row definition without writing the same rule several times.',
            endParagraph: 'Grid lets you build organized structures with few rules, which makes it an important tool for modern layouts.',
            highlight: ['repeat', 'Grid'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="container">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n  <div>D</div>\n  <div>E</div>\n  <div>F</div>\n</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Posicionando itens no Grid',
      en: 'Placing items in Grid'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Assim como grid-template-columns define as colunas, grid-template-rows define as linhas da grade.',
            secondParagraph: 'A função minmax define um tamanho mínimo e um máximo para a faixa. No exemplo, a primeira linha tem no mínimo 80px e cresce conforme o conteúdo.',
            endParagraph: 'Combinar minmax com a unidade fr permite criar grades que se adaptam sem quebrar.',
            highlight: ['grid-template-columns', 'grid-template-rows', 'minmax', 'fr'],
            codeLanguage: 'CSS',
            code: '.grade {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-template-rows: minmax(80px, auto) 1fr;\n  gap: 8px;\n}\n\n.grade div {\n  background-color: #cfe8ff;\n  padding: 12px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="grade">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n  <div>D</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'Just as grid-template-columns defines the columns, grid-template-rows defines the rows of the grid.',
            secondParagraph: 'The minmax function sets a minimum and a maximum size for the track. In the example, the first row is at least 80px and grows with the content.',
            endParagraph: 'Combining minmax with the fr unit lets you build grids that adapt without breaking.',
            highlight: ['grid-template-columns', 'grid-template-rows', 'minmax', 'fr'],
            codeLanguage: 'CSS',
            code: '.grade {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-template-rows: minmax(80px, auto) 1fr;\n  gap: 8px;\n}\n\n.grade div {\n  background-color: #cfe8ff;\n  padding: 12px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="grade">\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n  <div>D</div>\n</div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um item pode ocupar mais de uma faixa da grade com as propriedades grid-column e grid-row.',
            secondParagraph: 'O valor indica onde o item começa e onde termina. No exemplo, o cabeçalho vai da primeira até a terceira linha vertical, ou seja, ocupa as duas colunas.',
            endParagraph: 'Com essas duas propriedades é possível montar layouts em que alguns blocos são maiores que os outros.',
            highlight: ['grid-column', 'grid-row'],
            codeLanguage: 'CSS',
            code: '.grade {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n}\n\n.grade div {\n  background-color: #cfe8ff;\n  padding: 12px;\n}\n\n.cabecalho {\n  grid-column: 1 / 3;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="grade">\n  <div class="cabecalho">Cabeçalho</div>\n  <div>Coluna A</div>\n  <div>Coluna B</div>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'An item can span more than one track of the grid using the grid-column and grid-row properties.',
            secondParagraph: 'The value states where the item starts and where it ends. In the example, the header runs from the first to the third vertical line, so it covers both columns.',
            endParagraph: 'With these two properties you can build layouts where some blocks are larger than the others.',
            highlight: ['grid-column', 'grid-row'],
            codeLanguage: 'CSS',
            code: '.grade {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n}\n\n.grade div {\n  background-color: #cfe8ff;\n  padding: 12px;\n}\n\n.cabecalho {\n  grid-column: 1 / 3;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="grade">\n  <div class="cabecalho">Header</div>\n  <div>Column A</div>\n  <div>Column B</div>\n</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Posicionamento',
      en: 'Positioning'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade position altera a forma como um elemento é posicionado. relative cria um contexto de posicionamento, enquanto absolute permite posicionar um elemento em relação a esse contexto.',
            endParagraph: 'Um uso comum de absolute é posicionar pequenos elementos dentro de um contêiner relative.',
            highlight: ['position', 'relative', 'absolute'],
            codeLanguage: 'CSS',
            code: '.card {\n  position: relative;\n}\n\n.badge {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <p>Produto</p>\n  <span class="badge">Novo</span>\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'The position property changes how an element is placed. relative creates a positioning context, while absolute lets you place an element in relation to that context.',
            endParagraph: 'A common use of absolute is placing small elements inside a relative container.',
            highlight: ['position', 'relative', 'absolute'],
            codeLanguage: 'CSS',
            code: '.card {\n  position: relative;\n}\n\n.badge {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <p>Product</p>\n  <span class="badge">New</span>\n</div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'fixed posiciona um elemento em relação à janela de visualização. sticky combina características do posicionamento normal com um comportamento de fixação durante a rolagem.',
            endParagraph: 'Esses valores são úteis em elementos como cabeçalhos, barras de navegação e controles que precisam permanecer visíveis.',
            highlight: ['fixed', 'sticky'],
            codeLanguage: 'CSS',
            code: '.header {\n  position: sticky;\n  top: 0;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'fixed places an element in relation to the viewport. sticky combines normal positioning with a pinning behavior during scrolling.',
            endParagraph: 'These values are useful for headers, navigation bars and controls that need to stay visible.',
            highlight: ['fixed', 'sticky'],
            codeLanguage: 'CSS',
            code: '.header {\n  position: sticky;\n  top: 0;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Todo elemento começa com position no valor static, que é o comportamento normal do fluxo da página.',
            secondParagraph: 'Quando elementos posicionados se sobrepõem, a propriedade z-index define qual deles fica na frente. O valor maior aparece por cima.',
            endParagraph: 'z-index só tem efeito em elementos cujo position seja diferente de static.',
            highlight: ['position', 'static', 'z-index'],
            codeLanguage: 'CSS',
            code: '.caixa {\n  position: absolute;\n  width: 140px;\n  padding: 12px;\n}\n\n.atras {\n  z-index: 1;\n  background-color: #cfe8ff;\n}\n\n.frente {\n  z-index: 2;\n  top: 24px;\n  left: 24px;\n  background-color: #ffd9a0;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="caixa atras">Atrás</div>\n<div class="caixa frente">Na frente</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'Every element starts with position set to static, which is the normal behaviour of the page flow.',
            secondParagraph: 'When positioned elements overlap, the z-index property decides which one sits in front. The larger value goes on top.',
            endParagraph: 'z-index only has an effect on elements whose position is something other than static.',
            highlight: ['position', 'static', 'z-index'],
            codeLanguage: 'CSS',
            code: '.caixa {\n  position: absolute;\n  width: 140px;\n  padding: 12px;\n}\n\n.atras {\n  z-index: 1;\n  background-color: #cfe8ff;\n}\n\n.frente {\n  z-index: 2;\n  top: 24px;\n  left: 24px;\n  background-color: #ffd9a0;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="caixa atras">Behind</div>\n<div class="caixa frente">In front</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Pseudo-classes',
      en: 'Pseudo-classes'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Pseudo-classes permitem aplicar estilos de acordo com um estado ou condição do elemento.',
            endParagraph: ':hover representa o estado de passar o cursor sobre o elemento. :focus representa um elemento que recebeu foco.',
            highlight: ['Pseudo-classes', 'hover', 'focus'],
            codeLanguage: 'CSS',
            code: 'button:hover {\n  transform: scale(1.05);\n}\n\nbutton:focus {\n  outline: 2px solid black;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Pseudo-classes let you apply styles based on a state or condition of the element.',
            endParagraph: ':hover represents the state of moving the cursor over the element. :focus represents an element that received focus.',
            highlight: ['Pseudo-classes', 'hover', 'focus'],
            codeLanguage: 'CSS',
            code: 'button:hover {\n  transform: scale(1.05);\n}\n\nbutton:focus {\n  outline: 2px solid black;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Algumas pseudo-classes permitem selecionar elementos com base em sua posição ou relação com outros elementos.',
            secondParagraph: 'first-child seleciona o primeiro elemento de um grupo e last-child seleciona o último.',
            endParagraph: 'Pseudo-classes permitem criar regras mais específicas sem precisar adicionar uma classe para cada situação.',
            highlight: ['Pseudo-classes', 'pseudo-classes', 'first-child', 'last-child'],
            codeLanguage: 'CSS',
            code: 'li:first-child {\n  font-weight: bold;\n}\n\nli:last-child {\n  margin-bottom: 0;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<ul>\n  <li>Início</li>\n  <li>Sobre</li>\n  <li>Contato</li>\n</ul>'
              }
            ]
          },
          en: {
            firstParagraph: 'A few pseudo-classes let you select elements based on their position or their relation to other elements.',
            secondParagraph: 'first-child selects the first element of a group and last-child selects the last one.',
            endParagraph: 'Pseudo-classes let you write more specific rules without adding a class for every situation.',
            highlight: ['Pseudo-classes', 'pseudo-classes', 'first-child', 'last-child'],
            codeLanguage: 'CSS',
            code: 'li:first-child {\n  font-weight: bold;\n}\n\nli:last-child {\n  margin-bottom: 0;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<ul>\n  <li>Home</li>\n  <li>About</li>\n  <li>Contact</li>\n</ul>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A pseudo-classe active aplica um estilo enquanto o elemento está sendo clicado, e a disabled aplica um estilo em campos desativados.',
            secondParagraph: 'Já a nth-child seleciona elementos pela posição. No exemplo, o valor even seleciona os itens de posição par.',
            endParagraph: 'Essas pseudo-classes reagem ao estado e à posição dos elementos, sem precisar de classes extras no HTML.',
            highlight: ['active', 'disabled', 'nth-child', 'even'],
            codeLanguage: 'CSS',
            code: 'button:active {\n  background-color: #ffd9a0;\n}\n\ninput:disabled {\n  opacity: 0.5;\n}\n\nli:nth-child(even) {\n  background-color: #f2f2f2;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<button>Clique aqui</button>\n<input value="Campo desativado" disabled>\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n  <li>Item 4</li>\n</ul>'
              }
            ]
          },
          en: {
            firstParagraph: 'The active pseudo-class applies a style while the element is being clicked, and disabled applies a style to fields that are turned off.',
            secondParagraph: 'The nth-child pseudo-class selects elements by position. In the example, the value even selects the items in positions two, four, six, and so on.',
            endParagraph: 'These pseudo-classes react to the state and the position of elements, with no extra classes in the HTML.',
            highlight: ['active', 'disabled', 'nth-child', 'even'],
            codeLanguage: 'CSS',
            code: 'button:active {\n  background-color: #ffd9a0;\n}\n\ninput:disabled {\n  opacity: 0.5;\n}\n\nli:nth-child(even) {\n  background-color: #f2f2f2;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<button>Click here</button>\n<input value="Disabled field" disabled>\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n  <li>Item 4</li>\n</ul>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Pseudo-elementos',
      en: 'Pseudo-elements'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Pseudo-elementos permitem estilizar uma parte específica de um elemento ou criar conteúdo visual relacionado a ele.',
            endParagraph: '::before cria conteúdo antes do conteúdo do elemento e ::after cria conteúdo depois dele.',
            highlight: ['Pseudo-elementos', 'before', 'after'],
            codeLanguage: 'CSS',
            code: '.title::before {\n  content: "→ ";\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h2 class="title">Novidades</h2>'
              }
            ]
          },
          en: {
            firstParagraph: 'Pseudo-elements let you style a specific part of an element or create visual content related to it.',
            endParagraph: '::before creates content placed ahead of the element own content, and ::after creates content placed at the end of it.',
            highlight: ['Pseudo-elements', 'before', 'after'],
            codeLanguage: 'CSS',
            code: '.title::before {\n  content: "→ ";\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h2 class="title">News</h2>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Pseudo-elementos também podem ser utilizados para criar detalhes visuais sem adicionar elementos extras ao HTML.',
            endParagraph: 'Esse recurso é muito utilizado para criar detalhes decorativos e componentes visuais.',
            highlight: ['Pseudo-elementos', 'HTML'],
            codeLanguage: 'CSS',
            code: '.card::before {\n  content: "";\n  display: block;\n  height: 4px;\n  background: black;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Produto</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'Pseudo-elements can also be used to create visual details without adding extra elements to the HTML.',
            endParagraph: 'This resource is widely used to create decorative details and visual components.',
            highlight: ['Pseudo-elements', 'HTML'],
            codeLanguage: 'CSS',
            code: '.card::before {\n  content: "";\n  display: block;\n  height: 4px;\n  background: black;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Product</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Variáveis CSS',
      en: 'CSS variables'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Variáveis CSS, também chamadas de custom properties, permitem armazenar valores para reutilizá-los em diferentes regras.',
            endParagraph: 'Uma variável pode centralizar valores que aparecem em diferentes partes da interface.',
            highlight: ['CSS', 'Variáveis', 'variável', 'custom properties'],
            codeLanguage: 'CSS',
            code: ':root {\n  --cor-principal: #2563eb;\n}\n\nbutton {\n  background-color: var(--cor-principal);\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<button>Enviar</button>'
              }
            ]
          },
          en: {
            firstParagraph: 'CSS variables, also called custom properties, let you store values to reuse them in different rules.',
            endParagraph: 'A variable can centralize values that appear in different parts of the interface.',
            highlight: ['CSS', 'variables', 'variable', 'custom properties'],
            codeLanguage: 'CSS',
            code: ':root {\n  --main-color: #2563eb;\n}\n\nbutton {\n  background-color: var(--main-color);\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<button>Submit</button>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando várias regras utilizam a mesma variável, alterar seu valor pode atualizar todos esses pontos.',
            endParagraph: 'Variáveis tornam estilos mais consistentes e facilitam alterações futuras.',
            highlight: ['Variáveis', 'variável'],
            codeLanguage: 'CSS',
            code: ':root {\n  --espacamento: 16px;\n}\n\n.card {\n  padding: var(--espacamento);\n}\n\n.menu {\n  gap: var(--espacamento);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When several rules use the same variable, changing its value can update all of those places.',
            endParagraph: 'Variables make styles more consistent and make future changes easier.',
            highlight: ['Variables', 'variable'],
            codeLanguage: 'CSS',
            code: ':root {\n  --spacing: 16px;\n}\n\n.card {\n  padding: var(--spacing);\n}\n\n.menu {\n  gap: var(--spacing);\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Flexbox ou Grid?',
      en: 'Flexbox or Grid?'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Flexbox é especialmente adequado quando precisamos organizar elementos em uma única direção: uma linha ou uma coluna.',
            endParagraph: 'Menus, grupos de botões e alinhamentos em linha são exemplos comuns de situações em que Flexbox funciona muito bem.',
            highlight: ['Flexbox'],
            codeLanguage: 'CSS',
            code: '.menu {\n  display: flex;\n  justify-content: space-between;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Flexbox is especially suited for organizing elements in a single direction: a row or a column.',
            endParagraph: 'Menus, button groups and inline alignments are common examples where Flexbox works very well.',
            highlight: ['Flexbox'],
            codeLanguage: 'CSS',
            code: '.menu {\n  display: flex;\n  justify-content: space-between;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Grid é especialmente útil quando o layout precisa controlar linhas e colunas ao mesmo tempo.',
            endParagraph: 'Flexbox e Grid não competem entre si. Eles podem ser combinados para construir layouts mais completos.',
            highlight: ['Grid', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.products {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Grid is especially useful when the layout needs to control rows and columns at the same time.',
            endParagraph: 'Flexbox and Grid do not compete with each other. They can be combined to build more complete layouts.',
            highlight: ['Grid', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.products {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Construindo um layout',
      en: 'Building a layout'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Layouts reais normalmente combinam diferentes recursos do CSS. Um contêiner pode utilizar Grid enquanto um componente interno utiliza Flexbox.',
            endParagraph: 'Não existe uma única ferramenta para todos os layouts. A escolha depende da estrutura que queremos construir.',
            highlight: ['CSS', 'Grid', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.page {\n  display: grid;\n  grid-template-columns: 2fr 1fr;\n  gap: 20px;\n}\n\n.card {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Real layouts usually combine different CSS resources. A container can use Grid while an inner component uses Flexbox.',
            endParagraph: 'There is no single tool for every layout. The choice depends on the structure we want to build.',
            highlight: ['CSS', 'Grid', 'Flexbox'],
            codeLanguage: 'CSS',
            code: '.page {\n  display: grid;\n  grid-template-columns: 2fr 1fr;\n  gap: 20px;\n}\n\n.card {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Agora você já conhece ferramentas importantes para construir layouts modernos. O próximo nível será adaptar interfaces a diferentes telas e explorar recursos mais avançados do CSS.',
            endParagraph: 'Flexbox, Grid, posicionamento, pseudo-classes, pseudo-elementos e variáveis formam uma base sólida para interfaces mais completas.',
            highlight: ['CSS', 'Flexbox', 'Grid', 'pseudo-classes', 'pseudo-elementos', 'variáveis'],
            codeLanguage: 'CSS',
            code: ':root {\n  --espacamento: 20px;\n}\n\n.page {\n  display: grid;\n  gap: var(--espacamento);\n}\n\n.card {\n  position: relative;\n  display: flex;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'You now know important tools for building modern layouts. The next level will be adapting interfaces to different screens and exploring more advanced CSS resources.',
            endParagraph: 'Flexbox, Grid, positioning, pseudo-classes, pseudo-elements and variables form a solid base for more complete interfaces.',
            highlight: ['CSS', 'Flexbox', 'Grid', 'pseudo-classes', 'pseudo-elements', 'variables'],
            codeLanguage: 'CSS',
            code: ':root {\n  --spacing: 20px;\n}\n\n.page {\n  display: grid;\n  gap: var(--spacing);\n}\n\n.card {\n  position: relative;\n  display: flex;\n}',
            onlyCode: true
          }
        }
      }
    ]
  }
]

// --- JavaScript Intermediário: trechos de código ---
// Quase todas as telas são `onlyCode: true`. Quando este módulo foi escrito, a
// aba "Web" do `CodeSection` montava o preview só com HTML + CSS e ignorava
// JavaScript, então nenhuma tela podia demonstrar o próprio resultado. Isso
// mudou: `buildSandboxHtmlDocument` executa o bloco JavaScript de verdade
// (DOM e `console.log` refletidos na página).
//
// A primeira tela da lição "DOM" é a única que já foi revisada para usar isso
// — tem um bloco HTML de apoio e um JS que troca o texto do `<h1>`, então a
// aba "Web" mostra a manipulação acontecendo. As demais seguem `onlyCode:
// true` por decisão de conteúdo, não por limitação técnica: cada uma precisa
// ser revisada individualmente antes de ganhar a aba (uma tela cujo JS não
// produz efeito visível nem `console.log` renderizaria um preview vazio, o que
// ensina errado). Telas de `fetch`/`localStorage` são as que mais exigem
// cuidado — dependem de rede e de origem, não de marcação.














// Interativo: toque no botão cria e adiciona um novo <li> à lista, ao vivo.

// Interativo: toque no botão alterna a classe "ativo"/"active" do cartão.

// Interativo: toque no botão dispara o listener, que muda a mensagem na tela.






// Interativo: buscarUsuarios() simula um fetch (atraso + chance de falhar),
// para o exemplo rodar sem depender de rede dentro da WebView.

// Interativo: mesma simulação de buscarUsuarios(), agora sem chance de falha
// (esta lição ainda não chegou em try/catch) e consumida via await.


// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).
// Interativo: toque no botão executa saudar() de verdade, e o callback
// atualiza a tela em vez de só logar no console.




export const JS_INTERMEDIATE_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'Métodos de arrays',
      en: 'Array methods'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Métodos de array permitem realizar operações comuns sem precisar escrever manualmente todos os loops.',
            endParagraph: 'map cria um novo array transformando cada elemento. filter cria um novo array contendo apenas os elementos que atendem à condição.',
            highlight: ['map', 'filter', 'array'],
            codeLanguage: 'JavaScript',
            code: 'const numeros = [1, 2, 3, 4];\n\nconst dobrados = numeros.map(\n  numero => numero * 2\n);\n\nconst pares = numeros.filter(\n  numero => numero % 2 === 0\n);',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Array methods let you perform common operations without writing all the loops by hand.',
            endParagraph: 'map creates a new array by transforming each element. filter creates a new array containing only the elements that match the condition.',
            highlight: ['map', 'filter', 'array', 'Array'],
            codeLanguage: 'JavaScript',
            code: 'const numbers = [1, 2, 3, 4];\n\nconst doubled = numbers.map(\n  number => number * 2\n);\n\nconst even = numbers.filter(\n  number => number % 2 === 0\n);',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Alguns métodos permitem procurar elementos ou verificar condições em uma lista.',
            endParagraph: 'find procura um elemento, some verifica se pelo menos um atende à condição e every verifica se todos atendem.',
            highlight: ['find', 'some', 'every'],
            codeLanguage: 'JavaScript',
            code: 'const numeros = [2, 4, 6, 8];\n\nconst encontrado = numeros.find(\n  numero => numero > 5\n);\n\nconst existeImpar = numeros.some(\n  numero => numero % 2 !== 0\n);\n\nconst todosPares = numeros.every(\n  numero => numero % 2 === 0\n);',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'A few methods let you search for elements or check conditions in a list.',
            endParagraph: 'find looks for an element, some checks whether at least one matches the condition, and every checks whether all of them match.',
            highlight: ['find', 'some', 'every'],
            codeLanguage: 'JavaScript',
            code: 'const numbers = [2, 4, 6, 8];\n\nconst found = numbers.find(\n  number => number > 5\n);\n\nconst hasOdd = numbers.some(\n  number => number % 2 !== 0\n);\n\nconst allEven = numbers.every(\n  number => number % 2 === 0\n);',
            onlyCode: true,
            noTerminal: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Reduce',
      en: 'Reduce'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'reduce percorre um array e combina seus elementos para produzir um único resultado.',
            endParagraph: 'O valor acumulado passa de uma iteração para outra até que todos os elementos tenham sido processados.',
            highlight: ['reduce', 'array'],
            codeLanguage: 'JavaScript',
            code: 'const numeros = [10, 20, 30];\n\nconst total = numeros.reduce(\n  (soma, numero) => soma + numero,\n  0\n);\n\nconsole.log(total);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'reduce goes through an array and combines its elements to produce a single result.',
            endParagraph: 'The accumulated value is passed from one iteration to the next until all the elements have been processed.',
            highlight: ['reduce', 'array'],
            codeLanguage: 'JavaScript',
            code: 'const numbers = [10, 20, 30];\n\nconst total = numbers.reduce(\n  (sum, number) => sum + number,\n  0\n);\n\nconsole.log(total);',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Cada método possui uma finalidade. map transforma, filter seleciona, find procura e reduce combina valores.',
            endParagraph: 'Escolher o método adequado deixa o código mais expressivo e diminui a necessidade de loops manuais.',
            highlight: ['map', 'filter', 'find', 'reduce'],
            codeLanguage: 'JavaScript',
            code: 'const produtos = [\n  { nome: "Mouse", preco: 50 },\n  { nome: "Teclado", preco: 100 }\n];\n\nconst nomes = produtos.map(\n  produto => produto.nome\n);\n\nconst caros = produtos.filter(\n  produto => produto.preco > 60\n);',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Each method has its own purpose. map transforms, filter selects, find searches and reduce combines values.',
            endParagraph: 'Choosing the right method makes the code more expressive and cuts down the need for manual loops.',
            highlight: ['map', 'filter', 'find', 'reduce'],
            codeLanguage: 'JavaScript',
            code: 'const products = [\n  { name: "Mouse", price: 50 },\n  { name: "Keyboard", price: 100 }\n];\n\nconst names = products.map(\n  product => product.name\n);\n\nconst expensive = products.filter(\n  product => product.price > 60\n);',
            onlyCode: true,
            noTerminal: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Destructuring',
      en: 'Destructuring'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Destructuring permite extrair valores de objetos diretamente para variáveis.',
            endParagraph: 'Em vez de acessar cada propriedade separadamente, podemos extrair os valores que precisamos de forma direta.',
            highlight: ['Destructuring'],
            codeLanguage: 'JavaScript',
            code: 'const pessoa = {\n  nome: "Ana",\n  idade: 20\n};\n\nconst { nome, idade } = pessoa;',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Destructuring lets you extract values from objects directly into variables.',
            endParagraph: 'Instead of accessing each property separately, we can pull out the values we need in one step.',
            highlight: ['Destructuring'],
            codeLanguage: 'JavaScript',
            code: 'const person = {\n  name: "Ana",\n  age: 20\n};\n\nconst { name, age } = person;',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Também podemos utilizar destructuring com arrays.',
            endParagraph: 'No array, a posição determina qual valor será extraído. No objeto, utilizamos o nome da propriedade.',
            highlight: ['destructuring', 'array', 'arrays'],
            codeLanguage: 'JavaScript',
            code: 'const cores = [\n  "azul",\n  "verde",\n  "vermelho"\n];\n\nconst [primeira, segunda] = cores;',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'We can also use destructuring with arrays.',
            endParagraph: 'In an array, the position determines which value is extracted. In an object, we use the property name.',
            highlight: ['destructuring', 'array', 'arrays'],
            codeLanguage: 'JavaScript',
            code: 'const colors = [\n  "blue",\n  "green",\n  "red"\n];\n\nconst [first, second] = colors;',
            onlyCode: true,
            noTerminal: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Spread e rest',
      en: 'Spread and rest'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O spread operator ... permite expandir os elementos de um array ou as propriedades de um objeto.',
            endParagraph: 'Spread é muito utilizado para criar novas estruturas a partir de valores existentes sem modificar diretamente a estrutura original.',
            highlight: ['spread', 'Spread', 'array'],
            codeLanguage: 'JavaScript',
            code: 'const frutas = ["maçã", "banana"];\n\nconst novasFrutas = [\n  ...frutas,\n  "laranja"\n];',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'The spread operator ... lets you expand the elements of an array or the properties of an object.',
            endParagraph: 'Spread is widely used to create new structures from existing values without changing the original structure.',
            highlight: ['spread', 'Spread', 'array'],
            codeLanguage: 'JavaScript',
            code: 'const fruits = ["apple", "banana"];\n\nconst newFruits = [\n  ...fruits,\n  "orange"\n];',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Em determinados contextos, ... pode ser utilizado para reunir vários valores em uma única estrutura. Nesse caso, ele é chamado de rest.',
            endParagraph: 'Spread expande valores; rest reúne valores. A mesma sintaxe pode ter funções diferentes dependendo do contexto.',
            highlight: ['rest', 'Spread'],
            codeLanguage: 'JavaScript',
            code: 'function somar(...numeros) {\n  return numeros.reduce(\n    (total, numero) => total + numero,\n    0\n  );\n}\n\nconsole.log(somar(1, 2, 3));',
            onlyCode: true
          },
          en: {
            firstParagraph: 'In certain contexts, ... can be used to gather several values into a single structure. In that case, it is called rest.',
            endParagraph: 'Spread expands values; rest gathers values. The same syntax can play different roles depending on the context.',
            highlight: ['rest', 'Spread'],
            codeLanguage: 'JavaScript',
            code: 'function add(...numbers) {\n  return numbers.reduce(\n    (total, number) => total + number,\n    0\n  );\n}\n\nconsole.log(add(1, 2, 3));',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Template literals e sintaxe moderna',
      en: 'Template literals and modern syntax'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Template literals permitem criar strings utilizando crases e inserir expressões diretamente no texto.',
            endParagraph: 'Eles tornam a criação de textos dinâmicos mais simples e legível.',
            highlight: ['Template literals', 'strings'],
            codeLanguage: 'JavaScript',
            code: 'const nome = "Ana";\nconst idade = 20;\n\nconst mensagem =\n  `Olá, ${nome}! Você tem ${idade} anos.`;',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Template literals let you create strings using backticks and insert expressions directly into the text.',
            endParagraph: 'They make building dynamic text simpler and easier to read.',
            highlight: ['Template literals', 'strings'],
            codeLanguage: 'JavaScript',
            code: 'const name = "Ana";\nconst age = 20;\n\nconst message =\n  `Hello, ${name}! You are ${age} years old.`;',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Optional chaining permite acessar propriedades sem gerar um erro quando uma parte do caminho não existe.',
            secondParagraph: 'O nullish coalescing fornece um valor alternativo quando o resultado é null ou undefined.',
            endParagraph: 'Esses recursos ajudam a escrever código mais seguro ao trabalhar com dados que podem estar incompletos.',
            highlight: ['Optional chaining', 'nullish coalescing', 'null', 'undefined'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = {};\n\nconst cidade =\n  usuario.endereco?.cidade ?? "Não informada";',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Optional chaining lets you access properties without raising an error when part of the path does not exist.',
            secondParagraph: 'Nullish coalescing provides an alternative value when the result is null or undefined.',
            endParagraph: 'These features help you write safer code when working with data that may be incomplete.',
            highlight: ['Optional chaining', 'Nullish coalescing', 'null', 'undefined'],
            codeLanguage: 'JavaScript',
            code: 'const user = {};\n\nconst city =\n  user.address?.city ?? "Not provided";',
            onlyCode: true,
            noTerminal: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Módulos',
      en: 'Modules'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Módulos permitem dividir o código em arquivos menores e reutilizáveis. Para disponibilizar uma função, podemos utilizar export.',
            endParagraph: 'Separar responsabilidades em arquivos diferentes ajuda a organizar aplicações maiores.',
            highlight: ['Módulos', 'export'],
            codeLanguage: 'JavaScript',
            code: 'export function somar(a, b) {\n  return a + b;\n}',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Modules let you split the code into smaller, reusable files. To make a function available, we can use export.',
            endParagraph: 'Splitting responsibilities across different files helps organize larger applications.',
            highlight: ['Modules', 'export'],
            codeLanguage: 'JavaScript',
            code: 'export function add(a, b) {\n  return a + b;\n}',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'import permite utilizar código exportado por outro módulo.',
            endParagraph: 'Com import e export, diferentes partes de uma aplicação podem compartilhar funcionalidades de maneira organizada.',
            highlight: ['import', 'export', 'módulo'],
            codeLanguage: 'JavaScript',
            code: 'import { somar } from "./math.js";\n\nconst resultado = somar(2, 3);\n\nconsole.log(resultado);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'import lets you use code exported by another module.',
            endParagraph: 'With import and export, different parts of an application can share features in an organized way.',
            highlight: ['import', 'export', 'module'],
            codeLanguage: 'JavaScript',
            code: 'import { add } from "./math.js";\n\nconst result = add(2, 3);\n\nconsole.log(result);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'DOM',
      en: 'DOM'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O DOM representa a estrutura da página como objetos que podem ser acessados e modificados por JavaScript.',
            endParagraph: 'O DOM permite que JavaScript interaja com elementos que foram definidos no HTML.',
            highlight: ['DOM', 'JavaScript', 'HTML'],
            codeLanguage: 'HTML',
            code: '<h1 id="titulo">\n  Olá!\n</h1>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'const titulo =\n  document.querySelector("#titulo");\n\ntitulo.textContent = "Olá, JavaScript!";'
              }
            ]
          },
          en: {
            firstParagraph: 'The DOM represents the structure of the page as objects that can be accessed and changed by JavaScript.',
            endParagraph: 'The DOM lets JavaScript interact with elements that were defined in the HTML.',
            highlight: ['DOM', 'JavaScript', 'HTML'],
            codeLanguage: 'HTML',
            code: '<h1 id="title">\n  Hello!\n</h1>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'const title =\n  document.querySelector("#title");\n\ntitle.textContent = "Hello, JavaScript!";'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript também pode criar novos elementos e adicioná-los ao documento.',
            endParagraph: 'Toque no botão abaixo: cada toque cria um novo item de lista e o adiciona à página, ao vivo.',
            highlight: ['JavaScript', 'DOM'],
            codeLanguage: 'HTML',
            code: '<ul id="lista">\n  <li>JavaScript</li>\n</ul>\n\n<button id="botao-adicionar">\n  Adicionar item\n</button>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'let contador = 1;\n\ndocument\n  .querySelector("#botao-adicionar")\n  .addEventListener("click", () => {\n    contador++;\n\n    const item =\n      document.createElement("li");\n    item.textContent = "Item " + contador;\n\n    document\n      .querySelector("#lista")\n      .appendChild(item);\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'JavaScript can also create new elements and add them to the document.',
            endParagraph: 'Tap the button below: each tap creates a new list item and adds it to the page, live.',
            highlight: ['JavaScript', 'DOM'],
            codeLanguage: 'HTML',
            code: '<ul id="list">\n  <li>JavaScript</li>\n</ul>\n\n<button id="add-button">\n  Add item\n</button>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'let counter = 1;\n\ndocument\n  .querySelector("#add-button")\n  .addEventListener("click", () => {\n    counter++;\n\n    const item =\n      document.createElement("li");\n    item.textContent = "Item " + counter;\n\n    document\n      .querySelector("#list")\n      .appendChild(item);\n  });'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Classes, atributos e eventos',
      en: 'Classes, attributes and events'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript pode modificar classes e atributos de elementos existentes no DOM.',
            endParagraph: 'Toque no botão: classList.toggle() liga e desliga a classe "ativo" a cada toque, mudando o visual do cartão. Atributos (como aria-label) mudam da mesma forma, com setAttribute.',
            highlight: ['JavaScript', 'DOM', 'classes'],
            codeLanguage: 'HTML',
            code: '<div id="cartao" class="cartao">\n  Cartão\n</div>\n\n<button id="botao-destaque">\n  Alternar destaque\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.cartao {\n  padding: 16px;\n  border: 2px solid #999;\n  border-radius: 8px;\n  text-align: center;\n}\n\n.cartao.ativo {\n  border-color: #2563eb;\n  background-color: #dbeafe;\n}'
              },
              {
                codeLanguage: 'JavaScript',
                code: 'document\n  .querySelector("#botao-destaque")\n  .addEventListener("click", () => {\n    document\n      .querySelector("#cartao")\n      .classList.toggle("ativo");\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'JavaScript can change classes and attributes of elements that already exist in the DOM.',
            endParagraph: 'Tap the button: classList.toggle() switches the "active" class on and off on every tap, changing how the card looks. Attributes (like aria-label) change the same way, with setAttribute.',
            highlight: ['JavaScript', 'DOM', 'classes'],
            codeLanguage: 'HTML',
            code: '<div id="card" class="card">\n  Card\n</div>\n\n<button id="highlight-button">\n  Toggle highlight\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.card {\n  padding: 16px;\n  border: 2px solid #999;\n  border-radius: 8px;\n  text-align: center;\n}\n\n.card.active {\n  border-color: #2563eb;\n  background-color: #dbeafe;\n}'
              },
              {
                codeLanguage: 'JavaScript',
                code: 'document\n  .querySelector("#highlight-button")\n  .addEventListener("click", () => {\n    document\n      .querySelector("#card")\n      .classList.toggle("active");\n  });'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Eventos representam acontecimentos como cliques, teclas pressionadas ou alterações em campos. addEventListener permite executar uma função quando um evento acontece.',
            endParagraph: 'Toque no botão abaixo para ver a função do evento mudando a mensagem na tela.',
            highlight: ['Eventos', 'evento', 'addEventListener', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<button id="botao-clique">\n  Clique aqui\n</button>\n\n<p id="mensagem">\n  Aguardando clique...\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'const botao =\n  document.querySelector("#botao-clique");\n\nbotao.addEventListener(\n  "click",\n  () => {\n    document\n      .querySelector("#mensagem")\n      .textContent = "Você clicou no botão!";\n  }\n);'
              }
            ]
          },
          en: {
            firstParagraph: 'Events represent things that happen, like clicks, key presses or changes in fields. addEventListener lets you run a function when an event happens.',
            endParagraph: 'Tap the button below to see the event function change the message on the screen.',
            highlight: ['Events', 'event', 'addEventListener', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<button id="click-button">\n  Click here\n</button>\n\n<p id="message">\n  Waiting for a click...\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'const button =\n  document.querySelector("#click-button");\n\nbutton.addEventListener(\n  "click",\n  () => {\n    document\n      .querySelector("#message")\n      .textContent = "You clicked the button!";\n  }\n);'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'LocalStorage e JSON',
      en: 'LocalStorage and JSON'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'localStorage permite armazenar pequenos valores no navegador para que possam ser recuperados posteriormente.',
            endParagraph: 'Os valores armazenados no localStorage são strings. Para estruturas maiores, precisamos trabalhar com JSON.',
            highlight: ['localStorage', 'JSON', 'strings'],
            codeLanguage: 'JavaScript',
            code: 'localStorage.setItem(\n  "nome",\n  "Ana"\n);\n\nconst nome =\n  localStorage.getItem("nome");',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'localStorage lets you store small values in the browser so they can be retrieved later.',
            endParagraph: 'The values stored in localStorage are strings. For larger structures, we need to work with JSON.',
            highlight: ['localStorage', 'JSON', 'strings'],
            codeLanguage: 'JavaScript',
            code: 'localStorage.setItem(\n  "name",\n  "Ana"\n);\n\nconst name =\n  localStorage.getItem("name");',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JSON permite transformar objetos JavaScript em strings e depois reconstruí-los.',
            endParagraph: 'JSON.stringify() transforma um valor em JSON. JSON.parse() faz o caminho inverso.',
            highlight: ['JSON', 'JavaScript', 'strings'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = {\n  nome: "Ana",\n  idade: 20\n};\n\nlocalStorage.setItem(\n  "usuario",\n  JSON.stringify(usuario)\n);\n\nconst salvo =\n  JSON.parse(\n    localStorage.getItem("usuario")\n  );',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'JSON lets you turn JavaScript objects into strings and then rebuild them.',
            endParagraph: 'JSON.stringify() turns a value into JSON. JSON.parse() does the opposite.',
            highlight: ['JSON', 'JavaScript', 'strings'],
            codeLanguage: 'JavaScript',
            code: 'const user = {\n  name: "Ana",\n  age: 20\n};\n\nlocalStorage.setItem(\n  "user",\n  JSON.stringify(user)\n);\n\nconst saved =\n  JSON.parse(\n    localStorage.getItem("user")\n  );',
            onlyCode: true,
            noTerminal: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'HTTP e fetch',
      en: 'HTTP and fetch'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Aplicações web frequentemente precisam buscar ou enviar dados para um servidor. HTTP é um protocolo utilizado para essa comunicação.',
            secondParagraph: 'Uma requisição possui informações como método e endereço. O servidor devolve uma resposta contendo dados ou informações sobre o resultado da operação.',
            endParagraph: 'JavaScript oferece fetch() para realizar requisições HTTP de forma programática.',
            highlight: ['HTTP', 'fetch', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'fetch("/api/users");',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Web applications often need to request or send data to a server. HTTP is a protocol used for that communication.',
            secondParagraph: 'A request carries information such as a method and an address. The server returns a response with data or information about the result of the operation.',
            endParagraph: 'JavaScript provides fetch() to make HTTP requests programmatically.',
            highlight: ['HTTP', 'fetch', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'fetch("/api/users");',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma resposta HTTP pode conter dados que precisamos transformar em JavaScript para utilizar na aplicação.',
            endParagraph: 'O resultado de uma requisição é assíncrono. Por isso, precisamos entender como o JavaScript trabalha com operações que terminam posteriormente.',
            highlight: ['HTTP', 'JavaScript', 'assíncrono'],
            codeLanguage: 'JavaScript',
            code: 'fetch("/api/users")\n  .then(response => response.json())\n  .then(users => {\n    console.log(users);\n  });',
            onlyCode: true
          },
          en: {
            firstParagraph: 'An HTTP response can carry data that we need to turn into JavaScript values to use in the application.',
            endParagraph: 'The result of a request is asynchronous. That is why we need to understand how JavaScript deals with operations that finish later.',
            highlight: ['HTTP', 'JavaScript', 'asynchronous'],
            codeLanguage: 'JavaScript',
            code: 'fetch("/api/users")\n  .then(response => response.json())\n  .then(users => {\n    console.log(users);\n  });',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Callbacks',
      en: 'Callbacks'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Em JavaScript, funções podem ser passadas como argumento para outras funções. Uma função passada dessa forma é chamada de callback.',
            secondParagraph: 'Quem recebe o callback decide quando executá-lo. No exemplo, a função só é chamada depois que a mensagem é montada.',
            thirdParagraph: 'Toque no botão abaixo para executar saudar() de verdade: o callback roda depois que a mensagem é montada, e atualiza o texto na tela.',
            endParagraph: 'Você já usou callbacks antes: o que é passado para map, para filter e para addEventListener é exatamente isso.',
            highlight: ['callback', 'callbacks', 'map', 'filter', 'addEventListener'],
            codeLanguage: 'HTML',
            code: '<button id="botao-saudar">\n  Cumprimentar\n</button>\n\n<p id="saida"></p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function saudar(nome, callback) {\n  const mensagem = "Olá, " + nome;\n  callback(mensagem);\n}\n\ndocument\n  .querySelector("#botao-saudar")\n  .addEventListener("click", () => {\n    saudar("Ana", (texto) => {\n      document.querySelector("#saida").textContent = texto;\n    });\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'In JavaScript, functions can be passed as arguments to other functions. A function passed this way is called a callback.',
            secondParagraph: 'Whoever receives the callback decides when to run it. In the example, the function is only called after the message is built.',
            thirdParagraph: 'Tap the button below to actually run greet(): the callback runs after the message is built, and updates the text on the screen.',
            endParagraph: 'You have used callbacks before: what you pass to map, to filter and to addEventListener is exactly that.',
            highlight: ['callback', 'callbacks', 'map', 'filter', 'addEventListener'],
            codeLanguage: 'HTML',
            code: '<button id="greet-button">\n  Greet\n</button>\n\n<p id="output"></p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function greet(name, callback) {\n  const message = "Hello, " + name;\n  callback(message);\n}\n\ndocument\n  .querySelector("#greet-button")\n  .addEventListener("click", () => {\n    greet("Ana", (text) => {\n      document.querySelector("#output").textContent = text;\n    });\n  });'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Callbacks são a base do código assíncrono em JavaScript: eles permitem executar algo depois que uma tarefa termina.',
            secondParagraph: 'O problema aparece quando uma tarefa depende da anterior. Os callbacks vão se aninhando e o código fica difícil de acompanhar.',
            endParagraph: 'Esse encadeamento ficou conhecido como callback hell. É justamente o problema que as Promises, a seguir, vieram resolver.',
            highlight: ['Callbacks', 'callbacks', 'callback hell', 'Promises'],
            codeLanguage: 'JavaScript',
            code: 'buscarUsuario(1, function (usuario) {\n  buscarPedidos(usuario, function (pedidos) {\n    buscarDetalhes(pedidos[0], function (detalhes) {\n      console.log(detalhes);\n    });\n  });\n});',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Callbacks are the foundation of asynchronous code in JavaScript: they let you run something after a task finishes.',
            secondParagraph: 'The problem shows up when one task depends on the previous one. Callbacks keep nesting and the code becomes hard to follow.',
            endParagraph: 'This chaining became known as callback hell. It is exactly the problem that Promises, coming next, were made to solve.',
            highlight: ['Callbacks', 'callbacks', 'callback hell', 'Promises'],
            codeLanguage: 'JavaScript',
            code: 'fetchUser(1, function (user) {\n  fetchOrders(user, function (orders) {\n    fetchDetails(orders[0], function (details) {\n      console.log(details);\n    });\n  });\n});',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Promises',
      en: 'Promises'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Algumas operações não produzem um resultado imediatamente. Uma Promise representa uma operação que poderá ser concluída ou falhar no futuro.',
            endParagraph: 'Uma Promise pode representar uma operação pendente, concluída com sucesso ou concluída com erro.',
            highlight: ['Promise'],
            codeLanguage: 'JavaScript',
            code: 'const promessa = fetch(\n  "/api/users"\n);\n\npromessa.then(response => {\n  console.log("Resposta recebida");\n});',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Some operations do not produce a result immediately. A Promise represents an operation that may be completed or fail in the future.',
            endParagraph: 'A Promise can represent a pending operation, one completed successfully, or one completed with an error.',
            highlight: ['Promise'],
            codeLanguage: 'JavaScript',
            code: 'const promise = fetch(\n  "/api/users"\n);\n\npromise.then(response => {\n  console.log("Response received");\n});',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos encadear .then() para tratar o resultado e .catch() para lidar com erros.',
            secondParagraph: 'Aqui, buscarUsuarios() simula uma requisição (como um fetch de verdade faria) com um atraso e uma chance de falhar, para o exemplo funcionar sem depender de rede.',
            endParagraph: 'Toque no botão algumas vezes: às vezes o pedido terá sucesso, às vezes vai falhar — e você verá .then() e .catch() tratando cada caso.',
            highlight: ['then', 'catch'],
            codeLanguage: 'HTML',
            code: '<button id="botao-buscar">\n  Buscar usuários\n</button>\n\n<p id="resultado">\n  Aguardando...\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function buscarUsuarios() {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      const sucesso = Math.random() > 0.3;\n\n      if (sucesso) {\n        resolve(["Ana", "Bruno", "Carla"]);\n      } else {\n        reject("Falha ao buscar usuários");\n      }\n    }, 800);\n  });\n}\n\ndocument\n  .querySelector("#botao-buscar")\n  .addEventListener("click", () => {\n    document.querySelector("#resultado").textContent = "Carregando...";\n\n    buscarUsuarios()\n      .then((usuarios) => {\n        document.querySelector("#resultado").textContent = usuarios.join(", ");\n      })\n      .catch((erro) => {\n        document.querySelector("#resultado").textContent = erro;\n      });\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'We can chain .then() to handle the result and .catch() to deal with errors.',
            secondParagraph: 'Here, fetchUsers() simulates a request (like a real fetch would) with a delay and a chance to fail, so the example works without depending on the network.',
            endParagraph: 'Tap the button a few times: sometimes the request will succeed, sometimes it will fail — and you will see .then() and .catch() handling each case.',
            highlight: ['then', 'catch'],
            codeLanguage: 'HTML',
            code: '<button id="fetch-button">\n  Fetch users\n</button>\n\n<p id="result">\n  Waiting...\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function fetchUsers() {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      const success = Math.random() > 0.3;\n\n      if (success) {\n        resolve(["Ana", "Bruno", "Carla"]);\n      } else {\n        reject("Failed to fetch users");\n      }\n    }, 800);\n  });\n}\n\ndocument\n  .querySelector("#fetch-button")\n  .addEventListener("click", () => {\n    document.querySelector("#result").textContent = "Loading...";\n\n    fetchUsers()\n      .then((users) => {\n        document.querySelector("#result").textContent = users.join(", ");\n      })\n      .catch((error) => {\n        document.querySelector("#result").textContent = error;\n      });\n  });'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Async e await',
      en: 'Async and await'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'async/await permite escrever código assíncrono com uma estrutura semelhante à de código sequencial.',
            endParagraph: 'Toque no botão: await pausa carregarUsuarios() até buscarUsuarios() terminar, e só então a tela é atualizada — sem nenhum .then().',
            highlight: ['async', 'await'],
            codeLanguage: 'HTML',
            code: '<button id="botao-carregar">\n  Carregar usuários\n</button>\n\n<p id="resultado">\n  Aguardando...\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function buscarUsuarios() {\n  return new Promise((resolve) => {\n    setTimeout(() => {\n      resolve(["Ana", "Bruno", "Carla"]);\n    }, 800);\n  });\n}\n\nasync function carregarUsuarios() {\n  document.querySelector("#resultado").textContent = "Carregando...";\n\n  const usuarios = await buscarUsuarios();\n\n  document.querySelector("#resultado").textContent = usuarios.join(", ");\n}\n\ndocument\n  .querySelector("#botao-carregar")\n  .addEventListener("click", carregarUsuarios);'
              }
            ]
          },
          en: {
            firstParagraph: 'async/await lets you write asynchronous code with a structure similar to sequential code.',
            endParagraph: 'Tap the button: await pauses loadUsers() until fetchUsers() finishes, and only then is the screen updated — with no .then() at all.',
            highlight: ['async', 'await'],
            codeLanguage: 'HTML',
            code: '<button id="load-button">\n  Load users\n</button>\n\n<p id="result">\n  Waiting...\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function fetchUsers() {\n  return new Promise((resolve) => {\n    setTimeout(() => {\n      resolve(["Ana", "Bruno", "Carla"]);\n    }, 800);\n  });\n}\n\nasync function loadUsers() {\n  document.querySelector("#result").textContent = "Loading...";\n\n  const users = await fetchUsers();\n\n  document.querySelector("#result").textContent = users.join(", ");\n}\n\ndocument\n  .querySelector("#load-button")\n  .addEventListener("click", loadUsers);'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos utilizar try/catch para tratar erros durante uma operação assíncrona.',
            endParagraph: 'async/await e try/catch formam uma combinação comum para trabalhar com operações assíncronas de maneira clara.',
            highlight: ['try', 'catch', 'async', 'await'],
            codeLanguage: 'JavaScript',
            code: 'async function carregarUsuarios() {\n  try {\n    const response =\n      await fetch("/api/users");\n\n    const users =\n      await response.json();\n\n    console.log(users);\n  } catch (error) {\n    console.error(error);\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can use try/catch to handle errors during an asynchronous operation.',
            endParagraph: 'async/await and try/catch are a common combination for working with asynchronous operations clearly.',
            highlight: ['try', 'catch', 'async', 'await'],
            codeLanguage: 'JavaScript',
            code: 'async function loadUsers() {\n  try {\n    const response =\n      await fetch("/api/users");\n\n    const users =\n      await response.json();\n\n    console.log(users);\n  } catch (error) {\n    console.error(error);\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  }
]

// ============================================================
// Conteúdo curricular do terceiro módulo ("Avançado") de cada área. Parte do
// princípio de que o aluno já concluiu os módulos Básico e Intermediário da
// mesma área — nada aqui repete fundamentos. O foco é apresentar recursos
// mais avançados e menos usados no dia a dia, preparando terreno para o
// módulo "Além de" (React/Tailwind/Node+Express), que ainda não foi seedado.
// Só `theory` por enquanto, pelo mesmo motivo dos módulos anteriores.
//
// Este conteúdo segue a segunda versão da proposta curricular recebida do
// desenvolvedor — mais detalhada e, em JavaScript, com foco totalmente
// diferente da primeira versão (que chegou a ser seedada e foi substituída):
// aprofundamento da própria linguagem (closures, this, prototypes, event
// loop, cópia por valor/referência...) seguido de uma trilha completa de
// TypeScript, sem nenhum conteúdo de Node.js/Express — esses ficam
// reservados para um módulo futuro ("Além do JavaScript"), fora de escopo
// aqui.
//
// Decisões técnicas que moldaram a apresentação, sem alterar a arquitetura:
//   - `TheoryActivityContent.codeLanguage`/`additionalCode[].codeLanguage`
//     aceitam `'TypeScript'` (extensão aditiva, refletida em
//     `CodeSection.tsx`/`TheoryLesson.tsx` no app) — usado pela trilha de
//     TypeScript. `highlight.js` já registra `typescript` nativamente, sem
//     dependência nova.
//   - `:hover`/`:focus` não são demonstráveis no toque, e um breakpoint
//     `min-width: 768px` nunca é atingido pela largura real do
//     `CodeSection` num celular — por isso a maior parte das lições de CSS
//     que dependem desses recursos é `onlyCode: true`. Onde o efeito não
//     depende de interação (cascata, especificidade, seletores estruturais
//     como `:has()`, `aspect-ratio`, uma animação aplicada via `animation`
//     que roda sozinha ao carregar a página, `clamp()` reagindo a `vw`), a
//     aba "Web" continua ligada, porque a demonstração é genuína.
//   - Termos de destaque (`highlight`) nunca incluem palavras curtas e
//     comuns em prosa (pt: "a", "em"; en: "this", "any", "is", "has",
//     "where", "not" — todas usadas neste módulo como parte da explicação
//     de JavaScript/TypeScript/CSS, mas nunca como termo de destaque) nem
//     pseudo-classes com `:` (ex.: `:not()`, `:has()`, `:focus`) — o
//     matching de `ThemedHighlighter` é `\bpalavra\b`, e uma palavra que
//     começa com um caractere não alfanumérico só casa se vier colada a uma
//     letra antes dela, o que nunca acontece em prosa normal. Nesses casos,
//     o destaque de palavra fica mais esparso (ou ausente) de propósito; o
//     Syntax Highlighting do bloco de código continua correto.
// ============================================================

// --- HTML Avançado: trechos de código ---

















































// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).


export const HTML_ADVANCED_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'Texto com significado',
      en: 'Text with meaning'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O HTML possui elementos específicos para representar diferentes tipos de informação textual. <abbr> representa uma abreviação e <cite> identifica o título de uma obra ou referência.',
            endParagraph: 'Elementos semânticos não mudam necessariamente a aparência do texto, mas acrescentam significado à estrutura do documento.',
            highlight: ['HTML', 'abbr', 'cite'],
            codeLanguage: 'HTML',
            code: '<p>\n  A <abbr title="Application Programming Interface">\n    API\n  </abbr>\n  permite a comunicação entre sistemas.\n</p>\n\n<p>\n  <cite>O Pequeno Príncipe</cite>\n  é uma obra conhecida mundialmente.\n</p>'
          },
          en: {
            firstParagraph: 'HTML has specific elements to represent different kinds of textual information. <abbr> represents an abbreviation and <cite> identifies the title of a work or reference.',
            endParagraph: 'Semantic elements do not necessarily change how the text looks, but they add meaning to the structure of the document.',
            highlight: ['HTML', 'abbr', 'cite'],
            codeLanguage: 'HTML',
            code: '<p>\n  The <abbr title="Application Programming Interface">\n    API\n  </abbr>\n  allows communication between systems.\n</p>\n\n<p>\n  <cite>The Little Prince</cite>\n  is a world-famous work.\n</p>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<q> representa uma pequena citação incorporada ao texto. <blockquote> representa uma citação mais extensa.',
            endParagraph: 'Quando o conteúdo possui um significado específico, utilizar o elemento apropriado é melhor do que tentar representar tudo com <div> ou <span>.',
            highlight: ['q', 'blockquote', 'div', 'span'],
            codeLanguage: 'HTML',
            code: '<p>\n  Como dizia um antigo provérbio:\n  <q>Conhecimento é poder.</q>\n</p>\n\n<blockquote>\n  Uma citação longa pode ser representada\n  usando este elemento.\n</blockquote>'
          },
          en: {
            firstParagraph: '<q> represents a short quotation embedded in the text. <blockquote> represents a longer quotation.',
            endParagraph: 'When content has a specific meaning, using the appropriate element is better than trying to represent everything with <div> or <span>.',
            highlight: ['q', 'blockquote', 'div', 'span'],
            codeLanguage: 'HTML',
            code: '<p>\n  As an old proverb says:\n  <q>Knowledge is power.</q>\n</p>\n\n<blockquote>\n  A long quotation can be represented\n  using this element.\n</blockquote>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Conteúdo técnico',
      en: 'Technical content'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O HTML possui elementos próprios para representar código e conteúdo relacionado à programação.',
            endParagraph: '<code> representa um trecho de código. <pre> preserva espaços e quebras de linha, sendo útil para blocos de código.',
            highlight: ['code', 'pre'],
            codeLanguage: 'HTML',
            code: '<p>Use a função <code>console.log()</code>.</p>\n\n<pre><code>\nconst nome = "Ana";\n\nconsole.log(nome);\n</code></pre>'
          },
          en: {
            firstParagraph: 'HTML has its own elements to represent code and content related to programming.',
            endParagraph: '<code> represents a piece of code. <pre> preserves spaces and line breaks, which is useful for code blocks.',
            highlight: ['code', 'pre'],
            codeLanguage: 'HTML',
            code: '<p>Use the <code>console.log()</code> function.</p>\n\n<pre><code>\nconst name = "Ana";\n\nconsole.log(name);\n</code></pre>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<kbd> representa uma entrada fornecida pelo usuário, como uma tecla. <samp> representa uma saída produzida por um programa.',
            endParagraph: 'Esses elementos são pouco utilizados em páginas comuns, mas permitem representar informações técnicas com significado apropriado.',
            highlight: ['kbd', 'samp'],
            codeLanguage: 'HTML',
            code: '<p>\n  Pressione <kbd>Ctrl</kbd> + <kbd>S</kbd>\n  para salvar.\n</p>\n\n<p>\n  Resultado:\n  <samp>Arquivo salvo.</samp>\n</p>'
          },
          en: {
            firstParagraph: '<kbd> represents input provided by the user, such as a key. <samp> represents output produced by a program.',
            endParagraph: 'These elements are rarely used on common pages, but they let you represent technical information with the appropriate meaning.',
            highlight: ['kbd', 'samp'],
            codeLanguage: 'HTML',
            code: '<p>\n  Press <kbd>Ctrl</kbd> + <kbd>S</kbd>\n  to save.\n</p>\n\n<p>\n  Result:\n  <samp>File saved.</samp>\n</p>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Texto especializado',
      en: 'Specialized text'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<mark> destaca um trecho relevante do texto. <small> representa um texto secundário, como um aviso legal ou uma nota de rodapé.',
            endParagraph: 'Esses elementos mudam o significado do texto, não só a aparência — mesmo que o navegador também aplique um estilo padrão a eles.',
            highlight: ['mark', 'small'],
            codeLanguage: 'HTML',
            code: '<p>\n  O prazo termina em\n  <mark>3 dias</mark>.\n</p>\n\n<p>\n  <small>Termos sujeitos a alteração.</small>\n</p>'
          },
          en: {
            firstParagraph: '<mark> highlights a relevant part of the text. <small> represents secondary text, such as a legal notice or a footnote.',
            endParagraph: 'These elements change the meaning of the text, not just its appearance — even though the browser also applies a default style to them.',
            highlight: ['mark', 'small'],
            codeLanguage: 'HTML',
            code: '<p>\n  The deadline ends in\n  <mark>3 days</mark>.\n</p>\n\n<p>\n  <small>Terms subject to change.</small>\n</p>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<del> indica um trecho removido e <ins> indica um trecho inserido, geralmente usados juntos para mostrar uma edição.',
            secondParagraph: '<sub> e <sup> deslocam o texto para baixo ou para cima, úteis em fórmulas e notações.',
            endParagraph: 'Cada um desses elementos comunica uma intenção específica que vai além do estilo visual.',
            highlight: ['del', 'ins', 'sub', 'sup'],
            codeLanguage: 'HTML',
            code: '<p>\n  De <del>R$ 100</del>\n  <ins>R$ 80</ins>\n</p>\n\n<p>\n  H<sub>2</sub>O e 10<sup>2</sup>\n</p>'
          },
          en: {
            firstParagraph: '<del> marks removed content and <ins> marks inserted content, usually shown together to represent an edit.',
            secondParagraph: '<sub> and <sup> shift text below or above the baseline, useful for formulas and notations.',
            endParagraph: 'Each of these elements communicates a specific intent that goes beyond visual styling.',
            highlight: ['del', 'ins', 'sub', 'sup'],
            codeLanguage: 'HTML',
            code: '<p>\n  From <del>$100</del>\n  <ins>$80</ins>\n</p>\n\n<p>\n  H<sub>2</sub>O and 10<sup>2</sup>\n</p>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Datas e dados',
      en: 'Dates and data'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<time> representa um horário de forma que máquinas também conseguem interpretar, por meio do atributo datetime.',
            endParagraph: 'O texto exibido pode ser amigável para pessoas, enquanto o atributo datetime guarda um valor estruturado para máquinas.',
            highlight: ['time', 'datetime'],
            codeLanguage: 'HTML',
            code: '<p>\n  Publicado em\n  <time datetime="2026-09-10">\n    10 de setembro\n  </time>\n</p>'
          },
          en: {
            firstParagraph: '<time> represents a moment in a way machines can also interpret, through the datetime attribute.',
            endParagraph: 'The displayed text can be friendly for people, while the datetime attribute holds a structured value for machines.',
            highlight: ['time', 'datetime'],
            codeLanguage: 'HTML',
            code: '<p>\n  Published on\n  <time datetime="2026-09-10">\n    September 10th\n  </time>\n</p>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <data> funciona de forma parecida com <time>, mas serve para qualquer tipo de valor, não só para quando algo aconteceu.',
            endParagraph: 'Assim como datetime em <time>, o atributo value em <data> não muda o que aparece na tela — só o que outros sistemas conseguem ler.',
            highlight: ['data', 'time', 'value'],
            codeLanguage: 'HTML',
            code: '<p>\n  <data value="42">\n    Produto #42\n  </data>\n</p>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The <data> element works similarly to <time>, but it fits any kind of value, not only a moment in time.',
            endParagraph: 'Just like datetime on <time>, the value attribute on <data> doesn\'t change what appears on screen — only what other systems can read.',
            highlight: ['data', 'time', 'value'],
            codeLanguage: 'HTML',
            code: '<p>\n  <data value="42">\n    Product #42\n  </data>\n</p>',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Áudio e vídeo',
      en: 'Audio and video'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'HTML possui os elementos <video> e <audio> nativos para incorporar mídia, sem depender de componentes externos.',
            endParagraph: 'Esses elementos fornecem controles e uma estrutura semântica diretamente no HTML.',
            highlight: ['video', 'audio', 'HTML'],
            codeLanguage: 'HTML',
            code: '<video controls width="320">\n  <source\n    src="video.mp4"\n    type="video/mp4"\n  >\n</video>\n\n<audio controls>\n  <source\n    src="audio.mp3"\n    type="audio/mpeg"\n  >\n</audio>'
          },
          en: {
            firstParagraph: 'HTML has native <video> and <audio> elements to embed media, without depending on external components.',
            endParagraph: 'These elements provide controls and a semantic structure directly in HTML.',
            highlight: ['video', 'audio', 'HTML'],
            codeLanguage: 'HTML',
            code: '<video controls width="320">\n  <source\n    src="video.mp4"\n    type="video/mp4"\n  >\n</video>\n\n<audio controls>\n  <source\n    src="audio.mp3"\n    type="audio/mpeg"\n  >\n</audio>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento track adiciona legendas a um vídeo, sem depender de nenhum recurso externo.',
            secondParagraph: 'O atributo kind indica o tipo da faixa, srclang informa o idioma e label é o nome que aparece para quem escolhe a legenda.',
            endParagraph: 'Legendas beneficiam quem tem deficiência auditiva, quem não fala o idioma do vídeo e quem simplesmente está sem som — por isso são parte da acessibilidade, e não um extra.',
            highlight: ['track', 'kind', 'srclang', 'label'],
            codeLanguage: 'HTML',
            code: '<video controls width="320">\n  <source\n    src="video.mp4"\n    type="video/mp4"\n  >\n  <track\n    src="legendas.vtt"\n    kind="captions"\n    srclang="pt"\n    label="Português"\n    default\n  >\n</video>'
          },
          en: {
            firstParagraph: 'The track element adds captions to a video, without relying on any external resource.',
            secondParagraph: 'The kind attribute states the type of the track, srclang gives the language, and label is the name shown to whoever picks the caption.',
            endParagraph: 'Captions help people who are deaf or hard of hearing, people who do not speak the language of the video, and anyone watching without sound — which is why they are part of accessibility, not an extra.',
            highlight: ['track', 'kind', 'srclang', 'label'],
            codeLanguage: 'HTML',
            code: '<video controls width="320">\n  <source\n    src="video.mp4"\n    type="video/mp4"\n  >\n  <track\n    src="captions.vtt"\n    kind="captions"\n    srclang="en"\n    label="English"\n    default\n  >\n</video>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Conteúdo incorporado',
      en: 'Embedded content'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<iframe> incorpora outra página dentro da página atual, como um documento dentro do documento.',
            endParagraph: 'O atributo title é importante para acessibilidade: ele descreve o conteúdo incorporado para quem usa leitor de tela.',
            highlight: ['iframe', 'title'],
            codeLanguage: 'HTML',
            code: '<iframe\n  src="https://example.com"\n  width="300"\n  height="200"\n  title="Página incorporada"\n>\n</iframe>',
            onlyCode: true
          },
          en: {
            firstParagraph: '<iframe> embeds another page inside the current page, like a document within the document.',
            endParagraph: 'The title attribute matters for accessibility: it describes the embedded content for someone using a screen reader.',
            highlight: ['iframe', 'title'],
            codeLanguage: 'HTML',
            code: '<iframe\n  src="https://example.com"\n  width="300"\n  height="200"\n  title="Embedded page"\n>\n</iframe>',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Excesso de iframes pode deixar a página mais lenta e trazer riscos de segurança, já que o conteúdo vem de outra origem.',
            secondParagraph: 'O atributo sandbox permite restringir o que o conteúdo incorporado pode fazer.',
            endParagraph: 'Use iframe apenas quando for realmente necessário incorporar conteúdo externo.',
            highlight: ['iframe', 'sandbox'],
            codeLanguage: 'HTML',
            code: '<iframe\n  src="https://example.com"\n  sandbox="allow-scripts"\n>\n</iframe>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Too many iframes can slow the page down and bring security risks, since the content comes from another origin.',
            secondParagraph: 'The sandbox attribute lets you restrict what the embedded content is allowed to do.',
            endParagraph: 'Use iframe only when embedding external content is really necessary.',
            highlight: ['iframe', 'sandbox'],
            codeLanguage: 'HTML',
            code: '<iframe\n  src="https://example.com"\n  sandbox="allow-scripts"\n>\n</iframe>',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'SVG e Canvas',
      en: 'SVG and Canvas'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'SVG permite representar gráficos vetoriais diretamente no documento HTML. Diferentemente de uma imagem comum, seus elementos podem ser manipulados individualmente.',
            endParagraph: 'SVG é especialmente útil para ícones, ilustrações e gráficos que precisam manter sua qualidade em diferentes tamanhos.',
            highlight: ['SVG', 'HTML'],
            codeLanguage: 'HTML',
            code: '<svg\n  width="120"\n  height="80"\n  viewBox="0 0 120 80"\n>\n  <circle\n    cx="40"\n    cy="40"\n    r="30"\n    fill="black"\n  />\n</svg>'
          },
          en: {
            firstParagraph: 'SVG lets you represent vector graphics directly in the HTML document. Unlike a regular image, its elements can be manipulated individually.',
            endParagraph: 'SVG is especially useful for icons, illustrations and graphics that need to keep their quality at different sizes.',
            highlight: ['SVG', 'HTML'],
            codeLanguage: 'HTML',
            code: '<svg\n  width="120"\n  height="80"\n  viewBox="0 0 120 80"\n>\n  <circle\n    cx="40"\n    cy="40"\n    r="30"\n    fill="black"\n  />\n</svg>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<canvas> fornece uma área de desenho que pode ser manipulada principalmente por JavaScript.',
            endParagraph: 'SVG descreve elementos vetoriais. Canvas fornece uma área de desenho controlada por código.',
            highlight: ['canvas', 'SVG', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<canvas\n  id="canvas"\n  width="200"\n  height="100"\n></canvas>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'const canvas =\n  document.querySelector("#canvas");\n\nconst ctx =\n  canvas.getContext("2d");\n\nctx.fillRect(20, 20, 80, 50);'
              }
            ],
            onlyCode: true
          },
          en: {
            firstParagraph: '<canvas> provides a drawing area that can be manipulated mainly through JavaScript.',
            endParagraph: 'SVG describes vector elements. Canvas provides a drawing area controlled by code.',
            highlight: ['canvas', 'SVG', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<canvas\n  id="canvas"\n  width="200"\n  height="100"\n></canvas>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'const canvas =\n  document.querySelector("#canvas");\n\nconst ctx =\n  canvas.getContext("2d");\n\nctx.fillRect(20, 20, 80, 50);'
              }
            ],
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Interatividade nativa',
      en: 'Native interactivity'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<details> cria uma seção que pode ser expandida ou recolhida. <summary> define o título que o usuário toca para abrir essa seção.',
            endParagraph: 'Esse recurso cria uma interface expansível usando só HTML, sem precisar implementar toda a interação manualmente com JavaScript.',
            highlight: ['details', 'summary', 'HTML', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<details>\n  <summary>\n    O que é HTML?\n  </summary>\n\n  <p>\n    HTML define a estrutura\n    de uma página web.\n  </p>\n</details>'
          },
          en: {
            firstParagraph: '<details> creates a section that can be expanded or collapsed. <summary> defines the title the user taps to open that section.',
            endParagraph: 'This feature builds an expandable interface using only HTML, without having to implement the whole interaction manually with JavaScript.',
            highlight: ['details', 'summary', 'HTML', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<details>\n  <summary>\n    What is HTML?\n  </summary>\n\n  <p>\n    HTML defines the structure\n    of a web page.\n  </p>\n</details>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O elemento <dialog> representa uma caixa de diálogo nativa do HTML.',
            endParagraph: 'Antes de implementar um componente complexo manualmente, vale verificar se o HTML já oferece um elemento nativo adequado — reduz código e costuma melhorar a acessibilidade.',
            highlight: ['dialog', 'HTML'],
            codeLanguage: 'HTML',
            code: '<dialog open>\n  <h2>Olá!</h2>\n  <p>Esta é uma caixa de diálogo.</p>\n\n  <button>Fechar</button>\n</dialog>'
          },
          en: {
            firstParagraph: 'The <dialog> element represents a native HTML dialog box.',
            endParagraph: 'Before building a complex component manually, it is worth checking whether HTML already offers a suitable native element — it reduces code and tends to improve accessibility.',
            highlight: ['dialog', 'HTML'],
            codeLanguage: 'HTML',
            code: '<dialog open>\n  <h2>Hello!</h2>\n  <p>This is a dialog box.</p>\n\n  <button>Close</button>\n</dialog>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Atributos globais',
      en: 'Global attributes'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Atributos globais podem ser usados em praticamente qualquer elemento HTML. hidden esconde um elemento completamente, como se ele não existisse na página.',
            endParagraph: 'hidden é diferente de só estilizar com CSS: o elemento realmente some da apresentação e da leitura por tecnologias assistivas.',
            highlight: ['hidden', 'HTML'],
            codeLanguage: 'HTML',
            code: '<p>Este texto aparece normalmente.</p>\n\n<p hidden>Este texto fica escondido.</p>'
          },
          en: {
            firstParagraph: 'Global attributes can be used on practically any HTML element. hidden hides an element completely, as if it did not exist on the page.',
            endParagraph: 'hidden is different from just styling with CSS: the element really disappears from the presentation and from assistive technology.',
            highlight: ['hidden', 'HTML'],
            codeLanguage: 'HTML',
            code: '<p>This text shows up normally.</p>\n\n<p hidden>This text stays hidden.</p>'
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'lang identifica o idioma do conteúdo, e dir identifica a direção do texto — da esquerda para a direita ou o contrário.',
            endParagraph: 'Esses atributos ajudam navegadores e leitores de tela a apresentar o conteúdo corretamente.',
            highlight: ['lang', 'dir'],
            codeLanguage: 'HTML',
            code: '<p lang="en">\n  This paragraph is in English.\n</p>\n\n<p dir="rtl">\n  نص باللغة العربية\n</p>'
          },
          en: {
            firstParagraph: 'lang identifies the language of the content, and dir identifies the text direction — left-to-right or the other way around.',
            endParagraph: 'These attributes help browsers and screen readers present the content correctly.',
            highlight: ['lang', 'dir'],
            codeLanguage: 'HTML',
            code: '<p lang="pt">\n  Este parágrafo está em português.\n</p>\n\n<p dir="rtl">\n  نص باللغة العربية\n</p>'
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Dados personalizados',
      en: 'Custom data'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Atributos data-* permitem associar informações personalizadas a elementos HTML sem criar atributos próprios.',
            endParagraph: 'Esses dados podem ser utilizados posteriormente por JavaScript ou outras ferramentas que processem o documento.',
            highlight: ['HTML', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<button\n  data-product-id="42"\n  data-category="books"\n>\n  Comprar\n</button>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'data-* attributes let you attach custom information to HTML elements without creating attributes of your own.',
            endParagraph: 'That data can later be used by JavaScript or other tools that process the document.',
            highlight: ['HTML', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<button\n  data-product-id="42"\n  data-category="books"\n>\n  Buy\n</button>',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript pode acessar esses atributos por meio da propriedade dataset.',
            endParagraph: 'data-* é útil quando precisamos associar pequenas informações personalizadas a elementos da página.',
            highlight: ['JavaScript', 'dataset'],
            codeLanguage: 'JavaScript',
            code: 'const botao =\n  document.querySelector("button");\n\nconsole.log(\n  botao.dataset.productId\n);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript can access those attributes through the dataset property.',
            endParagraph: 'data-* is useful whenever we need to attach small pieces of custom information to elements on the page.',
            highlight: ['JavaScript', 'dataset'],
            codeLanguage: 'JavaScript',
            code: 'const button =\n  document.querySelector("button");\n\nconsole.log(\n  button.dataset.productId\n);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Conteúdo e interação',
      en: 'Content and interaction'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'contenteditable permite que o usuário edite o conteúdo de um elemento diretamente na página. draggable indica que um elemento pode ser arrastado.',
            endParagraph: 'Esses atributos criam comportamentos interativos sem precisar de JavaScript para o comportamento básico.',
            highlight: ['contenteditable', 'draggable'],
            codeLanguage: 'HTML',
            code: '<p contenteditable="true">\n  Clique e edite este texto.\n</p>\n\n<div draggable="true">\n  Arraste este elemento.\n</div>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'contenteditable lets the user edit the content of an element directly on the page. draggable marks an element as something that can be dragged.',
            endParagraph: 'These attributes create interactive behavior without needing JavaScript for the basic behavior.',
            highlight: ['contenteditable', 'draggable'],
            codeLanguage: 'HTML',
            code: '<p contenteditable="true">\n  Tap and edit this text.\n</p>\n\n<div draggable="true">\n  Drag this element.\n</div>',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '<template> guarda um trecho de HTML que não é exibido diretamente. Esse conteúdo só aparece quando é clonado e inserido na página, geralmente por JavaScript.',
            endParagraph: 'template é útil para preparar pedaços de HTML reutilizáveis sem precisar montá-los inteiramente via código.',
            highlight: ['template', 'HTML', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<template id="cartao">\n  <li>Novo item</li>\n</template>',
            onlyCode: true
          },
          en: {
            firstParagraph: '<template> holds a piece of HTML that is not displayed directly. That content only shows up once it is cloned and inserted into the page, usually by JavaScript.',
            endParagraph: 'template is useful for preparing reusable pieces of HTML without having to assemble them entirely through code.',
            highlight: ['template', 'HTML', 'JavaScript'],
            codeLanguage: 'HTML',
            code: '<template id="cartao">\n  <li>Novo item</li>\n</template>',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Navegação por teclado',
      en: 'Keyboard navigation'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Nem todo mundo usa mouse ou toque. Uma interface acessível precisa funcionar também pelo teclado, navegando entre elementos com Tab.',
            secondParagraph: 'Elementos como links, botões e campos de formulário já recebem foco pelo teclado automaticamente.',
            endParagraph: 'Um elemento genérico como div ou span não recebe foco pelo teclado, a menos que isso seja adicionado manualmente.',
            highlight: ['Tab', 'div', 'span'],
            codeLanguage: 'HTML',
            code: '<button>Comprar</button>\n<a href="/perfil">Perfil</a>\n<input type="text" />',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Not everyone uses a mouse or touch. An accessible interface also needs to work by keyboard, moving between elements with Tab.',
            secondParagraph: 'Elements like links, buttons and form fields already receive keyboard focus automatically.',
            endParagraph: 'A generic element like div or span does not receive keyboard focus, unless that is added manually.',
            highlight: ['Tab', 'div', 'span'],
            codeLanguage: 'HTML',
            code: '<button>Buy</button>\n<a href="/profile">Profile</a>\n<input type="text" />',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O atributo tabindex controla se e quando um elemento entra na navegação por teclado.',
            endParagraph: 'tabindex="0" adiciona um elemento à ordem natural de navegação. Valores maiores que zero raramente são uma boa ideia, porque bagunçam essa ordem.',
            highlight: ['tabindex'],
            codeLanguage: 'HTML',
            code: '<div tabindex="0">\n  Este div agora recebe foco.\n</div>\n\n<button tabindex="-1">\n  Este botão foi removido da navegação.\n</button>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The tabindex attribute controls whether and when an element enters keyboard navigation.',
            endParagraph: 'tabindex="0" adds an element to the natural navigation order. Values greater than zero are rarely a good idea, because they mess up that order.',
            highlight: ['tabindex'],
            codeLanguage: 'HTML',
            code: '<div tabindex="0">\n  This div now receives focus.\n</div>\n\n<button tabindex="-1">\n  This button was removed from navigation.\n</button>',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Landmarks e formulários',
      en: 'Landmarks and forms'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Elementos como header, nav e main não organizam só visualmente — eles funcionam como landmarks, pontos de navegação rápida para quem usa leitor de tela.',
            endParagraph: 'Um leitor de tela pode pular direto para o main, por exemplo, sem precisar passar por todo o cabeçalho.',
            highlight: ['header', 'nav', 'main'],
            codeLanguage: 'HTML',
            code: '<header>...</header>\n<nav>...</nav>\n<main>...</main>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Elements like header, nav and main are not only visual organization — they work as landmarks, quick navigation points for someone using a screen reader.',
            endParagraph: 'A screen reader can jump straight to main, for example, without going through the whole header first.',
            highlight: ['header', 'nav', 'main'],
            codeLanguage: 'HTML',
            code: '<header>...</header>\n<nav>...</nav>\n<main>...</main>',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um formulário acessível associa corretamente cada label ao seu campo, usando for e id.',
            endParagraph: 'Essa associação permite que tecnologias assistivas anunciem o propósito de cada campo corretamente.',
            highlight: ['label', 'id'],
            codeLanguage: 'HTML',
            code: '<label for="email">E-mail</label>\n<input id="email" type="email" />',
            onlyCode: true
          },
          en: {
            firstParagraph: 'An accessible form correctly links each label to its field, using for and id.',
            endParagraph: 'That link lets assistive technology announce the purpose of each field correctly.',
            highlight: ['label', 'id'],
            codeLanguage: 'HTML',
            code: '<label for="email">Email</label>\n<input id="email" type="email" />',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'ARIA',
      en: 'ARIA'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'ARIA fornece atributos que ajudam tecnologias assistivas a compreenderem interfaces que não podem ser descritas adequadamente apenas com HTML semântico.',
            endParagraph: 'ARIA é uma ferramenta complementar. A primeira escolha deve ser sempre utilizar o elemento HTML semântico apropriado.',
            highlight: ['ARIA', 'HTML'],
            codeLanguage: 'HTML',
            code: '<button\n  aria-label="Fechar janela"\n>\n  ×\n</button>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'ARIA provides attributes that help assistive technologies understand interfaces that cannot be adequately described with semantic HTML alone.',
            endParagraph: 'ARIA is a complementary tool. The first choice should always be to use the appropriate semantic HTML element.',
            highlight: ['ARIA', 'HTML'],
            codeLanguage: 'HTML',
            code: '<button\n  aria-label="Close window"\n>\n  ×\n</button>',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Não devemos substituir elementos HTML nativos por elementos genéricos com ARIA quando o HTML já possui uma solução adequada.',
            endParagraph: 'Acessibilidade começa com uma estrutura HTML correta. ARIA deve complementar essa estrutura, não substituí-la.',
            highlight: ['HTML', 'ARIA'],
            codeLanguage: 'HTML',
            code: '<!-- Preferível -->\n<button>\n  Salvar\n</button>\n\n<!-- Evite quando não há necessidade -->\n<div role="button">\n  Salvar\n</div>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We should not replace native HTML elements with generic elements plus ARIA when HTML already has an adequate solution.',
            endParagraph: 'Accessibility starts with a correct HTML structure. ARIA should complement that structure, not replace it.',
            highlight: ['HTML', 'ARIA'],
            codeLanguage: 'HTML',
            code: '<!-- Preferable -->\n<button>\n  Save\n</button>\n\n<!-- Avoid when there is no need -->\n<div role="button">\n  Save\n</div>',
            onlyCode: true
          }
        }
      }
    ]
  }
]

// --- CSS Avançado: trechos de código ---










































export const CSS_ADVANCED_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'Media queries',
      en: 'Media queries'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Media queries permitem aplicar regras CSS apenas quando certas condições são atendidas, como a largura da tela.',
            endParagraph: 'Elas são a base para criar interfaces que se adaptam a diferentes tamanhos de tela.',
            highlight: ['media queries', 'CSS'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 100%;\n}\n\n@media (min-width: 768px) {\n  .card {\n    width: 50%;\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Media queries let you apply CSS rules only when certain conditions are met, like the width of the screen.',
            endParagraph: 'They are the foundation for building interfaces that adapt to different screen sizes.',
            highlight: ['media queries', 'CSS'],
            codeLanguage: 'CSS',
            code: '.card {\n  width: 100%;\n}\n\n@media (min-width: 768px) {\n  .card {\n    width: 50%;\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Mobile-first e breakpoints',
      en: 'Mobile-first and breakpoints'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'No desenvolvimento mobile-first, começamos criando a interface para telas menores e adicionamos ajustes para telas maiores.',
            endParagraph: 'A abordagem mobile-first começa com uma experiência simples e amplia o layout conforme existe mais espaço disponível.',
            highlight: ['mobile-first'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n  flex-direction: column;\n}\n\n@media (min-width: 768px) {\n  .container {\n    flex-direction: row;\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'In mobile-first development, we start by building the interface for smaller screens and add adjustments for larger screens.',
            endParagraph: 'The mobile-first approach starts with a simple experience and expands the layout as more space becomes available.',
            highlight: ['mobile-first'],
            codeLanguage: 'CSS',
            code: '.container {\n  display: flex;\n  flex-direction: column;\n}\n\n@media (min-width: 768px) {\n  .container {\n    flex-direction: row;\n  }\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Breakpoints são os pontos em que o layout muda de comportamento. Projetos costumam definir alguns breakpoints padrão, como celular, tablet e desktop.',
            endParagraph: 'Não é preciso um breakpoint para cada tamanho possível — só para os pontos em que o layout realmente precisa mudar.',
            highlight: ['breakpoints'],
            codeLanguage: 'CSS',
            code: '@media (min-width: 480px) {\n  /* tablet pequeno */\n}\n\n@media (min-width: 768px) {\n  /* tablet */\n}\n\n@media (min-width: 1024px) {\n  /* desktop */\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Breakpoints are the points where the layout changes behavior. Projects usually define a few standard breakpoints, like phone, tablet and desktop.',
            endParagraph: 'You do not need a breakpoint for every possible size — only for the points where the layout really needs to change.',
            highlight: ['breakpoints'],
            codeLanguage: 'CSS',
            code: '@media (min-width: 480px) {\n  /* tablet pequeno */\n}\n\n@media (min-width: 768px) {\n  /* tablet */\n}\n\n@media (min-width: 1024px) {\n  /* desktop */\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tipografia responsiva',
      en: 'Responsive typography'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'clamp() define um valor com um mínimo, um valor preferido e um máximo. É útil para texto que precisa acompanhar o tamanho da tela sem ficar pequeno ou gigante demais.',
            endParagraph: 'O texto cresce com a tela, mas nunca passa dos limites definidos em clamp().',
            highlight: ['clamp'],
            codeLanguage: 'CSS',
            code: 'h1 {\n  font-size: clamp(2rem, 5vw, 4rem);\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>Título</h1>'
              }
            ]
          },
          en: {
            firstParagraph: 'clamp() sets a value with a minimum, a preferred value and a maximum. It is useful for text that needs to follow the screen size without becoming too small or too huge.',
            endParagraph: 'The text grows with the screen, but never crosses the limits defined in clamp().',
            highlight: ['clamp'],
            codeLanguage: 'CSS',
            code: 'h1 {\n  font-size: clamp(2rem, 5vw, 4rem);\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<h1>Title</h1>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Transições',
      en: 'Transitions'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'transition permite suavizar a mudança entre dois estados de uma propriedade CSS.',
            endParagraph: 'Transições são úteis para tornar mudanças de estado mais naturais sem precisar criar uma animação completa.',
            highlight: ['transition', 'CSS'],
            codeLanguage: 'CSS',
            code: '.button {\n  transition:\n    transform 0.2s;\n}\n\n.button:hover {\n  transform: scale(1.05);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'transition lets you smooth the change between two states of a CSS property.',
            endParagraph: 'Transitions are useful for making state changes feel more natural without having to build a full animation.',
            highlight: ['transition', 'CSS'],
            codeLanguage: 'CSS',
            code: '.button {\n  transition:\n    transform 0.2s;\n}\n\n.button:hover {\n  transform: scale(1.05);\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Transformações',
      en: 'Transforms'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A propriedade transform permite mover, girar, aumentar ou inclinar elementos visualmente.',
            endParagraph: 'Transformações alteram a apresentação visual do elemento sem modificar sua posição original no fluxo do documento.',
            highlight: ['transform'],
            codeLanguage: 'CSS',
            code: '.card:hover {\n  transform:\n    translateY(-4px)\n    scale(1.02);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The transform property lets you move, rotate, scale or skew elements visually.',
            endParagraph: 'Transforms change how the element looks without changing its original position in the flow of the document.',
            highlight: ['transform'],
            codeLanguage: 'CSS',
            code: '.card:hover {\n  transform:\n    translateY(-4px)\n    scale(1.02);\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos combinar diferentes valores em transform para criar efeitos visuais variados.',
            endParagraph: 'Transformações simples podem produzir interfaces mais interativas quando usadas com moderação.',
            highlight: ['transform'],
            codeLanguage: 'CSS',
            code: '.icon:hover {\n  transform:\n    rotate(10deg)\n    scale(1.1);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can combine different values in transform to create varied visual effects.',
            endParagraph: 'Simple transforms can make interfaces feel more interactive when used with restraint.',
            highlight: ['transform'],
            codeLanguage: 'CSS',
            code: '.icon:hover {\n  transform:\n    rotate(10deg)\n    scale(1.1);\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Keyframes',
      en: 'Keyframes'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: '@keyframes define os estados que uma animação deve percorrer ao longo do tempo.',
            endParagraph: 'Keyframes descrevem a evolução visual de um elemento entre diferentes estados.',
            highlight: ['keyframes'],
            codeLanguage: 'CSS',
            code: '@keyframes aparecer {\n  from {\n    opacity: 0;\n  }\n\n  to {\n    opacity: 1;\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: '@keyframes defines the states an animation should move through over time.',
            endParagraph: 'Keyframes describe how an element visually evolves between different states.',
            highlight: ['keyframes'],
            codeLanguage: 'CSS',
            code: '@keyframes appear {\n  from {\n    opacity: 0;\n  }\n\n  to {\n    opacity: 1;\n  }\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Depois de criar os keyframes, usamos animation para aplicar a animação a um elemento.',
            endParagraph: '@keyframes define o que acontece. animation define como essa sequência será aplicada.',
            highlight: ['keyframes', 'animation'],
            codeLanguage: 'CSS',
            code: '.card {\n  animation:\n    aparecer 0.5s ease;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Cartão</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'After creating the keyframes, we use animation to apply the animation to an element.',
            endParagraph: '@keyframes defines what happens. animation defines how that sequence gets applied.',
            highlight: ['keyframes', 'animation'],
            codeLanguage: 'CSS',
            code: '.card {\n  animation:\n    appear 0.5s ease;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">Card</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Construindo uma animação',
      en: 'Building an animation'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos combinar várias propriedades dentro do mesmo @keyframes. Aqui, opacity e transform mudam juntos.',
            endParagraph: 'Combinar propriedades cria animações mais ricas sem precisar de várias animações separadas.',
            highlight: ['keyframes', 'opacity', 'transform'],
            codeLanguage: 'CSS',
            code: '@keyframes entrar {\n  from {\n    opacity: 0;\n    transform: translateY(20px);\n  }\n\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can combine several properties inside the same @keyframes. Here, opacity and transform change together.',
            endParagraph: 'Combining properties creates richer animations without needing several separate animations.',
            highlight: ['keyframes', 'opacity', 'transform'],
            codeLanguage: 'CSS',
            code: '@keyframes enter {\n  from {\n    opacity: 0;\n    transform: translateY(20px);\n  }\n\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Depois de definir o @keyframes, aplicamos com animation, como em qualquer outra animação.',
            endParagraph: 'Uma boa animação geralmente combina poucas propriedades bem escolhidas, em vez de muitos efeitos ao mesmo tempo.',
            highlight: ['keyframes', 'animation'],
            codeLanguage: 'CSS',
            code: '.box {\n  animation:\n    entrar 0.6s ease;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="box">Caixa</div>'
              }
            ]
          },
          en: {
            firstParagraph: 'After defining the @keyframes, we apply it with animation, just like any other animation.',
            endParagraph: 'A good animation usually combines a few well-chosen properties, instead of many effects at once.',
            highlight: ['keyframes', 'animation'],
            codeLanguage: 'CSS',
            code: '.box {\n  animation:\n    enter 0.6s ease;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="box">Box</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Funções CSS',
      en: 'CSS functions'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'calc() permite combinar diferentes unidades em um único cálculo, como porcentagem com pixels.',
            endParagraph: 'calc() é útil quando um valor fixo precisa conviver com um valor relativo na mesma conta.',
            highlight: ['calc'],
            codeLanguage: 'CSS',
            code: '.sidebar {\n  width: calc(100% - 240px);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'calc() lets you combine different units in a single calculation, like a percentage with pixels.',
            endParagraph: 'calc() is useful when a fixed value needs to coexist with a relative value in the same calculation.',
            highlight: ['calc'],
            codeLanguage: 'CSS',
            code: '.sidebar {\n  width: calc(100% - 240px);\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'min() escolhe o menor entre os valores informados, e max() escolhe o maior. clamp() combina os dois com um valor preferido no meio.',
            endParagraph: 'Essas funções deixam o CSS reagir ao contexto sem precisar de uma media query para cada caso.',
            highlight: ['min', 'max', 'clamp'],
            codeLanguage: 'CSS',
            code: '.box {\n  width: min(90%, 400px);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'min() picks the smallest of the given values, and max() picks the largest. clamp() combines both with a preferred value in the middle.',
            endParagraph: 'These functions let CSS react to context without needing a media query for every case.',
            highlight: ['min', 'max', 'clamp'],
            codeLanguage: 'CSS',
            code: '.box {\n  width: min(90%, 400px);\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Seletores modernos',
      en: 'Modern selectors'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Alguns seletores modernos ajudam a escrever CSS mais direto. :not() seleciona elementos que não correspondem a um seletor. :is() e :where() agrupam vários seletores em um só, evitando repetição.',
            endParagraph: 'A diferença entre :is() e :where() é sutil: :where() nunca aumenta a especificidade do seletor.',
            highlight: ['seletor', 'CSS'],
            codeLanguage: 'CSS',
            code: 'p:not(.destaque) {\n  color: gray;\n}\n\n:is(h1, h2, h3) {\n  font-weight: bold;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p>Um parágrafo comum.</p>\n<p class="destaque">Um parágrafo em destaque.</p>\n<h2>Um subtítulo</h2>'
              }
            ]
          },
          en: {
            firstParagraph: 'A few modern selectors help write more direct CSS. :not() selects elements that do not match a selector. :is() and :where() group several selectors into one, avoiding repetition.',
            endParagraph: 'The difference between :is() and :where() is subtle: :where() never adds to the specificity of the selector.',
            highlight: ['selector', 'CSS'],
            codeLanguage: 'CSS',
            code: 'p:not(.destaque) {\n  color: gray;\n}\n\n:is(h1, h2, h3) {\n  font-weight: bold;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p>A regular paragraph.</p>\n<p class="destaque">A highlighted paragraph.</p>\n<h2>A subtitle</h2>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: ':has() permite selecionar um elemento com base no que existe dentro dele — algo que o CSS não conseguia fazer antes.',
            endParagraph: 'Esse seletor abre espaço para estilizar um componente de forma condicional, sem precisar de JavaScript.',
            highlight: ['CSS', 'JavaScript'],
            codeLanguage: 'CSS',
            code: '.card:has(img) {\n  border: 1px solid gray;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <img src="foto.jpg" />\n</div>\n\n<div class="card">\n  Sem imagem\n</div>'
              }
            ]
          },
          en: {
            firstParagraph: ':has() lets you select an element based on what exists inside it — something CSS could not do before.',
            endParagraph: 'This selector opens the door to styling a component conditionally, without needing JavaScript.',
            highlight: ['CSS', 'JavaScript'],
            codeLanguage: 'CSS',
            code: '.card:has(img) {\n  border: 1px solid gray;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="card">\n  <img src="photo.jpg" />\n</div>\n\n<div class="card">\n  No image\n</div>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Como o CSS decide',
      en: 'How CSS decides'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando duas regras CSS competem pelo mesmo elemento, o navegador segue critérios para decidir qual vale — isso é a cascata.',
            secondParagraph: 'Entre regras com a mesma especificidade, a que aparece por último no CSS vence.',
            endParagraph: 'Nesse exemplo, o parágrafo fica azul, porque essa regra aparece depois.',
            highlight: ['cascata', 'CSS'],
            codeLanguage: 'CSS',
            code: 'p {\n  color: black;\n}\n\np {\n  color: blue;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p>Texto</p>'
              }
            ]
          },
          en: {
            firstParagraph: 'When two CSS rules compete for the same element, the browser follows criteria to decide which one wins — that is the cascade.',
            secondParagraph: 'Between rules with the same specificity, the one that appears last in the CSS wins.',
            endParagraph: 'In this example, the paragraph turns blue, because that rule appears later.',
            highlight: ['cascade', 'CSS'],
            codeLanguage: 'CSS',
            code: 'p {\n  color: black;\n}\n\np {\n  color: blue;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p>Text</p>'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Especificidade e herança',
      en: 'Specificity and inheritance'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Especificidade é o peso que o navegador dá a cada seletor. Um id pesa mais que uma classe, e uma classe pesa mais que uma tag.',
            endParagraph: 'Mesmo que a regra da tag venha depois, a classe vence porque tem mais especificidade.',
            highlight: ['especificidade'],
            codeLanguage: 'CSS',
            code: 'p {\n  color: black;\n}\n\n.destaque {\n  color: blue;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p class="destaque">Texto</p>'
              }
            ]
          },
          en: {
            firstParagraph: 'Specificity is the weight the browser gives to each selector. An id weighs more than a class, and a class weighs more than a tag.',
            endParagraph: 'Even though the tag rule comes later, the class wins because it has more specificity.',
            highlight: ['specificity'],
            codeLanguage: 'CSS',
            code: 'p {\n  color: black;\n}\n\n.destaque {\n  color: blue;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<p class="destaque">Text</p>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Algumas propriedades, como color e font-family, são herdadas pelos elementos filhos automaticamente.',
            secondParagraph: '!important ignora a especificidade normal e deve ser usado com cautela — costuma dificultar a manutenção do CSS.',
            endParagraph: 'Prefira ajustar a especificidade da regra a recorrer a !important.',
            highlight: ['herdadas', 'important'],
            codeLanguage: 'CSS',
            code: '.container {\n  color: blue !important;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Some properties, like color and font-family, are inherited by child elements automatically.',
            secondParagraph: '!important ignores normal specificity and should be used with caution — it tends to make CSS harder to maintain.',
            endParagraph: 'Prefer adjusting the specificity of the rule over reaching for !important.',
            highlight: ['inherited', 'important'],
            codeLanguage: 'CSS',
            code: '.container {\n  color: blue !important;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Container queries',
      en: 'Container queries'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Media queries reagem ao tamanho da tela inteira. Container queries reagem ao tamanho do elemento pai, não importa o tamanho da tela.',
            endParagraph: 'Isso é útil para um componente que precisa se adaptar dependendo de onde é usado, não só do tamanho da tela.',
            highlight: ['container queries', 'media queries'],
            codeLanguage: 'CSS',
            code: '.card-container {\n  container-type: inline-size;\n}\n\n@container (min-width: 300px) {\n  .card {\n    display: flex;\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Media queries react to the size of the whole screen. Container queries react to the size of the parent element, no matter the screen size.',
            endParagraph: 'This is useful for a component that needs to adapt depending on where it is used, not just the screen size.',
            highlight: ['container queries', 'media queries'],
            codeLanguage: 'CSS',
            code: '.card-container {\n  container-type: inline-size;\n}\n\n@container (min-width: 300px) {\n  .card {\n    display: flex;\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Controle de proporções e imagens',
      en: 'Controlling proportions and images'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'aspect-ratio define a proporção entre largura e altura de um elemento, sem precisar calcular a altura manualmente.',
            endParagraph: 'A altura se ajusta automaticamente para manter a proporção, mesmo que a largura mude.',
            highlight: ['aspect-ratio'],
            codeLanguage: 'CSS',
            code: '.thumb {\n  width: 200px;\n  aspect-ratio: 16 / 9;\n  background: gray;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="thumb"></div>'
              }
            ]
          },
          en: {
            firstParagraph: 'aspect-ratio sets the proportion between the width and the height of an element, without manually calculating the height.',
            endParagraph: 'The height adjusts automatically to keep the proportion, even if the width changes.',
            highlight: ['aspect-ratio'],
            codeLanguage: 'CSS',
            code: '.thumb {\n  width: 200px;\n  aspect-ratio: 16 / 9;\n  background: gray;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="thumb"></div>'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'object-fit controla como uma imagem preenche a caixa quando a proporção da imagem não é igual à da caixa.',
            endParagraph: 'cover preenche o espaço cortando o excesso; contain encaixa a imagem inteira, podendo deixar espaço vazio.',
            highlight: ['object-fit', 'cover', 'contain'],
            codeLanguage: 'CSS',
            code: 'img {\n  width: 200px;\n  height: 120px;\n  object-fit: cover;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'object-fit controls how an image fills the box when the proportion of the image does not match the proportion of the box.',
            endParagraph: 'cover fills the space by cropping the excess; contain fits the whole image, which can leave empty space.',
            highlight: ['object-fit', 'cover', 'contain'],
            codeLanguage: 'CSS',
            code: 'img {\n  width: 200px;\n  height: 120px;\n  object-fit: cover;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Experiência visual',
      en: 'Visual experience'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'scroll-behavior: smooth transforma uma rolagem brusca em uma rolagem suave ao navegar para uma âncora da página.',
            secondParagraph: 'accent-color muda a cor de controles nativos, como checkbox e radio, sem precisar recriar o componente do zero.',
            endParagraph: 'São ajustes pequenos que aproveitam comportamento e componentes que o navegador já oferece.',
            highlight: ['scroll-behavior', 'accent-color'],
            codeLanguage: 'CSS',
            code: 'html {\n  scroll-behavior: smooth;\n}\n\ninput[type="checkbox"] {\n  accent-color: blue;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'scroll-behavior: smooth turns an abrupt jump into a smooth scroll when navigating to an anchor on the page.',
            secondParagraph: 'accent-color changes the color of native controls, like checkbox and radio, without having to rebuild the component from scratch.',
            endParagraph: 'These are small adjustments that take advantage of behavior and components the browser already offers.',
            highlight: ['scroll-behavior', 'accent-color'],
            codeLanguage: 'CSS',
            code: 'html {\n  scroll-behavior: smooth;\n}\n\ninput[type="checkbox"] {\n  accent-color: blue;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'backdrop-filter aplica um efeito visual, como desfoque, no conteúdo que fica atrás de um elemento — útil para painéis semitransparentes.',
            endParagraph: 'O suporte a backdrop-filter varia entre navegadores, então vale sempre ter um visual razoável mesmo sem esse efeito.',
            highlight: ['backdrop-filter'],
            codeLanguage: 'CSS',
            code: '.painel {\n  background: rgba(255, 255, 255, 0.5);\n  backdrop-filter: blur(8px);\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'backdrop-filter applies a visual effect, like blur, to the content behind an element — useful for semi-transparent panels.',
            endParagraph: 'Support for backdrop-filter varies between browsers, so it is worth always having a reasonable look even without that effect.',
            highlight: ['backdrop-filter'],
            codeLanguage: 'CSS',
            code: '.painel {\n  background: rgba(255, 255, 255, 0.5);\n  backdrop-filter: blur(8px);\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Foco',
      en: 'Focus'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando um elemento recebe foco pelo teclado, o navegador desenha um contorno ao redor dele por padrão — o anel de foco.',
            secondParagraph: 'Remover esse contorno com outline: none sem colocar nada no lugar deixa quem navega pelo teclado sem saber onde está.',
            endParagraph: 'Se for personalizar o visual do foco, troque o outline por outro indicador visível, nunca remova sem substituir.',
            highlight: ['foco', 'outline'],
            codeLanguage: 'CSS',
            code: '/* Evite isto sem um substituto */\nbutton:focus {\n  outline: none;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When an element receives keyboard focus, the browser draws an outline around it by default — the focus ring.',
            secondParagraph: 'Removing that outline with outline: none without putting anything in its place leaves someone navigating by keyboard without knowing where they are.',
            endParagraph: 'If you want to customize the look of focus, swap the outline for another visible indicator — never remove it without replacing it.',
            highlight: ['focus', 'outline'],
            codeLanguage: 'CSS',
            code: '/* Evite isto sem um substituto */\nbutton:focus {\n  outline: none;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Preferências do usuário',
      en: 'User preferences'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Algumas pessoas preferem reduzir movimentos na interface. CSS oferece a media query prefers-reduced-motion para respeitar essa preferência.',
            endParagraph: 'Uma interface avançada também precisa considerar acessibilidade. Animações devem melhorar a experiência, não prejudicá-la.',
            highlight: ['prefers-reduced-motion', 'CSS'],
            codeLanguage: 'CSS',
            code: '@media (prefers-reduced-motion: reduce) {\n  * {\n    animation: none;\n    transition: none;\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Some people prefer to reduce motion in the interface. CSS offers a specific media query, prefers-reduced-motion, to respect that preference.',
            endParagraph: 'An advanced interface also needs to consider accessibility. Animations should improve the experience, not harm it.',
            highlight: ['prefers-reduced-motion', 'CSS'],
            codeLanguage: 'CSS',
            code: '@media (prefers-reduced-motion: reduce) {\n  * {\n    animation: none;\n    transition: none;\n  }\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'prefers-color-scheme detecta se o usuário prefere um tema claro ou escuro no sistema, permitindo que o CSS reaja a essa preferência.',
            endParagraph: 'Assim, a interface já nasce no tema que a pessoa já escolheu no sistema, sem precisar de um botão extra.',
            highlight: ['prefers-color-scheme'],
            codeLanguage: 'CSS',
            code: 'body {\n  background: white;\n  color: black;\n}\n\n@media (prefers-color-scheme: dark) {\n  body {\n    background: black;\n    color: white;\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'prefers-color-scheme detects whether the user prefers a light or dark theme at the system level, letting CSS react to that preference.',
            endParagraph: 'That way, the interface already starts in the theme the person already chose at the system level, without needing an extra toggle.',
            highlight: ['prefers-color-scheme'],
            codeLanguage: 'CSS',
            code: 'body {\n  background: white;\n  color: black;\n}\n\n@media (prefers-color-scheme: dark) {\n  body {\n    background: black;\n    color: white;\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Contraste e teclado',
      en: 'Contrast and keyboard'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Contraste suficiente entre texto e fundo, foco visível e navegação por teclado formam a base da acessibilidade em CSS.',
            endParagraph: 'Esses três pontos resolvem boa parte dos problemas de acessibilidade sem exigir uma auditoria completa de WCAG.',
            highlight: ['contraste', 'WCAG'],
            codeLanguage: 'CSS',
            code: '/* Bom contraste: texto escuro em fundo claro */\n.texto {\n  color: #222;\n  background: #fff;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Enough contrast between text and background, visible focus and keyboard navigation form the basis of accessibility in CSS.',
            endParagraph: 'These three points solve most accessibility problems without requiring a full WCAG audit.',
            highlight: ['contrast', 'WCAG'],
            codeLanguage: 'CSS',
            code: '/* Bom contraste: texto escuro em fundo claro */\n.texto {\n  color: #222;\n  background: #fff;\n}',
            onlyCode: true
          }
        }
      }
    ]
  }
]

// --- JavaScript/TypeScript Avançado: trechos de código ---
// A maioria das telas é `onlyCode: true` (a aba "Web" não executa
// TypeScript, e boa parte destes conceitos não tem um efeito visual
// natural). Algumas telas de JavaScript puro (Closures, Event delegation,
// Debounce e throttle, Microtasks e macrotasks) viram demonstrações
// interativas de verdade (botão + DOM), já que a aba "Web" executa
// JavaScript de verdade — ver `app/CLAUDE.md`.


// Interativo: toque no botão várias vezes — o total sobe a cada toque,
// porque a função retornada continua acessando o mesmo `total` via closure.







// Interativo, "preveja antes de rodar": nada executa até tocar no botão, e
// a ordem real só aparece no painel de console da aba "Web".




// Interativo: toque em qualquer item (inclusive num item novo, criado
// depois) para ver o único listener do pai capturando o clique.

// Interativo: toque várias vezes seguidas — "Cliques" sobe a cada toque,
// "Debounced" só sobe uma vez, 500ms depois do último toque.











// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).
























export const JS_ADVANCED_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'Escopo e cadeia de escopos',
      en: 'Scope and the scope chain'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Toda variável existe dentro de um escopo. Quando o JavaScript não encontra uma variável no escopo atual, ele procura no escopo de fora, e assim por diante — isso é a scope chain.',
            endParagraph: 'A busca sempre vai de dentro para fora, nunca o contrário — uma função externa não enxerga variáveis criadas dentro de uma função interna.',
            highlight: ['scope chain', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const nome = "Ana";\n\nfunction saudacao() {\n  console.log(nome);\n}\n\nsaudacao();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Every variable exists inside a scope. When JavaScript cannot find a variable in the current scope, it looks in the scope outside it, and so on — that is the scope chain.',
            endParagraph: 'The search always goes from inside out, never the other way around — an outer function cannot see variables created inside an inner function.',
            highlight: ['scope chain', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const name = "Ana";\n\nfunction greet() {\n  console.log(name);\n}\n\ngreet();',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Closures',
      en: 'Closures'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma closure acontece quando uma função guarda acesso ao escopo em que foi criada, mesmo depois que esse escopo já terminou de executar.',
            endParagraph: 'Toque no botão várias vezes: o número sobe a cada toque, porque a função retornada continua acessando o mesmo total, mesmo que criarContador já tenha terminado.',
            highlight: ['closure'],
            codeLanguage: 'HTML',
            code: '<button id="botao-contar">\n  Contar\n</button>\n\n<p id="total">\n  Total: 0\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function criarContador() {\n  let total = 0;\n\n  return function () {\n    total++;\n    return total;\n  };\n}\n\nconst contar = criarContador();\n\ndocument\n  .querySelector("#botao-contar")\n  .addEventListener("click", () => {\n    document.querySelector("#total").textContent = "Total: " + contar();\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'A closure happens when a function keeps access to the scope it was created in, even after that scope has already finished running.',
            endParagraph: 'Tap the button several times: the number goes up on every tap, because the returned function keeps accessing the same total, even though createCounter has already finished.',
            highlight: ['closure'],
            codeLanguage: 'HTML',
            code: '<button id="count-button">\n  Count\n</button>\n\n<p id="total">\n  Total: 0\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function createCounter() {\n  let total = 0;\n\n  return function () {\n    total++;\n    return total;\n  };\n}\n\nconst count = createCounter();\n\ndocument\n  .querySelector("#count-button")\n  .addEventListener("click", () => {\n    document.querySelector("#total").textContent = "Total: " + count();\n  });'
              }
            ]
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Cada chamada da função externa cria um escopo novo. Por isso, duas closures criadas a partir da mesma função não compartilham estado.',
            secondParagraph: 'No exemplo, contadorA e contadorB têm cada um o seu próprio total, mesmo tendo vindo da mesma função.',
            endParagraph: 'Esse isolamento é o que permite usar closures para guardar dados privados, acessíveis apenas pelas funções que a closure devolve.',
            highlight: ['closure', 'closures'],
            codeLanguage: 'JavaScript',
            code: 'const contadorA = criarContador();\nconst contadorB = criarContador();\n\nconsole.log(contadorA()); // 1\nconsole.log(contadorA()); // 2\nconsole.log(contadorB()); // 1',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Each call to the outer function creates a new scope. That is why two closures created from the same function do not share state.',
            secondParagraph: 'In the example, counterA and counterB each have their own total, even though they came from the same function.',
            endParagraph: 'This isolation is what lets closures hold private data, reachable only through the functions the closure returns.',
            highlight: ['closure', 'closures'],
            codeLanguage: 'JavaScript',
            code: 'const counterA = createCounter();\nconst counterB = createCounter();\n\nconsole.log(counterA()); // 1\nconsole.log(counterA()); // 2\nconsole.log(counterB()); // 1',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Hoisting e execução',
      en: 'Hoisting and execution'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Antes de executar o código, o JavaScript prepara o escopo e já reserva espaço para as declarações — isso é o hoisting.',
            endParagraph: 'var é içada e inicializada como undefined. let e const também são içadas, mas não podem ser usadas antes da linha em que são declaradas.',
            highlight: ['hoisting', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'console.log(nome); // undefined\nvar nome = "Ana";\n\nconsole.log(idade); // erro\nlet idade = 20;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Before running the code, JavaScript prepares the scope and already reserves space for declarations — that is hoisting.',
            endParagraph: 'var is hoisted and initialized as undefined. let and const are also hoisted, but cannot be used before the line where they are declared.',
            highlight: ['hoisting', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'console.log(name); // undefined\nvar name = "Ana";\n\nconsole.log(age); // error\nlet age = 20;',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'O que é this',
      en: 'What this is'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O valor de this depende do contexto em que a função foi chamada, não de onde ela foi escrita.',
            endParagraph: 'Aqui, this é usuario, porque a função foi chamada como um método de usuario.',
            highlight: ['contexto'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = {\n  nome: "Ana",\n  saudar() {\n    console.log(this.nome);\n  }\n};\n\nusuario.saudar(); // "Ana"',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The value of this depends on the context the function was called in, not on where it was written.',
            endParagraph: 'Here, this is user, because the function was called as a method of user.',
            highlight: ['context'],
            codeLanguage: 'JavaScript',
            code: 'const user = {\n  name: "Ana",\n  greet() {\n    console.log(this.name);\n  }\n};\n\nuser.greet(); // "Ana"',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Como this depende de como a função é chamada, a mesma função pode ter um this diferente a cada chamada.',
            secondParagraph: 'Ao guardar o método numa variável e chamá-lo solto, ele deixa de ser chamado a partir de usuario — e this deixa de apontar para ele.',
            endParagraph: 'É por isso que se diz que this é definido no momento da chamada, e não no momento em que a função é escrita.',
            highlight: ['this'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = {\n  nome: "Ana",\n  saudar() {\n    console.log(this.nome);\n  }\n};\n\nusuario.saudar(); // "Ana"\n\nconst solta = usuario.saudar;\nsolta(); // undefined',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Because this depends on how the function is called, the same function can have a different this on each call.',
            secondParagraph: 'Storing the method in a variable and calling it on its own means it is no longer called from usuario — and this stops pointing to it.',
            endParagraph: 'That is why this is said to be decided at call time, not when the function is written.',
            highlight: ['this'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = {\n  nome: "Ana",\n  saudar() {\n    console.log(this.nome);\n  }\n};\n\nusuario.saudar(); // "Ana"\n\nconst loose = usuario.saudar;\nloose(); // undefined',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Arrow functions e this',
      en: 'Arrow functions and this'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Arrow functions não têm seu próprio this — elas usam o this do escopo onde foram criadas.',
            endParagraph: 'Por isso, arrow functions não são uma boa escolha para métodos de objeto que dependem de this.',
            highlight: ['arrow functions'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = {\n  nome: "Ana",\n  saudar: () => {\n    console.log(this.nome); // undefined\n  }\n};\n\nusuario.saudar();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Arrow functions do not have their own this — they use the this from the scope where they were created.',
            endParagraph: 'That is why arrow functions are not a good choice for object methods that depend on this.',
            highlight: ['arrow functions'],
            codeLanguage: 'JavaScript',
            code: 'const user = {\n  name: "Ana",\n  greet: () => {\n    console.log(this.name); // undefined\n  }\n};\n\nuser.greet();',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O mesmo comportamento que atrapalha em métodos é justamente o que ajuda dentro deles.',
            secondParagraph: 'No exemplo, a arrow function dentro do map herda o this do método listar, então this.nome continua acessível.',
            endParagraph: 'A regra prática é curta: arrow function como método de objeto, não; arrow function dentro de um método, sim.',
            highlight: ['arrow function', 'this', 'map'],
            codeLanguage: 'JavaScript',
            code: 'const time = {\n  nome: "Equipe",\n  membros: ["Ana", "Bruno"],\n  listar() {\n    return this.membros.map((m) => m + " faz parte de " + this.nome);\n  }\n};\n\nconsole.log(time.listar());',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The same behaviour that gets in the way on methods is exactly what helps inside them.',
            secondParagraph: 'In the example, the arrow function inside map inherits this from the listar method, so this.nome stays reachable.',
            endParagraph: 'The rule of thumb is short: arrow function as an object method, no; arrow function inside a method, yes.',
            highlight: ['arrow function', 'this', 'map'],
            codeLanguage: 'JavaScript',
            code: 'const time = {\n  nome: "Team",\n  membros: ["Ana", "Bruno"],\n  listar() {\n    return this.membros.map((m) => m + " belongs to " + this.nome);\n  }\n};\n\nconsole.log(time.listar());',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Prototypes',
      en: 'Prototypes'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Todo objeto em JavaScript tem um prototype — um outro objeto de onde ele pode herdar propriedades e métodos.',
            endParagraph: 'Quando uma propriedade não existe no próprio objeto, o JavaScript procura no prototype — essa busca é a prototype chain.',
            highlight: ['prototype', 'prototype chain', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const animal = {\n  emitirSom() {\n    console.log("Som genérico");\n  }\n};\n\nconst cachorro = Object.create(animal);\ncachorro.emitirSom(); // "Som genérico"',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Every object in JavaScript has a prototype — another object it can inherit properties and methods from.',
            endParagraph: 'When a property does not exist on the object itself, JavaScript looks in the prototype — that search is the prototype chain.',
            highlight: ['prototype', 'prototype chain', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const animal = {\n  makeSound() {\n    console.log("Generic sound");\n  }\n};\n\nconst dog = Object.create(animal);\ndog.makeSound(); // "Generic sound"',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A busca pela prototype chain não é infinita: ela termina quando chega a null.',
            secondParagraph: 'No exemplo, cachorro não tem emitirSom, então o JavaScript sobe para animal. Se também não encontrasse lá, continuaria subindo até o fim da cadeia.',
            endParagraph: 'Quando a busca chega ao fim sem encontrar a propriedade, o resultado é undefined — e não um erro.',
            highlight: ['prototype chain', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const animal = {\n  emitirSom() {\n    console.log("Som genérico");\n  }\n};\n\nconst cachorro = Object.create(animal);\n\ncachorro.emitirSom(); // encontrado em animal\nconsole.log(cachorro.cor); // undefined\nconsole.log(Object.getPrototypeOf(cachorro) === animal); // true',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The lookup along the prototype chain is not endless: it stops when it reaches null.',
            secondParagraph: 'In the example, cachorro has no emitirSom, so JavaScript moves up to animal. If it were not there either, the lookup would keep climbing to the end of the chain.',
            endParagraph: 'When the lookup reaches the end without finding the property, the result is undefined — not an error.',
            highlight: ['prototype chain', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const animal = {\n  emitirSom() {\n    console.log("Generic sound");\n  }\n};\n\nconst cachorro = Object.create(animal);\n\ncachorro.emitirSom(); // found on animal\nconsole.log(cachorro.cor); // undefined\nconsole.log(Object.getPrototypeOf(cachorro) === animal); // true',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Classes e herança',
      en: 'Classes and inheritance'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'class oferece uma sintaxe mais familiar para trabalhar com o mesmo sistema de prototypes por trás dos panos.',
            endParagraph: 'extends cria herança entre classes, e o método na classe filha sobrescreve o da classe pai.',
            highlight: ['class', 'extends', 'prototypes'],
            codeLanguage: 'JavaScript',
            code: 'class Animal {\n  emitirSom() {\n    console.log("Som genérico");\n  }\n}\n\nclass Cachorro extends Animal {\n  emitirSom() {\n    console.log("Au au!");\n  }\n}\n\nnew Cachorro().emitirSom();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'class offers a more familiar syntax for working with the same prototype system behind the scenes.',
            endParagraph: 'extends creates inheritance between classes, and the method in the child class overrides the one in the parent class.',
            highlight: ['class', 'extends', 'prototype'],
            codeLanguage: 'JavaScript',
            code: 'class Animal {\n  makeSound() {\n    console.log("Generic sound");\n  }\n}\n\nclass Dog extends Animal {\n  makeSound() {\n    console.log("Woof!");\n  }\n}\n\nnew Dog().makeSound();',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Dentro de uma classe filha, super chama o comportamento da classe pai.',
            secondParagraph: 'Isso permite estender o que o pai faz, em vez de substituir por completo. No exemplo, o cachorro emite o som genérico e depois o seu próprio.',
            endParagraph: 'Apesar da sintaxe diferente, tudo isso continua usando prototypes por baixo: class é uma forma mais legível de escrever a mesma coisa.',
            highlight: ['super', 'class', 'prototypes'],
            codeLanguage: 'JavaScript',
            code: 'class Animal {\n  emitirSom() {\n    console.log("Som genérico");\n  }\n}\n\nclass Cachorro extends Animal {\n  emitirSom() {\n    super.emitirSom();\n    console.log("Au au");\n  }\n}\n\nnew Cachorro().emitirSom();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Inside a child class, super calls the behaviour of the parent class.',
            secondParagraph: 'That lets you extend what the parent does instead of replacing it entirely. In the example, the dog makes the generic sound and then its own.',
            endParagraph: 'Despite the different syntax, all of this still runs on prototypes underneath: class is a more readable way to write the same thing.',
            highlight: ['super', 'class', 'prototypes'],
            codeLanguage: 'JavaScript',
            code: 'class Animal {\n  emitirSom() {\n    console.log("Generic sound");\n  }\n}\n\nclass Cachorro extends Animal {\n  emitirSom() {\n    super.emitirSom();\n    console.log("Woof");\n  }\n}\n\nnew Cachorro().emitirSom();',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Call stack e Event Loop',
      en: 'Call stack and Event Loop'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A call stack guarda as funções que estão sendo executadas, uma em cima da outra. Quando uma função termina, ela sai do topo da pilha.',
            endParagraph: 'O event loop é quem verifica, constantemente, se a call stack está vazia para poder executar o que está esperando, como código assíncrono.',
            highlight: ['call stack', 'event loop'],
            codeLanguage: 'JavaScript',
            code: 'function um() {\n  console.log("um");\n}\n\nfunction dois() {\n  um();\n  console.log("dois");\n}\n\ndois();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The call stack holds the functions currently running, one on top of the other. When a function finishes, it comes off the top of the stack.',
            endParagraph: 'The event loop is what constantly checks whether the call stack is empty, so it can run what is waiting, like asynchronous code.',
            highlight: ['call stack', 'event loop'],
            codeLanguage: 'JavaScript',
            code: 'function one() {\n  console.log("one");\n}\n\nfunction two() {\n  one();\n  console.log("two");\n}\n\ntwo();',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Microtasks e macrotasks',
      en: 'Microtasks and macrotasks'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Promises resolvidas entram numa fila de microtasks. setTimeout entra numa fila de macrotasks. As duas filas só rodam depois que a call stack esvazia.',
            secondParagraph: 'Antes de tocar no botão, tente prever em que ordem os números vão aparecer no console abaixo.',
            endParagraph: 'Microtasks sempre rodam antes das macrotasks, mesmo quando o setTimeout usa 0 milissegundos — por isso a ordem real é 1, 4, 3, 2.',
            highlight: ['microtasks', 'macrotasks', 'call stack'],
            codeLanguage: 'HTML',
            code: '<button id="botao-executar">\n  Executar\n</button>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'document\n  .querySelector("#botao-executar")\n  .addEventListener("click", () => {\n    console.log("1");\n\n    setTimeout(() => console.log("2"), 0);\n\n    Promise.resolve().then(() => console.log("3"));\n\n    console.log("4");\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'Resolved Promises go into a microtask queue. setTimeout goes into a macrotask queue. Both queues only run after the call stack is empty.',
            secondParagraph: 'Before tapping the button, try to predict what order the numbers will show up in the console below.',
            endParagraph: 'Microtasks always run before macrotasks, even when setTimeout uses 0 milliseconds — that is why the real order is 1, 4, 3, 2.',
            highlight: ['microtasks', 'macrotasks', 'call stack'],
            codeLanguage: 'HTML',
            code: '<button id="run-button">\n  Run\n</button>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'document\n  .querySelector("#run-button")\n  .addEventListener("click", () => {\n    console.log("1");\n\n    setTimeout(() => console.log("2"), 0);\n\n    Promise.resolve().then(() => console.log("3"));\n\n    console.log("4");\n  });'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Como Promises entram nesse fluxo',
      en: 'How Promises fit into this flow'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando uma Promise é resolvida, seu .then() não executa na hora — ele entra na fila de microtasks e espera a call stack ficar livre.',
            endParagraph: 'Por isso o texto síncrono aparece antes do resultado da Promise, mesmo que ela já esteja resolvida.',
            highlight: ['Promise', 'microtasks'],
            codeLanguage: 'JavaScript',
            code: 'Promise.resolve("ok").then((valor) => {\n  console.log(valor);\n});\n\nconsole.log("Executado primeiro");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When a Promise is resolved, its .then() does not run right away — it goes into the microtask queue and waits for the call stack to be free.',
            endParagraph: 'That is why the synchronous text shows up before the Promise result, even though it is already resolved.',
            highlight: ['Promise', 'microtask'],
            codeLanguage: 'JavaScript',
            code: 'Promise.resolve("ok").then((value) => {\n  console.log(value);\n});\n\nconsole.log("Runs first");',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Valor e referência',
      en: 'Value and reference'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tipos primitivos, como number e string, são copiados por valor. Objetos e arrays são copiados por referência.',
            endParagraph: 'Mudar obj2 também muda obj1, porque as duas variáveis apontam para o mesmo objeto na memória.',
            highlight: ['valor', 'referência'],
            codeLanguage: 'JavaScript',
            code: 'let a = 10;\nlet b = a;\nb = 20;\nconsole.log(a); // 10\n\nconst obj1 = { total: 10 };\nconst obj2 = obj1;\nobj2.total = 20;\nconsole.log(obj1.total); // 20',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Primitive types, like number and string, are copied by value. Objects and arrays are copied by reference.',
            endParagraph: 'Changing obj2 also changes obj1, because both variables point to the same object in memory.',
            highlight: ['value', 'reference'],
            codeLanguage: 'JavaScript',
            code: 'let a = 10;\nlet b = a;\nb = 20;\nconsole.log(a); // 10\n\nconst obj1 = { total: 10 };\nconst obj2 = obj1;\nobj2.total = 20;\nconsole.log(obj1.total); // 20',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A mesma regra vale quando passamos valores para uma função.',
            secondParagraph: 'Um primitivo chega como cópia, então alterá-lo dentro da função não afeta o original. Um objeto chega como referência, então alterá-lo afeta quem o passou.',
            endParagraph: 'Esse é um dos motivos mais comuns de um valor parecer mudar sozinho em outro ponto do código.',
            highlight: ['referência'],
            codeLanguage: 'JavaScript',
            code: 'function dobrar(numero) {\n  numero = numero * 2;\n}\n\nfunction encarecer(produto) {\n  produto.preco = produto.preco * 2;\n}\n\nlet preco = 10;\nconst produto = { preco: 10 };\n\ndobrar(preco);\nencarecer(produto);\n\nconsole.log(preco); // 10\nconsole.log(produto.preco); // 20',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The same rule applies when we pass values into a function.',
            secondParagraph: 'A primitive arrives as a copy, so changing it inside the function does not affect the original. An object arrives as a reference, so changing it affects whoever passed it.',
            endParagraph: 'This is one of the most common reasons a value seems to change on its own somewhere else in the code.',
            highlight: ['reference'],
            codeLanguage: 'JavaScript',
            code: 'function dobrar(numero) {\n  numero = numero * 2;\n}\n\nfunction encarecer(produto) {\n  produto.preco = produto.preco * 2;\n}\n\nlet preco = 10;\nconst produto = { preco: 10 };\n\ndobrar(preco);\nencarecer(produto);\n\nconsole.log(preco); // 10\nconsole.log(produto.preco); // 20',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Cópias',
      en: 'Copies'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma shallow copy duplica só o primeiro nível de um objeto. Propriedades que são, elas mesmas, objetos continuam compartilhadas.',
            endParagraph: 'Para copiar todos os níveis de verdade, é preciso uma deep copy, como structuredClone().',
            highlight: ['shallow copy', 'deep copy'],
            codeLanguage: 'JavaScript',
            code: 'const original = {\n  nome: "Ana",\n  endereco: { cidade: "SP" }\n};\n\nconst copia = { ...original };\ncopia.endereco.cidade = "RJ";\n\nconsole.log(original.endereco.cidade); // "RJ"',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A shallow copy duplicates only the first level of an object. Properties that are themselves objects stay shared.',
            endParagraph: 'To copy every level for real, you need a deep copy, like structuredClone().',
            highlight: ['shallow copy', 'deep copy'],
            codeLanguage: 'JavaScript',
            code: 'const original = {\n  name: "Ana",\n  address: { city: "SP" }\n};\n\nconst copy = { ...original };\ncopy.address.city = "RJ";\n\nconsole.log(original.address.city); // "RJ"',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O risco da shallow copy aparece quando alteramos um nível mais profundo.',
            secondParagraph: 'No exemplo, mudar a cidade da cópia também muda a do original, porque o objeto endereco é o mesmo nos dois.',
            endParagraph: 'Já com structuredClone, todos os níveis são duplicados, e as alterações ficam isoladas de verdade.',
            highlight: ['shallow copy', 'structuredClone'],
            codeLanguage: 'JavaScript',
            code: 'const original = { nome: "Ana", endereco: { cidade: "SP" } };\n\nconst rasa = { ...original };\nrasa.endereco.cidade = "RJ";\nconsole.log(original.endereco.cidade); // "RJ"\n\nconst profunda = structuredClone(original);\nprofunda.endereco.cidade = "MG";\nconsole.log(original.endereco.cidade); // "RJ"',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The risk of a shallow copy shows up when we change a deeper level.',
            secondParagraph: 'In the example, changing the city on the copy also changes it on the original, because the endereco object is the same in both.',
            endParagraph: 'With structuredClone, every level is duplicated, and the changes are truly isolated.',
            highlight: ['shallow copy', 'structuredClone'],
            codeLanguage: 'JavaScript',
            code: 'const original = { nome: "Ana", endereco: { cidade: "SP" } };\n\nconst shallow = { ...original };\nshallow.endereco.cidade = "RJ";\nconsole.log(original.endereco.cidade); // "RJ"\n\nconst deep = structuredClone(original);\ndeep.endereco.cidade = "MG";\nconsole.log(original.endereco.cidade); // "RJ"',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Imutabilidade',
      en: 'Immutability'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tratar um valor como imutável significa nunca alterá-lo no lugar: em vez disso, cria-se um valor novo com a mudança aplicada.',
            secondParagraph: 'No exemplo, push altera o array original e afeta quem mais o estiver usando. Já o spread produz um array novo, e o original continua intacto.',
            endParagraph: 'Não é uma regra da linguagem, e sim uma disciplina de escrita — o JavaScript permite os dois caminhos.',
            highlight: ['imutável', 'push', 'spread'],
            codeLanguage: 'JavaScript',
            code: 'const original = [1, 2, 3];\n\n// Mutação: altera o array original\noriginal.push(4);\n\n// Imutabilidade: cria um array novo\nconst novo = [...original, 5];',
            onlyCode: true,
            noTerminal: true
          },
          en: {
            firstParagraph: 'Treating a value as immutable means never changing it in place: instead, you create a new value with the change applied.',
            secondParagraph: 'In the example, push changes the original array and affects anyone else using it. The spread produces a new array, and the original stays intact.',
            endParagraph: 'This is not a rule of the language but a writing discipline — JavaScript allows both paths.',
            highlight: ['immutable', 'push', 'spread'],
            codeLanguage: 'JavaScript',
            code: 'const original = [1, 2, 3];\n\n// Mutation: changes the original array\noriginal.push(4);\n\n// Immutability: creates a new array\nconst novo = [...original, 5];',
            onlyCode: true,
            noTerminal: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A vantagem da imutabilidade aparece quando um valor é compartilhado por várias partes do código.',
            secondParagraph: 'Se ninguém altera o objeto no lugar, comparar o antes e o depois basta para saber que algo mudou — não é preciso vasculhar cada propriedade.',
            endParagraph: 'É por isso que bibliotecas de interface, como o React, pedem que o estado seja tratado de forma imutável: elas usam essa comparação para decidir o que precisa ser atualizado na tela.',
            highlight: ['imutabilidade', 'imutável', 'React'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = { nome: "Ana", idade: 30 };\n\n// Mutação: o objeto continua sendo o mesmo\nusuario.idade = 31;\n\n// Imutabilidade: um objeto novo, fácil de comparar\nconst atualizado = { ...usuario, idade: 31 };\n\nconsole.log(usuario === atualizado); // false',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The advantage of immutability shows up when a value is shared by several parts of the code.',
            secondParagraph: 'If nobody changes the object in place, comparing before and after is enough to know something changed — there is no need to inspect every property.',
            endParagraph: 'That is why interface libraries such as React ask for state to be treated immutably: they use that comparison to decide what needs updating on screen.',
            highlight: ['immutability', 'immutably', 'React'],
            codeLanguage: 'JavaScript',
            code: 'const usuario = { nome: "Ana", idade: 30 };\n\n// Mutation: it is still the same object\nusuario.idade = 31;\n\n// Immutability: a new object, easy to compare\nconst atualizado = { ...usuario, idade: 31 };\n\nconsole.log(usuario === atualizado); // false',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Event delegation',
      en: 'Event delegation'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Em vez de adicionar um listener em cada item de uma lista, podemos adicionar um único listener no elemento pai.',
            secondParagraph: 'Toque em qualquer item da lista para ver o listener único capturando o clique.',
            endParagraph: 'Agora toque em "Adicionar item" e depois toque no item novo: o mesmo listener funciona nele também, mesmo tendo sido criado depois — é isso que economiza um listener por item.',
            highlight: ['event delegation', 'listener'],
            codeLanguage: 'HTML',
            code: '<ul id="lista">\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n\n<button id="botao-adicionar">\n  Adicionar item\n</button>\n\n<p id="saida">\n  Toque em um item\n</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: 'li {\n  padding: 8px;\n  border-bottom: 1px solid #ccc;\n}'
              },
              {
                codeLanguage: 'JavaScript',
                code: 'let contador = 3;\n\ndocument\n  .querySelector("#lista")\n  .addEventListener("click", (evento) => {\n    if (evento.target.tagName === "LI") {\n      document.querySelector("#saida").textContent =\n        "Você tocou em: " + evento.target.textContent;\n    }\n  });\n\ndocument\n  .querySelector("#botao-adicionar")\n  .addEventListener("click", () => {\n    contador++;\n\n    const item = document.createElement("li");\n    item.textContent = "Item " + contador;\n\n    document.querySelector("#lista").appendChild(item);\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'Instead of adding a listener to every item in a list, we can add a single listener to the parent element.',
            secondParagraph: 'Tap any item in the list to see the single listener capturing the click.',
            endParagraph: 'Now tap "Add item" and then tap the new item: the same listener works on it too, even though it was created afterward — that is exactly what saves a listener per item.',
            highlight: ['event delegation', 'listener'],
            codeLanguage: 'HTML',
            code: '<ul id="list">\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n\n<button id="add-button">\n  Add item\n</button>\n\n<p id="output">\n  Tap an item\n</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: 'li {\n  padding: 8px;\n  border-bottom: 1px solid #ccc;\n}'
              },
              {
                codeLanguage: 'JavaScript',
                code: 'let counter = 3;\n\ndocument\n  .querySelector("#list")\n  .addEventListener("click", (event) => {\n    if (event.target.tagName === "LI") {\n      document.querySelector("#output").textContent =\n        "You tapped: " + event.target.textContent;\n    }\n  });\n\ndocument\n  .querySelector("#add-button")\n  .addEventListener("click", () => {\n    counter++;\n\n    const item = document.createElement("li");\n    item.textContent = "Item " + counter;\n\n    document.querySelector("#list").appendChild(item);\n  });'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Debounce e throttle',
      en: 'Debounce and throttle'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'debounce espera o usuário parar de disparar um evento antes de executar a função. throttle executa a função no máximo uma vez a cada intervalo.',
            secondParagraph: 'Toque várias vezes seguidas no botão abaixo: "Cliques" sobe a cada toque, mas "Debounced" só sobe uma vez, 500ms depois do seu último toque.',
            endParagraph: 'debounce é comum em campos de busca; throttle é comum em eventos de scroll, que disparam com muita frequência.',
            highlight: ['debounce', 'throttle'],
            codeLanguage: 'HTML',
            code: '<button id="botao-teste">\n  Toque várias vezes rápido\n</button>\n\n<p id="saida">\n  Cliques: 0 | Debounced: 0\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function debounce(fn, atraso) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), atraso);\n  };\n}\n\nlet cliques = 0;\nlet chamadasDebounced = 0;\n\nfunction atualizarTexto() {\n  document.querySelector("#saida").textContent =\n    "Cliques: " + cliques + " | Debounced: " + chamadasDebounced;\n}\n\nconst registrarClique = debounce(() => {\n  chamadasDebounced++;\n  atualizarTexto();\n}, 500);\n\ndocument\n  .querySelector("#botao-teste")\n  .addEventListener("click", () => {\n    cliques++;\n    atualizarTexto();\n    registrarClique();\n  });'
              }
            ]
          },
          en: {
            firstParagraph: 'debounce waits for the user to stop triggering an event before running the function. throttle runs the function at most once per interval.',
            secondParagraph: 'Tap the button below several times in a row: "Clicks" goes up on every tap, but "Debounced" only goes up once, 500ms after your last tap.',
            endParagraph: 'debounce is common in search fields; throttle is common in scroll events, which fire very frequently.',
            highlight: ['debounce', 'throttle'],
            codeLanguage: 'HTML',
            code: '<button id="test-button">\n  Tap fast, several times\n</button>\n\n<p id="output">\n  Clicks: 0 | Debounced: 0\n</p>',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: 'function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\n\nlet clicks = 0;\nlet debouncedCalls = 0;\n\nfunction updateText() {\n  document.querySelector("#output").textContent =\n    "Clicks: " + clicks + " | Debounced: " + debouncedCalls;\n}\n\nconst registerClick = debounce(() => {\n  debouncedCalls++;\n  updateText();\n}, 500);\n\ndocument\n  .querySelector("#test-button")\n  .addEventListener("click", () => {\n    clicks++;\n    updateText();\n    registerClick();\n  });'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Fechando o JavaScript avançado',
      en: 'Wrapping up advanced JavaScript'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Até aqui você olhou para dentro da linguagem: como o JavaScript decide onde uma variável existe, como ele resolve this, como objetos herdam uns dos outros e em que ordem o código realmente executa.',
            secondParagraph: 'Escopo, closures, prototypes e event loop não são assuntos separados. Juntos, eles explicam por que um trecho de código se comporta de um jeito que às vezes parece inesperado.',
            endParagraph: 'Esses conceitos costumam ficar escondidos no dia a dia e aparecem justamente quando algo dá errado — é aí que entender o funcionamento por baixo faz diferença.',
            highlight: ['JavaScript', 'this', 'closures', 'prototypes', 'event loop'],
            codeLanguage: 'JavaScript',
            code: 'Promise.resolve().then(() => console.log("2 - microtask"));\n\nsetTimeout(() => console.log("3 - macrotask"), 0);\n\nconsole.log("1 - agora");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'So far you have looked inside the language: how JavaScript decides where a variable exists, how it resolves this, how objects inherit from one another, and in what order the code actually runs.',
            secondParagraph: 'Scope, closures, prototypes and the event loop are not separate subjects. Together they explain why a piece of code behaves in a way that sometimes looks unexpected.',
            endParagraph: 'These concepts usually stay hidden day to day and show up exactly when something goes wrong — that is when understanding the machinery underneath pays off.',
            highlight: ['JavaScript', 'this', 'closures', 'prototypes', 'event loop'],
            codeLanguage: 'JavaScript',
            code: 'Promise.resolve().then(() => console.log("2 - microtask"));\n\nsetTimeout(() => console.log("3 - macrotask"), 0);\n\nconsole.log("1 - now");',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A partir da próxima lição o foco muda: em vez de olhar mais fundo para o JavaScript, você vai conhecer o TypeScript.',
            secondParagraph: 'TypeScript não substitui o que você aprendeu. Ele é uma camada de tipos sobre esse mesmo JavaScript, e todo código escrito até aqui continua válido.',
            endParagraph: 'O objetivo não é dominar a ferramenta, e sim reconhecer o TypeScript em projetos reais e entender o que os tipos estão comunicando.',
            highlight: ['JavaScript', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: '// JavaScript\nfunction somar(a, b) {\n  return a + b;\n}\n\n// TypeScript: a mesma ideia, com tipos\nfunction somarTipado(a: number, b: number): number {\n  return a + b;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'From the next lesson on, the focus shifts: instead of looking deeper into JavaScript, you will get to know TypeScript.',
            secondParagraph: 'TypeScript does not replace what you have learned. It is a layer of types over that same JavaScript, and every piece of code written so far is still valid.',
            endParagraph: 'The goal is not to master the tool, but to recognize TypeScript in real projects and understand what the types are communicating.',
            highlight: ['JavaScript', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: '// JavaScript\nfunction somar(a, b) {\n  return a + b;\n}\n\n// TypeScript: the same idea, with types\nfunction somarTipado(a: number, b: number): number {\n  return a + b;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Por que TypeScript?',
      en: 'Why TypeScript?'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript é flexível, mas essa flexibilidade pode dificultar a manutenção de aplicações maiores. TypeScript adiciona recursos de tipagem ao desenvolvimento JavaScript para ajudar a detectar determinados problemas antes da execução.',
            endParagraph: 'Esse tipo de erro só apareceria em tempo de execução no JavaScript puro — o TypeScript aponta antes.',
            highlight: ['TypeScript', 'JavaScript'],
            codeLanguage: 'TypeScript',
            code: 'function somar(a: number, b: number) {\n  return a + b;\n}\n\nsomar(2, "3"); // erro detectado antes de rodar',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript is flexible, but that flexibility can make larger applications harder to maintain. TypeScript adds typing features to JavaScript development to help catch certain problems before the code even runs.',
            endParagraph: 'This kind of error would only show up at runtime in plain JavaScript — TypeScript points it out beforehand.',
            highlight: ['TypeScript', 'JavaScript'],
            codeLanguage: 'TypeScript',
            code: 'function add(a: number, b: number) {\n  return a + b;\n}\n\nadd(2, "3"); // error caught before it runs',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'JavaScript e TypeScript',
      en: 'JavaScript and TypeScript'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'TypeScript é um superset de JavaScript: todo código JavaScript válido também é código TypeScript válido.',
            secondParagraph: 'O código TypeScript é convertido (transpilado) em JavaScript comum antes de rodar.',
            endParagraph: 'Depois da transpilação, o resultado é só JavaScript — sem tipos, sem interfaces, sem nada que só existe em tempo de desenvolvimento.',
            highlight: ['TypeScript', 'JavaScript', 'transpilado'],
            codeLanguage: 'TypeScript',
            code: 'let idade: number = 20;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'TypeScript is a superset of JavaScript: every valid JavaScript code is also valid TypeScript code.',
            secondParagraph: 'TypeScript code gets converted (transpiled) into plain JavaScript before it runs.',
            endParagraph: 'After transpilation, the result is just JavaScript — no types, no interfaces, nothing that only exists at development time.',
            highlight: ['TypeScript', 'JavaScript', 'transpiled'],
            codeLanguage: 'TypeScript',
            code: 'let age: number = 20;',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Navegadores sabem executar JavaScript, não TypeScript diretamente. Por isso o TypeScript precisa ser transpilado antes de chegar ao navegador.',
            endParagraph: 'Ferramentas de build costumam fazer essa transpilação automaticamente, então o processo geralmente é invisível no dia a dia.',
            highlight: ['JavaScript', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'let idade: number = 20;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Browsers know how to run JavaScript, not TypeScript directly. That is why TypeScript needs to be transpiled before it reaches the browser.',
            endParagraph: 'Build tools usually do this transpilation automatically, so the process is normally invisible day to day.',
            highlight: ['JavaScript', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'let age: number = 20;',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tipos e inferência',
      en: 'Types and inference'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'TypeScript consegue inferir o tipo de uma variável a partir do valor atribuído, sem precisar de uma anotação explícita.',
            endParagraph: 'Anotações explícitas são úteis quando o valor inicial não deixa claro qual tipo se pretende usar.',
            highlight: ['inferir', 'anotação', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'let nome = "Ana"; // inferido como string\nlet idade = 20; // inferido como number\n\nlet cidade: string = "São Paulo"; // anotação explícita',
            onlyCode: true
          },
          en: {
            firstParagraph: 'TypeScript can infer the type of a variable from the assigned value, without needing an explicit annotation.',
            endParagraph: 'Explicit annotations are useful when the initial value does not make it clear which type is intended.',
            highlight: ['infer', 'annotation', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'let name = "Ana"; // inferred as string\nlet age = 20; // inferred as number\n\nlet city: string = "São Paulo"; // explicit annotation',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tipos de objetos',
      en: 'Object types'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'interface e type descrevem a estrutura esperada de um objeto.',
            endParagraph: 'As duas formas resolvem o mesmo problema; a diferença prática entre elas aparece mais adiante, na lição sobre type vs interface.',
            highlight: ['interface', 'type'],
            codeLanguage: 'TypeScript',
            code: 'interface Usuario {\n  nome: string;\n  idade: number;\n}\n\ntype Produto = {\n  nome: string;\n  preco: number;\n};',
            onlyCode: true
          },
          en: {
            firstParagraph: 'interface and type describe the expected structure of an object.',
            endParagraph: 'Both forms solve the same problem; the practical difference between them shows up later, in the type vs interface lesson.',
            highlight: ['interface', 'type'],
            codeLanguage: 'TypeScript',
            code: 'interface User {\n  name: string;\n  age: number;\n}\n\ntype Product = {\n  name: string;\n  price: number;\n};',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Union types',
      en: 'Union types'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um union type permite que uma variável aceite mais de um tipo possível.',
            endParagraph: 'Isso é útil quando um valor legitimamente pode vir em mais de um formato, como um id que às vezes é numérico e às vezes é um texto.',
            highlight: ['union type'],
            codeLanguage: 'TypeScript',
            code: 'let id: string | number;\n\nid = "abc123";\nid = 42;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A union type lets a variable accept more than one possible type.',
            endParagraph: 'This is useful when a value can legitimately come in more than one shape, like an id that is sometimes numeric and sometimes text.',
            highlight: ['union type'],
            codeLanguage: 'TypeScript',
            code: 'let id: string | number;\n\nid = "abc123";\nid = 42;',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Funções tipadas',
      en: 'Typed functions'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos tipar os parâmetros, o retorno e até objetos inteiros usados por uma função.',
            endParagraph: 'Com os tipos declarados, o TypeScript avisa se a função for chamada com argumentos errados ou se o retorno não bater com o esperado.',
            highlight: ['TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'function criar(\n  nome: string,\n  idade: number\n): { nome: string; idade: number } {\n  return { nome, idade };\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can type the parameters, the return value and even whole objects used by a function.',
            endParagraph: 'With the types declared, TypeScript warns if the function is called with the wrong arguments or if the return does not match what is expected.',
            highlight: ['TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'function create(\n  name: string,\n  age: number\n): { name: string; age: number } {\n  return { name, age };\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'any e unknown',
      en: 'any and unknown'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'any desliga a verificação de tipos para aquele valor — o TypeScript deixa de ajudar ali.',
            secondParagraph: 'unknown também aceita qualquer valor, mas exige uma verificação antes de deixar usá-lo, o que é mais seguro.',
            endParagraph: 'Prefira unknown a any sempre que o tipo ainda não for conhecido.',
            highlight: ['unknown', 'any', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'let valor: unknown = "texto";\n\nif (typeof valor === "string") {\n  console.log(valor.toUpperCase());\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'any turns off type checking for that value — TypeScript stops helping there.',
            secondParagraph: 'unknown also accepts any value, but requires a check before letting you use it, which is safer.',
            endParagraph: 'Prefer unknown over any whenever the type is not known yet.',
            highlight: ['unknown', 'any', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: 'let value: unknown = "text";\n\nif (typeof value === "string") {\n  console.log(value.toUpperCase());\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Generics',
      en: 'Generics'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'generics permitem criar funções e estruturas reutilizáveis sem perder informações sobre os tipos utilizados.',
            endParagraph: 'O mesmo código pode trabalhar com diferentes tipos mantendo informações sobre o tipo utilizado.',
            highlight: ['generics'],
            codeLanguage: 'TypeScript',
            code: 'function primeiro<T>(\n  itens: T[]\n): T {\n  return itens[0];\n}\n\nconst numero =\n  primeiro([1, 2, 3]);\n\nconst nome =\n  primeiro(["Ana", "João"]);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Generics let you create reusable functions and structures without losing information about the types used.',
            endParagraph: 'The same code can work with different types while keeping information about the type used.',
            highlight: ['generics'],
            codeLanguage: 'TypeScript',
            code: 'function first<T>(\n  items: T[]\n): T {\n  return items[0];\n}\n\nconst number =\n  first([1, 2, 3]);\n\nconst name =\n  first(["Ana", "John"]);',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um generic pode ser restringido para aceitar apenas tipos que tenham certas propriedades.',
            secondParagraph: 'Com extends, dizemos que T precisa ter pelo menos um campo nome. Assim a função continua genérica, mas o acesso a item.nome fica seguro.',
            endParagraph: 'Restringir generics é o que permite escrever código reutilizável sem abrir mão da verificação de tipos.',
            highlight: ['generic', 'generics', 'extends'],
            codeLanguage: 'TypeScript',
            code: 'interface ComNome {\n  nome: string;\n}\n\nfunction descrever<T extends ComNome>(item: T): string {\n  return "Nome: " + item.nome;\n}\n\ndescrever({ nome: "Ana", idade: 30 });',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A generic can be constrained so it only accepts types that have certain properties.',
            secondParagraph: 'With extends, we say that T must have at least a nome field. The function stays generic, but reading item.nome becomes safe.',
            endParagraph: 'Constraining generics is what lets you write reusable code without giving up type checking.',
            highlight: ['generic', 'generics', 'extends'],
            codeLanguage: 'TypeScript',
            code: 'interface ComNome {\n  nome: string;\n}\n\nfunction descrever<T extends ComNome>(item: T): string {\n  return "Name: " + item.nome;\n}\n\ndescrever({ nome: "Ana", idade: 30 });',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'type vs interface',
      en: 'type vs interface'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Na prática, interface e type resolvem o mesmo problema na maioria dos casos do dia a dia.',
            secondParagraph: 'Uma diferença real: interface pode ser estendida depois no mesmo nome (declaration merging), e type pode representar union types, o que interface não consegue.',
            endParagraph: 'Para objetos simples, a escolha costuma ser mais uma questão de convenção do time do que uma regra técnica rígida.',
            highlight: ['interface', 'type', 'union types'],
            codeLanguage: 'TypeScript',
            code: 'interface A {\n  nome: string;\n}\ninterface A {\n  idade: number;\n}\n// A agora tem nome e idade\n\ntype Status = "ativo" | "inativo";',
            onlyCode: true
          },
          en: {
            firstParagraph: 'In practice, interface and type solve the same problem in most everyday cases.',
            secondParagraph: 'One real difference: interface can be extended later under the same name (declaration merging), and type can represent union types, which interface cannot.',
            endParagraph: 'For simple objects, the choice is usually more a matter of team convention than a strict technical rule.',
            highlight: ['interface', 'type', 'union types'],
            codeLanguage: 'TypeScript',
            code: 'interface A {\n  name: string;\n}\ninterface A {\n  age: number;\n}\n// A now has name and age\n\ntype Status = "active" | "inactive";',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'tsconfig e transpilação',
      en: 'tsconfig and transpilation'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'tsconfig.json configura como o TypeScript deve transpilar o projeto: para qual versão de JavaScript, quais arquivos incluir, e quão rígidas são as checagens de tipo.',
            endParagraph: 'Não é preciso decorar todas as opções — o importante é saber que esse arquivo existe e é ele quem controla a transpilação.',
            highlight: ['tsconfig', 'transpilação', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: '{\n  "compilerOptions": {\n    "target": "es2022",\n    "strict": true\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'tsconfig.json configures how TypeScript should transpile the project: which JavaScript version to target, which files to include, and how strict the type checks are.',
            endParagraph: 'You don\'t need to memorize every option — what matters is knowing this file exists and is what controls the transpilation.',
            highlight: ['tsconfig', 'transpilation', 'TypeScript'],
            codeLanguage: 'TypeScript',
            code: '{\n  "compilerOptions": {\n    "target": "es2022",\n    "strict": true\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  }
]

// ============================================================
// Conteúdo curricular do quarto módulo de JavaScript ("Além do JavaScript:
// Node.js e Express"). Diferente dos módulos anteriores, este só existe para
// a área JavaScript por enquanto — HTML e CSS ainda não têm seu próprio "Além
// de" (React/Tailwind), então o 4º módulo delas continua com o nome genérico
// "Módulo 4" até ganharem conteúdo. Parte do princípio de que o aluno já
// concluiu HTML/CSS/JavaScript nos três níveis anteriores, incluindo
// TypeScript (ensinado no módulo Avançado de JavaScript) — **TypeScript não é
// reensinado aqui**: todo o código deste módulo é JavaScript puro, por
// pedido explícito da proposta curricular. Só a parte teórica está seedada;
// a atividade prática final ("API simples com Node.js e Express") fica para
// depois, por pedido explícito também.
//
// Assim como no módulo Avançado, todas as telas são `onlyCode: true` — a aba
// "Web" do `CodeSection` não executa JavaScript (só combina HTML+CSS
// estáticos), então não há como demonstrar de verdade um servidor Node.js ou
// uma rota Express rodando; forçar uma WebView aqui só mostraria uma página
// em branco, o que ensinaria errado.
//
// A proposta original tinha alguns blocos de código em bash (`npm install
// express`) e "diagramas" em texto puro (setas mostrando o fluxo cliente →
// servidor → cliente). Nenhum dos dois é uma linguagem aceita por
// `codeLanguage` (`'HTML' | 'CSS' | 'JavaScript' | 'TypeScript'`), e criar um
// tipo novo só para uma linha de comando e dois diagramas ASCII seria
// desproporcional. Em vez disso: o comando de instalação virou um comentário
// JavaScript válido (`// npm install express`), e os diagramas de fluxo
// viraram exemplos reais de código (ex.: um `fetch` de verdade para explicar
// requisição/resposta) — o mesmo conceito, mas dentro da arquitetura já
// existente, sem introduzir um tipo de conteúdo novo.

// --- Além do JavaScript: trechos de código ---





















export const JS_BEYOND_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'JavaScript fora do navegador',
      en: 'JavaScript outside the browser'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JavaScript é muito conhecido por executar código no navegador, mas a linguagem também pode ser executada em outros ambientes. Node.js permite utilizar JavaScript fora do navegador, inclusive para criar aplicações no servidor.',
            endParagraph: 'O código continua sendo JavaScript. O que mudou foi o ambiente em que ele está sendo executado.',
            highlight: ['JavaScript', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: 'console.log("Olá, Node.js!");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JavaScript is well known for running code in the browser, but the language can also run in other environments. Node.js lets you use JavaScript outside the browser, including to build server applications.',
            endParagraph: 'The code is still JavaScript. What changed was the environment it runs in.',
            highlight: ['JavaScript', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: 'console.log("Hello, Node.js!");',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Node.js é um runtime que permite executar JavaScript fora do navegador. Ele fornece recursos próprios para criar diferentes tipos de aplicações.',
            endParagraph: 'Com Node.js, JavaScript pode ser utilizado também em ferramentas, scripts e aplicações de servidor.',
            highlight: ['Node.js', 'runtime', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'console.log("Olá, Node.js!");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Node.js is a runtime that lets you run JavaScript outside the browser. It provides its own resources for building different kinds of applications.',
            endParagraph: 'With Node.js, JavaScript can also be used in tools, scripts and server applications.',
            highlight: ['Node.js', 'runtime', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'console.log("Hello, Node.js!");',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Runtime',
      en: 'Runtime'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'runtime é o ambiente responsável por executar um programa. O navegador fornece um ambiente JavaScript voltado para a web. Node.js fornece outro ambiente, com recursos próprios.',
            endParagraph: 'Por isso, JavaScript executado no navegador e JavaScript executado no Node.js podem ter APIs disponíveis diferentes.',
            highlight: ['runtime', 'Node.js', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: '// No navegador\nwindow.location.href;\n\n// No Node.js\nprocess.env;',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A runtime is the environment responsible for running a program. The browser provides a JavaScript environment aimed at the web. Node.js provides another environment, with its own resources.',
            endParagraph: 'That is why JavaScript running in the browser and JavaScript running in Node.js can have different APIs available.',
            highlight: ['runtime', 'Node.js', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: '// In the browser\nwindow.location.href;\n\n// In Node.js\nprocess.env;',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Browser vs Node.js',
      en: 'Browser vs Node.js'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A linguagem continua sendo JavaScript, mas cada ambiente oferece recursos diferentes.',
            endParagraph: 'document pertence às APIs do navegador. Já console está disponível também no ambiente Node.js.',
            highlight: ['document', 'console', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// Navegador\ndocument.querySelector("button");\n\n// Node.js\nconsole.log("Executando no servidor");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The language is still JavaScript, but each environment offers different resources.',
            endParagraph: 'document belongs to the APIs of the browser. console, on the other hand, is also available in the Node.js environment.',
            highlight: ['document', 'console', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// Browser\ndocument.querySelector("button");\n\n// Node.js\nconsole.log("Running on the server");',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando trabalhamos com frontend, normalmente utilizamos APIs oferecidas pelo navegador. No backend, podemos utilizar APIs fornecidas pelo Node.js.',
            endParagraph: 'Entender essa diferença ajuda a compreender por que um mesmo código JavaScript pode funcionar em um ambiente e não em outro.',
            highlight: ['frontend', 'backend', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// Navegador\ndocument.querySelector("button");\n\n// Node.js\nconsole.log("Executando no servidor");',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When working on the frontend, we normally use APIs offered by the browser. On the backend, we can use APIs provided by Node.js.',
            endParagraph: 'Understanding that difference helps explain why the same JavaScript code can work in one environment and not in another.',
            highlight: ['frontend', 'backend', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// Browser\ndocument.querySelector("button");\n\n// Node.js\nconsole.log("Running on the server");',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Projeto Node.js',
      en: 'A Node.js project'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um projeto Node.js possui arquivos e configurações que descrevem sua aplicação e suas dependências.',
            endParagraph: 'O arquivo package.json é uma peça importante do ecossistema Node.js e será utilizado para gerenciar informações e dependências do projeto.',
            highlight: ['package.json', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '{\n  "name": "minha-api",\n  "version": "1.0.0"\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A Node.js project has files and configuration that describe its application and its dependencies.',
            endParagraph: 'The package.json file is an important piece of the Node.js ecosystem, and it will be used to manage the project\'s information and dependencies.',
            highlight: ['package.json', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '{\n  "name": "my-api",\n  "version": "1.0.0"\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'NPM',
      en: 'NPM'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'NPM é uma das principais ferramentas utilizadas para instalar e gerenciar pacotes no ecossistema JavaScript e Node.js.',
            endParagraph: 'Com NPM, podemos adicionar bibliotecas e ferramentas prontas ao nosso projeto.',
            highlight: ['NPM', 'JavaScript', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// npm install express',
            onlyCode: true
          },
          en: {
            firstParagraph: 'NPM is one of the main tools used to install and manage packages in the JavaScript and Node.js ecosystem.',
            endParagraph: 'With NPM, we can add ready-made libraries and tools to our project.',
            highlight: ['NPM', 'JavaScript', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// npm install express',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando instalamos um pacote, ele passa a fazer parte das dependências do projeto.',
            endParagraph: 'Isso permite que o projeto registre quais pacotes precisa para funcionar.',
            highlight: ['dependências'],
            codeLanguage: 'JavaScript',
            code: '{\n  "dependencies": {\n    "express": "^5.0.0"\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When we install a package, it becomes part of the dependencies of the project.',
            endParagraph: 'This lets the project record which packages it needs to work.',
            highlight: ['dependencies'],
            codeLanguage: 'JavaScript',
            code: '{\n  "dependencies": {\n    "express": "^5.0.0"\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Módulos',
      en: 'Modules'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Assim como aplicações frontend podem ser divididas em módulos, aplicações Node.js também podem separar responsabilidades em diferentes arquivos.',
            endParagraph: 'Módulos ajudam a organizar o código e reutilizar funcionalidades.',
            highlight: ['módulos', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// math.js\nexport function somar(a, b) {\n  return a + b;\n}',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: '// app.js\nimport { somar } from "./math.js";\n\nconsole.log(somar(2, 3));'
              }
            ],
            onlyCode: true
          },
          en: {
            firstParagraph: 'Just like frontend applications can be split into modules, Node.js applications can also separate responsibilities across different files.',
            endParagraph: 'Modules help organize code and reuse functionality.',
            highlight: ['modules', 'Node.js'],
            codeLanguage: 'JavaScript',
            code: '// math.js\nexport function add(a, b) {\n  return a + b;\n}',
            additionalCode: [
              {
                codeLanguage: 'JavaScript',
                code: '// app.js\nimport { add } from "./math.js";\n\nconsole.log(add(2, 3));'
              }
            ],
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'APIs nativas',
      en: 'Native APIs'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Node.js possui APIs nativas para realizar tarefas comuns, como trabalhar com arquivos, caminhos, processos e comunicação de rede.',
            endParagraph: 'Antes de instalar um pacote, vale conhecer os recursos que o próprio Node.js oferece.',
            highlight: ['Node.js', 'APIs nativas'],
            codeLanguage: 'JavaScript',
            code: 'import fs from "node:fs";\n\nconst texto =\n  fs.readFileSync(\n    "arquivo.txt",\n    "utf8"\n  );\n\nconsole.log(texto);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Node.js has native APIs for common tasks, like working with files, paths, processes and network communication.',
            endParagraph: 'Before installing a package, it is worth knowing the resources Node.js itself already offers.',
            highlight: ['Node.js', 'native APIs'],
            codeLanguage: 'JavaScript',
            code: 'import fs from "node:fs";\n\nconst text =\n  fs.readFileSync(\n    "file.txt",\n    "utf8"\n  );\n\nconsole.log(text);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Sistema de arquivos',
      en: 'File system'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A API de sistema de arquivos do Node.js permite ler, criar e modificar arquivos diretamente pelo programa.',
            endParagraph: 'Esse tipo de acesso é possível porque Node.js executa fora do ambiente restrito de uma página web.',
            highlight: ['Node.js'],
            codeLanguage: 'JavaScript',
            code: 'import fs from "node:fs";\n\nfs.writeFileSync(\n  "mensagem.txt",\n  "Olá!"\n);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The Node.js file system API lets you read, create and modify files directly from the program.',
            endParagraph: 'This kind of access is possible because Node.js runs outside the restricted environment of a web page.',
            highlight: ['Node.js'],
            codeLanguage: 'JavaScript',
            code: 'import fs from "node:fs";\n\nfs.writeFileSync(\n  "message.txt",\n  "Hello!"\n);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'HTTP com Node.js',
      en: 'HTTP with Node.js'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O próprio Node.js possui recursos para criar servidores HTTP. Isso permite receber requisições e enviar respostas sem utilizar um framework.',
            endParagraph: 'É possível criar um servidor diretamente com Node.js, mas aplicações maiores podem se beneficiar de ferramentas que simplificam esse trabalho.',
            highlight: ['Node.js', 'HTTP', 'framework'],
            codeLanguage: 'JavaScript',
            code: 'import {\n  createServer\n} from "node:http";\n\nconst server =\n  createServer((req, res) => {\n    res.end("Olá!");\n  });\n\nserver.listen(3000);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Node.js itself has resources to create HTTP servers. This lets you receive requests and send responses without using a framework.',
            endParagraph: 'It\'s possible to create a server directly with Node.js, but larger applications can benefit from tools that simplify that work.',
            highlight: ['Node.js', 'HTTP', 'framework'],
            codeLanguage: 'JavaScript',
            code: 'import {\n  createServer\n} from "node:http";\n\nconst server =\n  createServer((req, res) => {\n    res.end("Hello!");\n  });\n\nserver.listen(3000);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'O que é HTTP?',
      en: 'What is HTTP?'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'HTTP é um protocolo utilizado para comunicação entre clientes e servidores na web. O cliente envia uma requisição e o servidor devolve uma resposta.',
            endParagraph: 'Essa troca de requisições e respostas é a base de muitas aplicações web e APIs.',
            highlight: ['HTTP'],
            codeLanguage: 'JavaScript',
            code: 'const resposta =\n  await fetch("/users");\n\nconsole.log(resposta.status); // 200',
            onlyCode: true
          },
          en: {
            firstParagraph: 'HTTP is a protocol used for communication between clients and servers on the web. The client sends a request and the server sends back a response.',
            endParagraph: 'This exchange of requests and responses is the foundation of many web applications and APIs.',
            highlight: ['HTTP'],
            codeLanguage: 'JavaScript',
            code: 'const response =\n  await fetch("/users");\n\nconsole.log(response.status); // 200',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Métodos HTTP',
      en: 'HTTP methods'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Os métodos HTTP ajudam a indicar o que queremos fazer com um recurso.',
            endParagraph: 'GET, POST, PUT e DELETE são alguns dos métodos mais comuns encontrados em APIs.',
            highlight: ['GET', 'POST', 'PUT', 'DELETE', 'HTTP'],
            codeLanguage: 'JavaScript',
            code: '// GET    /users     -> listar usuários\n// POST   /users     -> criar um usuário\n// PUT    /users/1   -> atualizar o usuário 1\n// DELETE /users/1   -> remover o usuário 1',
            onlyCode: true
          },
          en: {
            firstParagraph: 'HTTP methods help indicate what we want to do with a resource.',
            endParagraph: 'GET, POST, PUT and DELETE are some of the most common methods found in APIs.',
            highlight: ['GET', 'POST', 'PUT', 'DELETE', 'HTTP'],
            codeLanguage: 'JavaScript',
            code: '// GET    /users     -> list users\n// POST   /users     -> create a user\n// PUT    /users/1   -> update user 1\n// DELETE /users/1   -> remove user 1',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Status HTTP',
      en: 'HTTP status'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Além dos dados, uma resposta HTTP possui um status que indica como a requisição foi processada.',
            endParagraph: 'Os códigos de status ajudam o cliente a entender o resultado de uma requisição.',
            highlight: ['HTTP', 'status'],
            codeLanguage: 'JavaScript',
            code: '// 200 OK                      -> deu certo\n// 201 Created                  -> recurso criado\n// 400 Bad Request               -> requisição malformada\n// 404 Not Found                  -> recurso não existe\n// 500 Internal Server Error       -> erro no servidor',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Besides the data, an HTTP response has a status that indicates how the request was processed.',
            endParagraph: 'Status codes help the client understand the result of a request.',
            highlight: ['HTTP', 'status'],
            codeLanguage: 'JavaScript',
            code: '// 200 OK                      -> worked fine\n// 201 Created                  -> resource created\n// 400 Bad Request               -> malformed request\n// 404 Not Found                  -> resource does not exist\n// 500 Internal Server Error       -> server error',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Por que Express?',
      en: 'Why Express?'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Node.js permite criar servidores HTTP diretamente, mas uma aplicação pode rapidamente acumular rotas, validações e outras responsabilidades. Frameworks ajudam a organizar esse trabalho.',
            endParagraph: 'Express é uma ferramenta popular para facilitar a criação de aplicações web e APIs com Node.js.',
            highlight: ['Node.js', 'frameworks', 'Express'],
            codeLanguage: 'JavaScript',
            code: 'import {\n  createServer\n} from "node:http";\n\nconst server =\n  createServer((req, res) => {\n    res.end("Olá!");\n  });\n\nserver.listen(3000);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Node.js lets you create HTTP servers directly, but an application can quickly accumulate routes, validations and other responsibilities. Frameworks help organize that work.',
            endParagraph: 'Express is a popular tool for making it easier to build web applications and APIs with Node.js.',
            highlight: ['Node.js', 'frameworks', 'Express'],
            codeLanguage: 'JavaScript',
            code: 'import {\n  createServer\n} from "node:http";\n\nconst server =\n  createServer((req, res) => {\n    res.end("Hello!");\n  });\n\nserver.listen(3000);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'O que é Express?',
      en: 'What is Express?'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Express é um framework para Node.js utilizado para criar aplicações web e APIs HTTP de forma mais simples.',
            endParagraph: 'Node.js fornece o ambiente de execução. Express adiciona recursos que facilitam a construção da aplicação HTTP.',
            highlight: ['Express', 'Node.js', 'HTTP'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.listen(3000);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Express is a framework for Node.js used to create web applications and HTTP APIs more simply.',
            endParagraph: 'Node.js provides the runtime. Express adds resources that make it easier to build the HTTP application.',
            highlight: ['Express', 'Node.js', 'HTTP'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.listen(3000);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Rotas',
      en: 'Routes'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma rota associa um método HTTP e um caminho a uma função que será executada quando aquela requisição chegar.',
            endParagraph: 'A rota define como a aplicação responderá a uma determinada requisição.',
            highlight: ['rota', 'HTTP'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/users", (req, res) => {\n  res.send("Lista de usuários");\n});',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A route associates an HTTP method and a path with a function that runs when that request arrives.',
            endParagraph: 'The route defines how the application will respond to a given request.',
            highlight: ['route', 'HTTP'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/users", (req, res) => {\n  res.send("User list");\n});',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Request e Response',
      en: 'Request and Response'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'No Express, req representa as informações da requisição recebida e res representa a resposta que será enviada ao cliente.',
            endParagraph: 'O servidor recebe uma requisição e precisa produzir uma resposta adequada para o cliente.',
            highlight: ['Express', 'req', 'res'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/users", (req, res) => {\n  res.send("Usuários");\n});',
            onlyCode: true
          },
          en: {
            firstParagraph: 'In Express, req represents the information from the incoming request, and res represents the response that will be sent to the client.',
            endParagraph: 'The server receives a request and needs to produce a suitable response for the client.',
            highlight: ['Express', 'req', 'res'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/users", (req, res) => {\n  res.send("Users");\n});',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'JSON',
      en: 'JSON'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JSON é um formato muito utilizado para representar dados em APIs porque permite estruturar informações de maneira simples.',
            endParagraph: 'APIs frequentemente utilizam JSON para transportar dados entre cliente e servidor.',
            highlight: ['JSON'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/user", (req, res) => {\n  res.json({\n    id: 1,\n    nome: "Ana"\n  });\n});',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JSON is a widely used format for representing data in APIs because it lets you structure information in a simple way.',
            endParagraph: 'APIs frequently use JSON to transport data between client and server.',
            highlight: ['JSON'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/user", (req, res) => {\n  res.json({\n    id: 1,\n    name: "Ana"\n  });\n});',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Parâmetros de rota',
      en: 'Route parameters'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Rotas podem possuir parâmetros. Eles permitem identificar recursos específicos a partir da própria URL.',
            endParagraph: 'O parâmetro :id funciona como uma parte variável da rota.',
            highlight: ['parâmetros', 'rota'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/users/:id", (req, res) => {\n  res.json({\n    id: req.params.id\n  });\n});',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Routes can have parameters. They let you identify specific resources directly from the URL.',
            endParagraph: 'The :id parameter works as a variable part of the route.',
            highlight: ['parameters', 'route'],
            codeLanguage: 'JavaScript',
            code: 'app.get("/users/:id", (req, res) => {\n  res.json({\n    id: req.params.id\n  });\n});',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Recebendo JSON',
      en: 'Receiving JSON'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Uma API também pode receber dados enviados pelo cliente. O Express possui middleware para interpretar requisições contendo JSON.',
            endParagraph: 'Com isso, o servidor consegue receber objetos JSON enviados pelo cliente.',
            highlight: ['Express', 'JSON', 'middleware'],
            codeLanguage: 'JavaScript',
            code: 'app.use(express.json());\n\napp.post("/users", (req, res) => {\n  res.json(req.body);\n});',
            onlyCode: true
          },
          en: {
            firstParagraph: 'An API can also receive data sent by the client. Express has middleware to parse requests containing JSON.',
            endParagraph: 'With that, the server can receive JSON objects sent by the client.',
            highlight: ['Express', 'JSON', 'middleware'],
            codeLanguage: 'JavaScript',
            code: 'app.use(express.json());\n\napp.post("/users", (req, res) => {\n  res.json(req.body);\n});',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Construindo uma API',
      en: 'Building an API'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Agora podemos combinar Node.js, Express, rotas, métodos HTTP e JSON para construir uma pequena API.',
            endParagraph: 'Essa aplicação já possui os principais elementos de uma API HTTP simples.',
            highlight: ['Node.js', 'Express', 'HTTP', 'JSON'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, nome: "Ana" },\n    { id: 2, nome: "João" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Now we can combine Node.js, Express, routes, HTTP methods and JSON to build a small API.',
            endParagraph: 'This application already has the main elements of a simple HTTP API.',
            highlight: ['Node.js', 'Express', 'HTTP', 'JSON'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, name: "Ana" },\n    { id: 2, name: "John" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Entendendo o fluxo',
      en: 'Understanding the flow'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando um cliente acessa uma rota, o Express identifica o método e o caminho da requisição e executa o código correspondente.',
            endParagraph: 'Esse fluxo é a base do funcionamento de muitas APIs utilizadas por aplicações web e mobile.',
            highlight: ['Express', 'rota'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, nome: "Ana" },\n    { id: 2, nome: "João" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When a client accesses a route, Express identifies the method and the path of the request and runs the corresponding code.',
            endParagraph: 'This flow is the foundation of how many APIs used by web and mobile applications work.',
            highlight: ['Express', 'route'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, name: "Ana" },\n    { id: 2, name: "John" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'O ecossistema conectado',
      en: 'The connected ecosystem'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Node.js fornece o ambiente para executar JavaScript. Express simplifica a criação do servidor HTTP. HTTP define a comunicação entre cliente e servidor. JSON permite transportar dados estruturados.',
            endParagraph: 'Cada tecnologia possui uma função diferente, mas elas podem trabalhar juntas para construir uma API.',
            highlight: ['Node.js', 'Express', 'HTTP', 'JSON'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, nome: "Ana" },\n    { id: 2, nome: "João" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Node.js provides the environment to run JavaScript. Express simplifies creating the HTTP server. HTTP defines communication between client and server. JSON lets you transport structured data.',
            endParagraph: 'Each technology has a different role, but they can work together to build an API.',
            highlight: ['Node.js', 'Express', 'HTTP', 'JSON'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, name: "Ana" },\n    { id: 2, name: "John" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Você começou aprendendo JavaScript no navegador. Agora consegue utilizá-lo também no desenvolvimento de servidores e APIs.',
            endParagraph: 'Esse é o objetivo do módulo: mostrar que aprender JavaScript não significa aprender apenas uma linguagem para interfaces, mas conhecer uma base que pode levar a diferentes áreas do desenvolvimento.',
            highlight: ['JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, nome: "Ana" },\n    { id: 2, nome: "João" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'You started out learning JavaScript in the browser. Now you can also use it to build servers and APIs.',
            endParagraph: 'That is the goal of this module: to show that learning JavaScript does not mean learning only a language for interfaces, but gaining a foundation that can lead to different areas of development.',
            highlight: ['JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'import express from "express";\n\nconst app = express();\n\napp.use(express.json());\n\napp.get("/users", (req, res) => {\n  res.json([\n    { id: 1, name: "Ana" },\n    { id: 2, name: "John" }\n  ]);\n});\n\napp.listen(3000);',
            onlyCode: true
          }
        }
      }
    ]
  }
]

// ============================================================
// Conteúdo curricular do quarto módulo de HTML ("Além do HTML: Introdução
// ao React"). Só a parte teórica está seedada — a prática foi deixada de
// fora por pedido explícito, para ser adicionada depois. Parte do princípio
// de que o aluno já concluiu HTML Básico/Intermediário/Avançado.
//
// Todas as telas são `onlyCode: true`, pelo mesmo motivo dos módulos de
// JavaScript: a aba "Web" do `CodeSection` não executa JavaScript (só
// combina HTML+CSS estáticos), e JSX não é HTML — é sintaxe JavaScript. Não
// há como demonstrar um componente React rodando de verdade sem construir um
// runtime próprio, o que a proposta curricular deste módulo proíbe
// explicitamente ("Não criar infraestrutura paralela para executar React").
// `codeLanguage: 'JavaScript'` é usado para todo o código JSX, por
// pragmatismo — o mesmo já feito para JSON/tsconfig em módulos anteriores
// (o schema não tem um valor `'JSX'` dedicado, e o highlight.js já
// reconhece razoavelmente tags dentro de JavaScript).

// --- Além do HTML: trechos de código ---

























// Trechos de código das lições e atividades acrescentadas após a criação
// do seeder, nomeados pela lição (e não pela numeração posicional das
// seções antigas, que mudaria ao inserir uma lição no meio).




export const HTML_BEYOND_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'O que é React?',
      en: 'What is React?'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'React é uma biblioteca JavaScript utilizada para construir interfaces de usuário. Em vez de pensar em uma página inteira de uma vez, podemos dividir a interface em partes menores chamadas componentes.',
            endParagraph: 'React utiliza JavaScript para descrever e controlar partes da interface.',
            highlight: ['React', 'JavaScript', 'componentes'],
            codeLanguage: 'JavaScript',
            code: 'function App() {\n  return <h1>Olá!</h1>;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'React is a JavaScript library used to build user interfaces. Instead of thinking about a whole page at once, we can split the interface into smaller pieces called components.',
            endParagraph: 'React uses JavaScript to describe and control parts of the interface.',
            highlight: ['React', 'JavaScript', 'components'],
            codeLanguage: 'JavaScript',
            code: 'function App() {\n  return <h1>Hello!</h1>;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Os elementos utilizados na interface continuam familiares. A diferença está em como eles são organizados e utilizados dentro dos componentes React.',
            endParagraph: 'O conhecimento de HTML continua sendo uma base importante para entender React.',
            highlight: ['HTML', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Titulo() {\n  return <h1>Meu site</h1>;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The elements used in the interface are still familiar. The difference is in how they are organized and used inside React components.',
            endParagraph: 'Your HTML knowledge is still an important foundation for understanding React.',
            highlight: ['HTML', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Title() {\n  return <h1>My site</h1>;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Componentes',
      en: 'Components'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um componente representa uma parte da interface. Ele pode conter sua própria estrutura e ser reutilizado em diferentes partes de uma aplicação.',
            endParagraph: 'Componentes permitem dividir interfaces grandes em partes menores.',
            highlight: ['componente', 'componentes'],
            codeLanguage: 'JavaScript',
            code: 'function Botao() {\n  return <button>Clique aqui</button>;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A component represents a part of the interface. It can hold its own structure and be reused in different parts of an application.',
            endParagraph: 'Components let you split large interfaces into smaller pieces.',
            highlight: ['component', 'components'],
            codeLanguage: 'JavaScript',
            code: 'function Button() {\n  return <button>Click here</button>;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um componente pode utilizar outros componentes para formar uma interface maior.',
            endParagraph: 'Essa composição é uma das ideias fundamentais do React.',
            highlight: ['composição', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Botao() {\n  return <button>Entrar</button>;\n}\n\nfunction App() {\n  return (\n    <main>\n      <h1>Login</h1>\n      <Botao />\n    </main>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A component can use other components to form a larger interface.',
            endParagraph: 'This composition is one of the fundamental ideas of React.',
            highlight: ['composition', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Button() {\n  return <button>Sign in</button>;\n}\n\nfunction App() {\n  return (\n    <main>\n      <h1>Login</h1>\n      <Button />\n    </main>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'JSX',
      en: 'JSX'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'JSX permite escrever uma sintaxe parecida com HTML dentro do código JavaScript. Isso facilita a descrição da estrutura da interface.',
            endParagraph: 'JSX se parece com HTML, mas não é HTML puro. Ele é uma sintaxe utilizada para descrever a interface dentro do código JavaScript.',
            highlight: ['JSX', 'HTML', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'function App() {\n  return (\n    <main>\n      <h1>Olá!</h1>\n      <p>Bem-vindo.</p>\n    </main>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'JSX lets you write a syntax similar to HTML inside JavaScript code. This makes it easier to describe the structure of the interface.',
            endParagraph: 'JSX looks like HTML, but it is not plain HTML. It is a syntax used to describe the interface inside JavaScript code.',
            highlight: ['JSX', 'HTML', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'function App() {\n  return (\n    <main>\n      <h1>Hello!</h1>\n      <p>Welcome.</p>\n    </main>\n  );\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Como JSX vive dentro do JavaScript, alguns atributos do HTML mudam de nome para não colidir com palavras reservadas da linguagem.',
            secondParagraph: 'O caso mais comum é o class do HTML, que no JSX se escreve className. O for de um label vira htmlFor pelo mesmo motivo.',
            endParagraph: 'Os demais atributos passam a usar camelCase: onclick vira onClick, e tabindex vira tabIndex.',
            highlight: ['JSX', 'HTML', 'className', 'htmlFor', 'camelCase'],
            codeLanguage: 'JavaScript',
            code: 'function Aviso() {\n  return (\n    <div className="aviso">\n      <label htmlFor="nome">Nome</label>\n      <input id="nome" tabIndex={0} />\n    </div>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Because JSX lives inside JavaScript, some HTML attributes change names so they do not clash with reserved words of the language.',
            secondParagraph: 'The most common case is the HTML class, written as className in JSX. The for of a label becomes htmlFor for the same reason.',
            endParagraph: 'The remaining attributes switch to camelCase: onclick becomes onClick, and tabindex becomes tabIndex.',
            highlight: ['JSX', 'HTML', 'className', 'htmlFor', 'camelCase'],
            codeLanguage: 'JavaScript',
            code: 'function Aviso() {\n  return (\n    <div className="aviso">\n      <label htmlFor="nome">Name</label>\n      <input id="nome" tabIndex={0} />\n    </div>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Expressões no JSX',
      en: 'Expressions in JSX'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'As chaves {} permitem inserir expressões JavaScript dentro do JSX.',
            endParagraph: 'Essa integração permite que a interface utilize dados definidos pelo JavaScript.',
            highlight: ['JSX', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const nome = "Ana";\n\nfunction App() {\n  return <h1>Olá, {nome}!</h1>;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Curly braces {} let you insert JavaScript expressions inside JSX.',
            endParagraph: 'This integration lets the interface use data defined by JavaScript.',
            highlight: ['JSX', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const name = "Ana";\n\nfunction App() {\n  return <h1>Hello, {name}!</h1>;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos utilizar expressões JavaScript para produzir conteúdos diferentes na interface.',
            endParagraph: 'JSX permite aproximar os dados da estrutura visual que será exibida.',
            highlight: ['JSX'],
            codeLanguage: 'JavaScript',
            code: 'const idade = 20;\n\nfunction App() {\n  return <p>Idade: {idade}</p>;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can use JavaScript expressions to produce different content in the interface.',
            endParagraph: 'JSX lets you bring the data closer to the visual structure that will be shown.',
            highlight: ['JSX'],
            codeLanguage: 'JavaScript',
            code: 'const age = 20;\n\nfunction App() {\n  return <p>Age: {age}</p>;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Props',
      en: 'Props'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'props são informações fornecidas a um componente por quem o utiliza.',
            endParagraph: 'props permitem que o mesmo componente trabalhe com diferentes informações.',
            highlight: ['props'],
            codeLanguage: 'JavaScript',
            code: 'function Saudacao({ nome }) {\n  return <h2>Olá, {nome}!</h2>;\n}\n\nfunction App() {\n  return <Saudacao nome="Ana" />;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'props are information provided to a component by whoever uses it.',
            endParagraph: 'props let the same component work with different information.',
            highlight: ['props'],
            codeLanguage: 'JavaScript',
            code: 'function Greeting({ name }) {\n  return <h2>Hello, {name}!</h2>;\n}\n\nfunction App() {\n  return <Greeting name="Ana" />;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Componentes reutilizáveis',
      en: 'Reusable components'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Um componente pode ser utilizado várias vezes recebendo diferentes valores por meio de props.',
            endParagraph: 'A estrutura do componente é reutilizada enquanto os dados podem mudar.',
            highlight: ['componente', 'props'],
            codeLanguage: 'JavaScript',
            code: 'function Usuario({ nome }) {\n  return <p>Usuário: {nome}</p>;\n}\n\nfunction App() {\n  return (\n    <>\n      <Usuario nome="Ana" />\n      <Usuario nome="João" />\n    </>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'A component can be used several times, receiving different values through props.',
            endParagraph: 'The structure of the component is reused while the data can change.',
            highlight: ['component', 'props'],
            codeLanguage: 'JavaScript',
            code: 'function User({ name }) {\n  return <p>User: {name}</p>;\n}\n\nfunction App() {\n  return (\n    <>\n      <User name="Ana" />\n      <User name="John" />\n    </>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Eventos',
      en: 'Events'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'React permite associar funções a eventos da interface, como cliques e alterações em campos.',
            endParagraph: 'Eventos conectam as ações do usuário à lógica do componente.',
            highlight: ['eventos', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Botao() {\n  function clicar() {\n    console.log("Clicou!");\n  }\n\n  return (\n    <button onClick={clicar}>\n      Clique\n    </button>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'React lets you attach functions to interface events, like clicks and field changes.',
            endParagraph: 'Events connect the user\'s actions to the component\'s logic.',
            highlight: ['events', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Button() {\n  function handleClick() {\n    console.log("Clicked!");\n  }\n\n  return (\n    <button onClick={handleClick}>\n      Click\n    </button>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Estado',
      en: 'State'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Algumas informações mudam enquanto o usuário utiliza uma aplicação. O componente precisa manter esses valores para que a interface possa acompanhar essas mudanças.',
            endParagraph: 'No React, essas informações podem ser controladas por meio de estado.',
            highlight: ['estado', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Contador() {\n  // Precisamos lembrar quantas vezes\n  // o botão foi clicado\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Some information changes while the user interacts with an application. The component needs to keep track of these values so the interface can follow those changes.',
            endParagraph: 'In React, this information can be controlled through state.',
            highlight: ['state', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Counter() {\n  // We need to remember how many times\n  // the button was clicked\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando o estado de um componente muda, o React executa a função desse componente outra vez. Esse ciclo é chamado de re-renderização.',
            secondParagraph: 'Executar de novo não significa refazer a página inteira: o React compara o resultado novo com o anterior e altera no navegador apenas o que de fato mudou.',
            endParagraph: 'É por isso que a interface acompanha o estado sozinha. Você descreve como a tela deve ser para cada valor, e a re-renderização cuida de manter as duas coisas em sincronia.',
            highlight: ['estado', 'React', 're-renderização'],
            codeLanguage: 'JavaScript',
            code: 'function Contador() {\n  const [total, setTotal] = useState(0);\n\n  // A cada clique o estado muda, a função roda de novo\n  // e o React atualiza apenas o texto do parágrafo.\n  return (\n    <div>\n      <p>Total: {total}</p>\n      <button onClick={() => setTotal(total + 1)}>Somar</button>\n    </div>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When the state of a component changes, React runs that component function again. This cycle is called re-rendering.',
            secondParagraph: 'Running again does not mean rebuilding the whole page: React compares the new result with the previous one and changes in the browser only what actually differs.',
            endParagraph: 'That is why the interface follows the state on its own. You describe how the screen should look for each value, and re-rendering keeps the two in sync.',
            highlight: ['state', 'React', 're-rendering'],
            codeLanguage: 'JavaScript',
            code: 'function Contador() {\n  const [total, setTotal] = useState(0);\n\n  // On each click the state changes, the function runs again\n  // and React updates only the paragraph text.\n  return (\n    <div>\n      <p>Total: {total}</p>\n      <button onClick={() => setTotal(total + 1)}>Add</button>\n    </div>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'useState',
      en: 'useState'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'useState permite criar um valor de estado e uma função responsável por atualizá-lo.',
            endParagraph: 'O primeiro valor representa o estado atual. A segunda parte é a função utilizada para atualizá-lo.',
            highlight: ['useState', 'estado'],
            codeLanguage: 'JavaScript',
            code: 'const [contador, setContador] =\n  useState(0);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'useState lets you create a state value and a function responsible for updating it.',
            endParagraph: 'The first value represents the current state. The second part is the function used to update it.',
            highlight: ['useState', 'state'],
            codeLanguage: 'JavaScript',
            code: 'const [count, setCount] =\n  useState(0);',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Podemos atualizar o estado chamando a função retornada por useState com um novo valor.',
            endParagraph: 'Quando o estado é atualizado, o React pode renderizar novamente o componente para refletir o novo valor.',
            highlight: ['estado', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Contador() {\n  const [contador, setContador] =\n    useState(0);\n\n  return (\n    <button\n      onClick={() =>\n        setContador(contador + 1)\n      }\n    >\n      {contador}\n    </button>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'We can update the state by calling the function returned by useState with a new value.',
            endParagraph: 'When the state is updated, React can render the component again to reflect the new value.',
            highlight: ['state', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Counter() {\n  const [count, setCount] =\n    useState(0);\n\n  return (\n    <button\n      onClick={() =>\n        setCount(count + 1)\n      }\n    >\n      {count}\n    </button>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Props e estado',
      en: 'Props and state'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'props são informações recebidas pelo componente. estado representa informações que o componente precisa controlar e atualizar.',
            endParagraph: 'Pensar na origem e no comportamento de uma informação ajuda a diferenciar props de estado.',
            highlight: ['props', 'estado'],
            codeLanguage: 'JavaScript',
            code: 'function Contador({ titulo }) {\n  const [valor, setValor] =\n    useState(0);\n\n  return (\n    <button>\n      {titulo}: {valor}\n    </button>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'props are information received by the component. state represents information the component needs to control and update.',
            endParagraph: 'Thinking about the origin and behavior of a piece of information helps tell props apart from state.',
            highlight: ['props', 'state'],
            codeLanguage: 'JavaScript',
            code: 'function Counter({ title }) {\n  const [value, setValue] =\n    useState(0);\n\n  return (\n    <button>\n      {title}: {value}\n    </button>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Formulários',
      en: 'Forms'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Eventos permitem que um componente reaja às alterações feitas pelo usuário em um campo de formulário.',
            endParagraph: 'onChange permite acompanhar alterações realizadas em um campo.',
            highlight: ['onChange'],
            codeLanguage: 'JavaScript',
            code: 'function Campo() {\n  function alterar(event) {\n    console.log(event.target.value);\n  }\n\n  return (\n    <input onChange={alterar} />\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Events let a component react to changes the user makes in a form field.',
            endParagraph: 'onChange lets you track changes made to a field.',
            highlight: ['onChange'],
            codeLanguage: 'JavaScript',
            code: 'function Field() {\n  function handleChange(event) {\n    console.log(event.target.value);\n  }\n\n  return (\n    <input onChange={handleChange} />\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Hooks',
      en: 'Hooks'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Hooks são funções fornecidas pelo React que permitem utilizar recursos do React dentro de componentes funcionais.',
            endParagraph: 'useState é um Hook. O React possui outros Hooks para diferentes necessidades.',
            highlight: ['Hooks', 'useState', 'React'],
            codeLanguage: 'JavaScript',
            code: 'useState();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Hooks are functions provided by React that let you use React features inside function components.',
            endParagraph: 'useState is a Hook. React has other Hooks for different needs.',
            highlight: ['Hooks', 'useState', 'React'],
            codeLanguage: 'JavaScript',
            code: 'useState();',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Além de useState, existem Hooks como useEffect e useRef, que serão apresentados separadamente.',
            endParagraph: 'Cada Hook possui uma finalidade específica. Agora vamos conhecer alguns dos mais utilizados.',
            highlight: ['Hooks', 'useEffect', 'useRef'],
            codeLanguage: 'JavaScript',
            code: 'useState();',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Besides useState, there are Hooks like useEffect and useRef, which will be presented separately.',
            endParagraph: 'Each Hook has a specific purpose. Now let\'s meet some of the most used ones.',
            highlight: ['Hooks', 'useEffect', 'useRef'],
            codeLanguage: 'JavaScript',
            code: 'useState();',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'useEffect',
      en: 'useEffect'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'useEffect permite executar código relacionado a efeitos depois da renderização de um componente.',
            endParagraph: 'Ele é utilizado quando o componente precisa realizar alguma ação relacionada a algo externo à renderização.',
            highlight: ['useEffect'],
            codeLanguage: 'JavaScript',
            code: 'import { useEffect } from "react";\n\nuseEffect(() => {\n  console.log("Renderizado");\n}, []);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'useEffect lets you run code related to effects after a component renders.',
            endParagraph: 'It is used when the component needs to perform some action related to something outside of rendering.',
            highlight: ['useEffect'],
            codeLanguage: 'JavaScript',
            code: 'import { useEffect } from "react";\n\nuseEffect(() => {\n  console.log("Rendered");\n}, []);',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O array de dependências do useEffect indica os valores que devem ser observados pelo efeito.',
            secondParagraph: 'Nesse exemplo, o efeito acompanha mudanças em nome.',
            endParagraph: 'Nesse exemplo, o efeito acompanha mudanças em nome.',
            highlight: ['dependências', 'useEffect'],
            codeLanguage: 'JavaScript',
            code: 'useEffect(() => {\n  console.log(nome);\n}, [nome]);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The dependency array of useEffect indicates the values that should be watched by the effect.',
            secondParagraph: 'In this example, the effect follows changes to name.',
            endParagraph: 'In this example, the effect follows changes to name.',
            highlight: ['dependency', 'useEffect'],
            codeLanguage: 'JavaScript',
            code: 'useEffect(() => {\n  console.log(name);\n}, [name]);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'useRef',
      en: 'useRef'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'useRef permite manter uma referência entre renderizações sem provocar uma nova renderização quando seu valor é alterado.',
            endParagraph: 'Refs podem ser úteis quando precisamos manter uma referência que não controla diretamente a interface.',
            highlight: ['useRef', 'Refs'],
            codeLanguage: 'JavaScript',
            code: 'import { useRef } from "react";\n\nconst inputRef = useRef(null);',
            onlyCode: true
          },
          en: {
            firstParagraph: 'useRef lets you keep a reference between renders without causing a new render when its value changes.',
            endParagraph: 'Refs can be useful when we need to keep a reference that does not directly control the interface.',
            highlight: ['useRef', 'Refs'],
            codeLanguage: 'JavaScript',
            code: 'import { useRef } from "react";\n\nconst inputRef = useRef(null);',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Renderização condicional',
      en: 'Conditional rendering'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Como JSX utiliza JavaScript, podemos utilizar condições para determinar qual conteúdo será exibido.',
            endParagraph: 'A renderização condicional permite adaptar a interface de acordo com os dados.',
            highlight: ['renderização condicional', 'JSX'],
            codeLanguage: 'JavaScript',
            code: 'function Status({ logado }) {\n  return logado\n    ? <p>Bem-vindo!</p>\n    : <p>Faça login.</p>;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Since JSX uses JavaScript, we can use conditions to decide which content will be shown.',
            endParagraph: 'Conditional rendering lets you adapt the interface based on the data.',
            highlight: ['conditional rendering', 'JSX'],
            codeLanguage: 'JavaScript',
            code: 'function Status({ loggedIn }) {\n  return loggedIn\n    ? <p>Welcome!</p>\n    : <p>Please log in.</p>;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Renderização de listas',
      en: 'Rendering lists'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Arrays podem ser transformados em elementos de interface utilizando métodos JavaScript como map().',
            endParagraph: 'Essa abordagem permite construir interfaces a partir de conjuntos de dados.',
            highlight: ['map', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const nomes = ["Ana", "João"];\n\nfunction Lista() {\n  return (\n    <ul>\n      {nomes.map(nome => (\n        <li>{nome}</li>\n      ))}\n    </ul>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Arrays can be transformed into interface elements using JavaScript methods like map().',
            endParagraph: 'This approach lets you build interfaces from sets of data.',
            highlight: ['map', 'JavaScript'],
            codeLanguage: 'JavaScript',
            code: 'const names = ["Ana", "John"];\n\nfunction List() {\n  return (\n    <ul>\n      {names.map(name => (\n        <li>{name}</li>\n      ))}\n    </ul>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'key',
      en: 'key'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Quando o React renderiza uma lista, cada elemento precisa possuir uma key que permita identificá-lo de maneira estável.',
            endParagraph: 'Um identificador estável ajuda o React a acompanhar corretamente os elementos da lista.',
            highlight: ['React', 'key'],
            codeLanguage: 'JavaScript',
            code: 'const usuarios = [\n  { id: 1, nome: "Ana" },\n  { id: 2, nome: "João" }\n];\n\nfunction Lista() {\n  return usuarios.map(usuario => (\n    <p key={usuario.id}>\n      {usuario.nome}\n    </p>\n  ));\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When React renders a list, each element needs to have a key that lets it be identified in a stable way.',
            endParagraph: 'A stable identifier helps React correctly track the elements in the list.',
            highlight: ['React', 'key'],
            codeLanguage: 'JavaScript',
            code: 'const users = [\n  { id: 1, name: "Ana" },\n  { id: 2, name: "John" }\n];\n\nfunction List() {\n  return users.map(user => (\n    <p key={user.id}>\n      {user.name}\n    </p>\n  ));\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Composição de componentes',
      en: 'Component composition'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Interfaces maiores podem ser construídas combinando vários componentes menores e independentes.',
            endParagraph: 'Interfaces podem ser construídas combinando componentes menores e independentes.',
            highlight: ['componentes'],
            codeLanguage: 'JavaScript',
            code: 'function Header() {\n  return <header>Meu site</header>;\n}\n\nfunction Conteudo() {\n  return <main>Conteúdo</main>;\n}\n\nfunction App() {\n  return (\n    <>\n      <Header />\n      <Conteudo />\n    </>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Larger interfaces can be built by combining several smaller, independent components.',
            endParagraph: 'Interfaces can be built by combining smaller, independent components.',
            highlight: ['components'],
            codeLanguage: 'JavaScript',
            code: 'function Header() {\n  return <header>My site</header>;\n}\n\nfunction Content() {\n  return <main>Content</main>;\n}\n\nfunction App() {\n  return (\n    <>\n      <Header />\n      <Content />\n    </>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'HTML e React',
      en: 'HTML and React'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Ao utilizar React, continuamos trabalhando com elementos como h1, p, button, input, ul e article.',
            endParagraph: 'React não elimina a importância do HTML. O conhecimento de estrutura e semântica continua sendo fundamental.',
            highlight: ['HTML', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Card() {\n  return (\n    <article>\n      <h2>Produto</h2>\n      <p>Descrição</p>\n      <button>Comprar</button>\n    </article>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'When using React, we keep working with elements like h1, p, button, input, ul and article.',
            endParagraph: 'React does not remove the importance of HTML. Knowing structure and semantics is still fundamental.',
            highlight: ['HTML', 'React'],
            codeLanguage: 'JavaScript',
            code: 'function Card() {\n  return (\n    <article>\n      <h2>Product</h2>\n      <p>Description</p>\n      <button>Buy</button>\n    </article>\n  );\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'A principal mudança está na forma de organizar a interface. Em React, estruturas de interface podem ser transformadas em componentes reutilizáveis e receber dados ou comportamento.',
            endParagraph: 'Por isso, aprender HTML antes de React fornece uma base importante para compreender a construção de interfaces modernas.',
            highlight: ['React', 'HTML', 'componentes'],
            codeLanguage: 'JavaScript',
            code: 'function Card() {\n  return (\n    <article>\n      <h2>Produto</h2>\n      <p>Descrição</p>\n      <button>Comprar</button>\n    </article>\n  );\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'The main change is in how the interface gets organized. In React, interface structures can be turned into reusable components that receive data or behavior.',
            endParagraph: 'That is why learning HTML before React gives you an important foundation for understanding how modern interfaces are built.',
            highlight: ['React', 'HTML', 'components'],
            codeLanguage: 'JavaScript',
            code: 'function Card() {\n  return (\n    <article>\n      <h2>Product</h2>\n      <p>Description</p>\n      <button>Buy</button>\n    </article>\n  );\n}',
            onlyCode: true
          }
        }
      }
    ]
  }
]

// ============================================================
// Conteúdo curricular do quarto módulo de CSS ("Além do CSS: Tailwind CSS e
// Ecossistema"). Só a parte teórica está seedada — a prática foi deixada de
// fora por pedido explícito. Parte do princípio de que o aluno já concluiu
// CSS Básico/Intermediário/Avançado.
//
// Ao contrário do módulo "Além do JavaScript"/"Além do HTML", boa parte
// deste módulo É demonstrável de verdade na aba "Web": classes utilitárias
// do Tailwind nada mais são do que atalhos para propriedades CSS comuns, e
// `additionalCode` já resolve o valor real de cada classe usada no exemplo
// (ex.: `.p-4 { padding: 1rem; }`) — não é preciso carregar o Tailwind de
// verdade (CDN, incompatível com o app ser offline-first; motor JIT, pesado
// demais para o device — ver docs/roadmap-atividades-praticas.md) para
// mostrar o resultado correto de um exemplo pequeno e controlado. Fica
// `onlyCode: true` só onde o efeito depende de largura de tela grande
// (`md:`, mesmo problema de breakpoint das media queries em CSS Avançado),
// de interação (`hover:`/`focus:`, não demonstrável no toque) ou de
// preferência de sistema (`dark:`, não alternável sob demanda), e nas telas
// puramente conceituais (panorama do ecossistema, customização/configuração
// do Tailwind em si).

// --- Além do CSS: trechos de código ---
















export const CSS_BEYOND_LESSONS: LessonSeed[] = [
  {
    name: {
      pt: 'CSS e o ecossistema de estilização',
      en: 'CSS and the styling ecosystem'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'CSS continua sendo a base da estilização na web. Porém, existem ferramentas e tecnologias que ajudam a organizar, acelerar ou ampliar a forma como escrevemos estilos.',
            secondParagraph: 'Esse ecossistema inclui CSS tradicional, Tailwind CSS, Bootstrap, Sass e PostCSS.',
            endParagraph: 'Essas ferramentas não são todas do mesmo tipo. Cada uma possui uma proposta diferente.',
            highlight: ['CSS', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '/* CSS tradicional */\n.botao {\n  padding: 8px 16px;\n  border-radius: 8px;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'CSS is still the foundation of styling on the web. However, there are tools and technologies that help organize, speed up or extend the way we write styles.',
            secondParagraph: 'This ecosystem includes traditional CSS, Tailwind CSS, Bootstrap, Sass and PostCSS.',
            endParagraph: 'These tools are not all the same type. Each one has a different proposal.',
            highlight: ['CSS', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '/* Traditional CSS */\n.button {\n  padding: 8px 16px;\n  border-radius: 8px;\n}',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Frameworks fornecem estruturas e recursos prontos para o desenvolvimento. Pré-processadores adicionam recursos à escrita de CSS. Ferramentas de processamento transformam arquivos CSS durante o desenvolvimento.',
            endParagraph: 'Esse contexto ajuda a entender onde o Tailwind CSS se encaixa nesse ecossistema.',
            highlight: ['CSS', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '/* CSS tradicional */\n.botao {\n  padding: 8px 16px;\n  border-radius: 8px;\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Frameworks provide ready-made structures and features for development. Pre-processors add features to writing CSS. Processing tools transform CSS files during development.',
            endParagraph: 'This context helps explain where Tailwind CSS fits in this ecosystem.',
            highlight: ['CSS', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '/* Traditional CSS */\n.button {\n  padding: 8px 16px;\n  border-radius: 8px;\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tailwind CSS',
      en: 'Tailwind CSS'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tailwind CSS é uma abordagem de estilização baseada em classes utilitárias. Em vez de criar uma classe própria para cada componente e escrever todas as propriedades CSS dentro dela, podemos combinar classes que representam estilos específicos.',
            endParagraph: 'O objetivo do Tailwind é permitir a construção de interfaces combinando pequenas classes de estilo.',
            highlight: ['Tailwind', 'CSS'],
            codeLanguage: 'HTML',
            code: '<button class="bg-blue-600 text-white px-4 py-2 rounded-lg">\n  Comprar\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.bg-blue-600 { background-color: #2563eb; }\n.text-white { color: #ffffff; }\n.px-4 { padding-left: 1rem; padding-right: 1rem; }\n.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }\n.rounded-lg { border-radius: 0.5rem; }'
              }
            ]
          },
          en: {
            firstParagraph: 'Tailwind CSS is a styling approach based on utility classes. Instead of creating your own class for each component and writing every CSS property inside it, we can combine classes that represent specific styles.',
            endParagraph: 'The goal of Tailwind is to let you build interfaces by combining small style classes.',
            highlight: ['Tailwind', 'CSS'],
            codeLanguage: 'HTML',
            code: '<button class="bg-blue-600 text-white px-4 py-2 rounded-lg">\n  Buy\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.bg-blue-600 { background-color: #2563eb; }\n.text-white { color: #ffffff; }\n.px-4 { padding-left: 1rem; padding-right: 1rem; }\n.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }\n.rounded-lg { border-radius: 0.5rem; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Utility-first',
      en: 'Utility-first'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'No modelo utility-first, cada classe representa uma pequena responsabilidade de estilo, como espaçamento, cor, tamanho ou alinhamento.',
            endParagraph: 'Em vez de criar uma classe que representa todo o componente, o Tailwind combina utilitários para construir sua aparência.',
            highlight: ['utility-first', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '.card {\n  padding: 1rem;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="p-4 rounded-lg">\n  Conteúdo\n</div>'
              }
            ],
            onlyCode: true
          },
          en: {
            firstParagraph: 'In the utility-first model, each class represents a small styling responsibility, like spacing, color, size or alignment.',
            endParagraph: 'Instead of creating a class that represents the whole component, Tailwind combines utilities to build its appearance.',
            highlight: ['utility-first', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '.card {\n  padding: 1rem;\n}',
            additionalCode: [
              {
                codeLanguage: 'HTML',
                code: '<div class="p-4 rounded-lg">\n  Content\n</div>'
              }
            ],
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Classes utilitárias',
      en: 'Utility classes'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'As classes utilitárias do Tailwind representam pequenas decisões de estilo, relacionadas a espaçamento, tamanho, cor e tipografia.',
            endParagraph: 'A combinação dessas pequenas classes permite construir estilos diretamente na marcação.',
            highlight: ['Tailwind'],
            codeLanguage: 'HTML',
            code: '<p class="text-lg font-bold">\n  Olá!\n</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.text-lg { font-size: 1.125rem; line-height: 1.75rem; }\n.font-bold { font-weight: 700; }'
              }
            ]
          },
          en: {
            firstParagraph: 'Tailwind utility classes represent small styling decisions, related to spacing, size, color and typography.',
            endParagraph: 'Combining these small classes lets you build styles directly in the markup.',
            highlight: ['Tailwind'],
            codeLanguage: 'HTML',
            code: '<p class="text-lg font-bold">\n  Hello!\n</p>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.text-lg { font-size: 1.125rem; line-height: 1.75rem; }\n.font-bold { font-weight: 700; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Espaçamento',
      en: 'Spacing'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'No Tailwind, classes utilitárias podem representar propriedades relacionadas a margin e padding.',
            endParagraph: 'p-4 representa padding e mt-4 representa margin-top — o aluno já conhece essas propriedades do CSS.',
            highlight: ['padding', 'margin-top', 'CSS'],
            codeLanguage: 'HTML',
            code: '<div class="p-4 mt-4">\n  Conteúdo\n</div>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.p-4 { padding: 1rem; }\n.mt-4 { margin-top: 1rem; }'
              }
            ]
          },
          en: {
            firstParagraph: 'In Tailwind, utility classes can represent properties related to margin and padding.',
            endParagraph: 'p-4 represents padding and mt-4 represents margin-top — you already know these properties from CSS.',
            highlight: ['padding', 'margin-top', 'CSS'],
            codeLanguage: 'HTML',
            code: '<div class="p-4 mt-4">\n  Content\n</div>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.p-4 { padding: 1rem; }\n.mt-4 { margin-top: 1rem; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Cores',
      en: 'Colors'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tailwind fornece classes utilitárias para definir cores de elementos e textos.',
            endParagraph: 'bg-* define a cor de fundo e text-* define a cor do texto — em vez de escrever uma declaração CSS para cada cor, usamos classes utilitárias.',
            highlight: ['CSS'],
            codeLanguage: 'HTML',
            code: '<button class="bg-blue-600 text-white">\n  Salvar\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.bg-blue-600 { background-color: #2563eb; }\n.text-white { color: #ffffff; }'
              }
            ]
          },
          en: {
            firstParagraph: 'Tailwind provides utility classes to set colors for elements and text.',
            endParagraph: 'bg-* sets the background color and text-* sets the text color — instead of writing a CSS declaration for every color, we use utility classes.',
            highlight: ['CSS'],
            codeLanguage: 'HTML',
            code: '<button class="bg-blue-600 text-white">\n  Save\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.bg-blue-600 { background-color: #2563eb; }\n.text-white { color: #ffffff; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tipografia',
      en: 'Typography'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Assim como no CSS, podemos controlar características como tamanho, peso e alinhamento do texto.',
            endParagraph: 'O aluno continua trabalhando com conceitos de tipografia que já conhece do CSS.',
            highlight: ['CSS'],
            codeLanguage: 'HTML',
            code: '<h1 class="text-2xl font-bold">\n  Título\n</h1>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.text-2xl { font-size: 1.5rem; line-height: 2rem; }\n.font-bold { font-weight: 700; }'
              }
            ]
          },
          en: {
            firstParagraph: 'Just like in CSS, we can control characteristics like text size, weight and alignment.',
            endParagraph: 'You keep working with typography concepts you already know from CSS.',
            highlight: ['CSS'],
            codeLanguage: 'HTML',
            code: '<h1 class="text-2xl font-bold">\n  Title\n</h1>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.text-2xl { font-size: 1.5rem; line-height: 2rem; }\n.font-bold { font-weight: 700; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Flexbox com Tailwind',
      en: 'Flexbox with Tailwind'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tailwind não cria um novo sistema de layout. Ele fornece classes utilitárias que representam propriedades do CSS.',
            endParagraph: 'flex equivale a display: flex, items-center a align-items: center e justify-between a justify-content: space-between — o conhecimento de Flexbox continua diretamente útil.',
            highlight: ['Flexbox', 'CSS'],
            codeLanguage: 'HTML',
            code: '<div class="flex items-center justify-between">\n  <span>Item 1</span>\n  <span>Item 2</span>\n</div>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.flex { display: flex; }\n.items-center { align-items: center; }\n.justify-between { justify-content: space-between; }'
              }
            ]
          },
          en: {
            firstParagraph: 'Tailwind does not create a new layout system. It provides utility classes that represent CSS properties.',
            endParagraph: 'flex maps to display: flex, items-center to align-items: center and justify-between to justify-content: space-between — your Flexbox knowledge is still directly useful.',
            highlight: ['Flexbox', 'CSS'],
            codeLanguage: 'HTML',
            code: '<div class="flex items-center justify-between">\n  <span>Item 1</span>\n  <span>Item 2</span>\n</div>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.flex { display: flex; }\n.items-center { align-items: center; }\n.justify-between { justify-content: space-between; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Grid com Tailwind',
      en: 'Grid with Tailwind'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O mesmo princípio pode ser aplicado ao CSS Grid.',
            endParagraph: 'Tailwind fornece uma forma mais direta de aplicar propriedades do Grid sem abandonar o modelo do CSS.',
            highlight: ['Grid', 'CSS'],
            codeLanguage: 'HTML',
            code: '<div class="grid grid-cols-3 gap-4">\n  <div>1</div>\n  <div>2</div>\n  <div>3</div>\n</div>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.grid { display: grid; }\n.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }\n.gap-4 { gap: 1rem; }'
              }
            ]
          },
          en: {
            firstParagraph: 'The same principle can be applied to CSS Grid.',
            endParagraph: 'Tailwind provides a more direct way to apply Grid properties without abandoning the CSS model.',
            highlight: ['Grid', 'CSS'],
            codeLanguage: 'HTML',
            code: '<div class="grid grid-cols-3 gap-4">\n  <div>1</div>\n  <div>2</div>\n  <div>3</div>\n</div>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.grid { display: grid; }\n.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }\n.gap-4 { gap: 1rem; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Responsividade',
      en: 'Responsiveness'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tailwind permite aplicar classes diferentes de acordo com o tamanho da tela, utilizando seus breakpoints.',
            endParagraph: 'text-sm representa o comportamento padrão, e md:text-lg entra em vigor a partir do breakpoint md — o conceito continua sendo responsividade.',
            highlight: ['responsividade'],
            codeLanguage: 'HTML',
            code: '<div class="text-sm md:text-lg">\n  Texto responsivo\n</div>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Tailwind lets you apply different classes depending on the screen size, using its breakpoints.',
            endParagraph: 'text-sm represents the default behavior, and md:text-lg kicks in from the md breakpoint onward — the concept is still responsiveness.',
            highlight: ['responsiveness'],
            codeLanguage: 'HTML',
            code: '<div class="text-sm md:text-lg">\n  Responsive text\n</div>',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Estados: hover e focus',
      en: 'States: hover and focus'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tailwind permite aplicar utilitários quando um elemento está em determinado estado, como hover ou focus.',
            endParagraph: 'Os prefixos de estado permitem expressar comportamentos que no CSS tradicional seriam escritos com pseudo-classes.',
            highlight: ['CSS'],
            codeLanguage: 'HTML',
            code: '<button class="bg-blue-600 hover:bg-blue-700 focus:ring-2">\n  Enviar\n</button>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Tailwind lets you apply utilities when an element is in a certain state, like hover or focus.',
            endParagraph: 'State prefixes let you express behavior that traditional CSS would write with pseudo-classes.',
            highlight: ['CSS'],
            codeLanguage: 'HTML',
            code: '<button class="bg-blue-600 hover:bg-blue-700 focus:ring-2">\n  Submit\n</button>',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Dark mode',
      en: 'Dark mode'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tailwind permite definir estilos específicos para o modo escuro utilizando o modificador dark:.',
            endParagraph: 'O mesmo elemento pode possuir estilos diferentes dependendo do modo de exibição.',
            highlight: ['modo escuro'],
            codeLanguage: 'HTML',
            code: '<div class="bg-white text-black dark:bg-gray-900 dark:text-white">\n  Conteúdo\n</div>',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Tailwind lets you define specific styles for dark mode using the dark: modifier.',
            endParagraph: 'The same element can have different styles depending on the display mode.',
            highlight: ['dark mode'],
            codeLanguage: 'HTML',
            code: '<div class="bg-white text-black dark:bg-gray-900 dark:text-white">\n  Content\n</div>',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Customização',
      en: 'Customization'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Projetos reais podem possuir cores, espaçamentos, fontes e outros valores próprios. O Tailwind permite adaptar seu sistema às necessidades da aplicação.',
            endParagraph: 'A ideia é utilizar o Tailwind como parte do projeto, e não ficar limitado apenas aos valores padrão.',
            highlight: ['Tailwind'],
            codeLanguage: 'JavaScript',
            code: '// tailwind.config.js (conceitual)\ntheme: {\n  colors: {\n    marca: "#2563eb"\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Real projects can have their own colors, spacing, fonts and other values. Tailwind lets you adapt its system to the needs of the application.',
            endParagraph: 'The idea is to use Tailwind as part of the project, instead of being limited to just the default values.',
            highlight: ['Tailwind'],
            codeLanguage: 'JavaScript',
            code: '// tailwind.config.js (conceptual)\ntheme: {\n  colors: {\n    brand: "#2563eb"\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Configuração',
      en: 'Configuration'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Ferramentas como Tailwind precisam saber como o projeto será processado e quais recursos devem ser utilizados.',
            endParagraph: 'Configuração permite integrar o Tailwind às necessidades do projeto.',
            highlight: ['Tailwind', 'Configuração'],
            codeLanguage: 'JavaScript',
            code: '// tailwind.config.js (conceitual)\ntheme: {\n  colors: {\n    marca: "#2563eb"\n  }\n}',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Tools like Tailwind need to know how the project will be processed and which features should be used.',
            endParagraph: 'Configuration lets you integrate Tailwind with the needs of the project.',
            highlight: ['Tailwind', 'Configuration'],
            codeLanguage: 'JavaScript',
            code: '// tailwind.config.js (conceptual)\ntheme: {\n  colors: {\n    brand: "#2563eb"\n  }\n}',
            onlyCode: true
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Componentização',
      en: 'Componentization'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Interfaces reais possuem elementos que aparecem várias vezes, como botões, cards e campos. Podemos combinar classes utilitárias dentro de componentes reutilizáveis.',
            endParagraph: 'Tailwind fornece os estilos. A tecnologia da aplicação pode organizar esses estilos em componentes reutilizáveis.',
            highlight: ['Tailwind', 'componentes'],
            codeLanguage: 'HTML',
            code: '<button class="rounded-lg px-4 py-2 font-medium">\n  Salvar\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.rounded-lg { border-radius: 0.5rem; }\n.px-4 { padding-left: 1rem; padding-right: 1rem; }\n.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }\n.font-medium { font-weight: 500; }'
              }
            ]
          },
          en: {
            firstParagraph: 'Real interfaces have elements that show up several times, like buttons, cards and fields. We can combine utility classes inside reusable components.',
            endParagraph: 'Tailwind provides the styles. The application\'s technology can organize those styles into reusable components.',
            highlight: ['Tailwind', 'components'],
            codeLanguage: 'HTML',
            code: '<button class="rounded-lg px-4 py-2 font-medium">\n  Save\n</button>',
            additionalCode: [
              {
                codeLanguage: 'CSS',
                code: '.rounded-lg { border-radius: 0.5rem; }\n.px-4 { padding-left: 1rem; padding-right: 1rem; }\n.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }\n.font-medium { font-weight: 500; }'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: {
      pt: 'Tailwind e CSS',
      en: 'Tailwind and CSS'
    },
    activities: [
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'Tailwind não elimina os conceitos fundamentais de CSS. As classes utilitárias representam propriedades e conceitos que continuam pertencendo ao CSS.',
            endParagraph: 'Quanto melhor o conhecimento de CSS, mais fácil é compreender o que as classes utilitárias do Tailwind estão fazendo.',
            highlight: ['CSS', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '/* CSS tradicional */\n.card {\n  padding: 1rem;\n}\n\n/* Tailwind equivalente: class="p-4" */',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Tailwind does not remove the fundamental concepts of CSS. Utility classes represent properties and concepts that still belong to CSS.',
            endParagraph: 'The better your CSS knowledge, the easier it is to understand what Tailwind utility classes are doing.',
            highlight: ['CSS', 'Tailwind'],
            codeLanguage: 'CSS',
            code: '/* Traditional CSS */\n.card {\n  padding: 1rem;\n}\n\n/* Tailwind equivalent: class="p-4" */',
            onlyCode: true
          }
        }
      },
      {
        type: 'theory',
        content: {
          pt: {
            firstParagraph: 'O Tailwind pode ser entendido como outra forma de aplicar conceitos que você já aprendeu em CSS.',
            endParagraph: 'Por isso, aprender CSS antes de Tailwind continua sendo importante.',
            highlight: ['Tailwind', 'CSS'],
            codeLanguage: 'CSS',
            code: '/* CSS tradicional */\n.card {\n  padding: 1rem;\n}\n\n/* Tailwind equivalente: class="p-4" */',
            onlyCode: true
          },
          en: {
            firstParagraph: 'Tailwind can be understood as another way to apply concepts you already learned in CSS.',
            endParagraph: 'That is why learning CSS before Tailwind is still important.',
            highlight: ['Tailwind', 'CSS'],
            codeLanguage: 'CSS',
            code: '/* Traditional CSS */\n.card {\n  padding: 1rem;\n}\n\n/* Tailwind equivalent: class="p-4" */',
            onlyCode: true
          }
        }
      }
    ]
  }
]

/**
 * Lições de um módulo específico de uma área. Os módulos básicos têm uma
 * função dedicada cada um (`seedHtmlBasicLessons` e companhia, acima); daqui
 * em diante o mesmo procedimento é parametrizado, já que a única coisa que
 * muda entre as áreas é a área, o índice do módulo e o array de lições.
 */
type ModuleLessonsSeed = {
  /** Coluna `areas.name` — nunca um `id` literal (autoincrement, imprevisível). */
  areaName: string;
  /** `modules.index`: 0 é o módulo básico, 1 o intermediário. */
  moduleIndex: number;
  lessons: LessonSeed[];
}

const INTERMEDIATE_MODULES: ModuleLessonsSeed[] = [
  { areaName: 'HTML', moduleIndex: 1, lessons: HTML_INTERMEDIATE_LESSONS },
  { areaName: 'CSS', moduleIndex: 1, lessons: CSS_INTERMEDIATE_LESSONS },
  { areaName: 'JavaScript', moduleIndex: 1, lessons: JS_INTERMEDIATE_LESSONS }
]

async function seedModuleLessons (
  localeIds: Map<LocaleCode, number>,
  { areaName, moduleIndex, lessons }: ModuleLessonsSeed
): Promise<void> {
  const area = await prisma.areas.findFirst({ where: { name: areaName }, orderBy: { id: 'asc' } })
  if (area === null) {
    console.log(`Área ${areaName} não encontrada — pulando lições do módulo ${moduleIndex}.`)
    return
  }

  const module = await prisma.modules.findFirst({
    where: { area_id: area.id, index: moduleIndex }
  })
  if (module === null) {
    console.log(`Módulo ${moduleIndex} de ${areaName} não encontrado — pulando suas lições.`)
    return
  }

  // Guarda escopada a este módulo, pelo mesmo motivo das funções dos módulos
  // básicos: o guard de `seedAreasAndModules` já está satisfeito em qualquer
  // banco seedado, e uma contagem global de `lessons` faria o conteúdo de uma
  // área bloquear o das outras.
  const existingLessons = await prisma.lessons.count({ where: { module_id: module.id } })
  if (existingLessons > 0) {
    console.log(`Lições do módulo ${moduleIndex} de ${areaName} já seedadas (${existingLessons} encontradas) — pulando.`)
    return
  }

  for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
    const lessonSeed = lessons[lessonIndex]
    const lesson = await prisma.lessons.create({
      data: { module_id: module.id, index: lessonIndex }
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

  const activityCount = lessons.reduce((total, lesson) => total + lesson.activities.length, 0)
  console.log(`Seed de conteúdo concluído: ${lessons.length} lições, ${activityCount} atividades no módulo ${moduleIndex} de ${areaName}.`)
}

async function seedIntermediateLessons (localeIds: Map<LocaleCode, number>): Promise<void> {
  for (const moduleSeed of INTERMEDIATE_MODULES) {
    await seedModuleLessons(localeIds, moduleSeed)
  }
}

// `moduleIndex: 2` é o terceiro módulo ("Avançado") de cada área — mesmo
// `seedModuleLessons` genérico do Intermediário, só um array novo em vez de
// reaproveitar `INTERMEDIATE_MODULES` (nome já específico daquele nível).
const ADVANCED_MODULES: ModuleLessonsSeed[] = [
  { areaName: 'HTML', moduleIndex: 2, lessons: HTML_ADVANCED_LESSONS },
  { areaName: 'CSS', moduleIndex: 2, lessons: CSS_ADVANCED_LESSONS },
  { areaName: 'JavaScript', moduleIndex: 2, lessons: JS_ADVANCED_LESSONS }
]

async function seedAdvancedLessons (localeIds: Map<LocaleCode, number>): Promise<void> {
  for (const moduleSeed of ADVANCED_MODULES) {
    await seedModuleLessons(localeIds, moduleSeed)
  }
}

// `moduleIndex: 3` é o quarto módulo de cada área — "Além do HTML"
// (introdução ao React), "Além do CSS" (introdução ao Tailwind CSS) e "Além
// do JavaScript" (Node.js e Express). O nome do módulo em si continua o
// genérico "Módulo 4"/"Module 4" (mesmo padrão dos módulos 1-3): o título do
// card no app sempre mostra o nome genérico; o subtítulo descritivo (ex.:
// "Além do HTML") vem de `module_translations.subtitle`, populado por
// `MODULE_SUBTITLES`/`seedModuleSubtitles()`, não daqui.
const BEYOND_MODULES: ModuleLessonsSeed[] = [
  { areaName: 'HTML', moduleIndex: 3, lessons: HTML_BEYOND_LESSONS },
  { areaName: 'CSS', moduleIndex: 3, lessons: CSS_BEYOND_LESSONS },
  { areaName: 'JavaScript', moduleIndex: 3, lessons: JS_BEYOND_LESSONS }
]

async function seedBeyondLessons (localeIds: Map<LocaleCode, number>): Promise<void> {
  for (const moduleSeed of BEYOND_MODULES) {
    await seedModuleLessons(localeIds, moduleSeed)
  }
}

/**
 * Linha base do versionamento de conteúdo: uma `content_version` `0.0.0` por
 * idioma que ainda não tenha nenhuma.
 *
 * Guard escopado ao `locale_id`, nunca uma contagem global — senão o primeiro
 * idioma seedado bloquearia todos os outros, e um idioma novo (espanhol, por
 * exemplo) nunca ganharia seu marco zero. Mesmo motivo dos guards por
 * `module_id` das lições.
 *
 * É a partir daqui que o app compara: sem nenhuma linha, `GET /content-version`
 * não devolve nada para aquele idioma e o app simplesmente mantém o cache.
 */
async function seedContentVersions (localeIds: Map<LocaleCode, number>): Promise<void> {
  for (const [code, localeId] of localeIds) {
    const existing = await prisma.content_version.count({ where: { locale_id: localeId } })
    if (existing > 0) {
      console.log(`Versão de conteúdo de ${code} já existe (${existing}) — pulando.`)
      continue
    }

    await prisma.content_version.create({
      data: {
        locale_id: localeId,
        version: '0.0.0',
        changelog: 'Versão inicial do conteúdo.',
        released_at: new Date()
      }
    })
    console.log(`Versão de conteúdo 0.0.0 criada para ${code}.`)
  }
}

async function main (): Promise<void> {
  const localeIds = await seedLocales()
  await seedAreasAndModules(localeIds)
  await seedModuleSubtitles(localeIds)
  await seedHtmlBasicLessons(localeIds)
  await seedCssBasicLessons(localeIds)
  await seedJsBasicLessons(localeIds)
  await seedIntermediateLessons(localeIds)
  await seedAdvancedLessons(localeIds)
  await seedBeyondLessons(localeIds)
  await seedContentVersions(localeIds)
}

/*
 * Semeia apenas quando este arquivo é **executado** (`pnpm seed`), não quando é
 * importado.
 *
 * Os arrays `*_LESSONS` acima são exportados para que `checkSeedDrift.ts` possa
 * compará-los com o banco — e um verificador que semeasse o banco só por ser
 * importado seria uma armadilha. `argv[1]` é o arquivo passado ao tsx, então a
 * comparação com `import.meta.url` distingue os dois casos.
 */
const executadoDiretamente =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (executadoDiretamente) {
  main()
    .catch((error) => {
      console.error(error)
      process.exitCode = 1
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
