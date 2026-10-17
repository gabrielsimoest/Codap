/**
 * Validação de UI do dashboard via Playwright.
 *
 * Existe porque `dashboard/CLAUDE.md` exige que toda alteração visível na
 * interface seja verificada antes de ser dada como concluída — e uma regra que
 * depende de alguém lembrar de abrir o navegador não é uma regra. Este script
 * percorre os fluxos principais, tira capturas e **falha se houver erro no
 * console**, que é o defeito que passa despercebido com mais facilidade.
 *
 * Uso: com a API (`pnpm api:dev`) e o dashboard (`pnpm dash:dev`) no ar,
 *   pnpm --filter codap-dashboard verify:ui
 *
 * As capturas vão para `dashboard/.playwright/`, que não é versionado.
 */

import { mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const BASE_URL = process.env.DASHBOARD_URL ?? 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL ?? 'http://localhost:3000'
const SHOT_DIR = fileURLToPath(new URL('../.playwright/', import.meta.url))

/**
 * Opções de captura.
 *
 * `page.screenshot` aceita caminho de arquivo, nunca um objeto URL. E
 * `animations: 'disabled'` é obrigatório aqui: os diálogos do Radix entram com
 * um fade de 200 ms, e sem congelar a animação a captura sai no meio dela —
 * tudo semitransparente, parecendo um bug de fundo que não existe.
 */
const shot = (name, options = {}) => ({
  path: `${SHOT_DIR}${name}`,
  animations: 'disabled',
  ...options
})

/** Ruído conhecido do ambiente de desenvolvimento, não defeito da página. */
const IGNORED_CONSOLE = [
  'Download the React DevTools',
  '[vite] connecting',
  '[vite] connected'
]

const steps = []

/**
 * Botão "Editar" do último (ou, com `first`, do primeiro) cartão de atividade
 * de um tipo, na lição aberta. Procura pelo tipo, e não pela posição: a ordem
 * das atividades muda quando entra conteúdo novo (os pilotos de `code_blank` e
 * do "ache o erro" viraram as últimas atividades das lições do Módulo 1).
 */
function editActivityOfType (page, type, { first = false } = {}) {
  const cards = page.locator('main [data-slot="card"]')
    .filter({ has: page.getByText(type, { exact: true }) })
  return (first ? cards.first() : cards.last())
    .getByRole('button', { name: 'Editar', exact: true })
}

function step (name, fn) {
  steps.push({ name, fn })
}

step('a página carrega e lista as áreas', async (page) => {
  await page.goto(BASE_URL)
  await page.getByRole('combobox', { name: 'Área' }).waitFor({ state: 'visible', timeout: 15_000 })
  await page.getByText('Módulos').first().waitFor({ timeout: 15_000 })
  await page.screenshot(shot('01-inicial.png', { fullPage: true }))
})

step('a árvore mostra módulos e lições da área', async (page) => {
  const modules = await page.getByTestId('module-node').count()
  const lessons = await page.getByTestId('lesson-node').count()
  if (modules === 0) {
    throw new Error('a árvore não renderizou nenhum módulo')
  }
  if (lessons === 0) {
    throw new Error('a árvore não renderizou nenhuma lição')
  }
})

step('selecionar uma lição abre o painel de atividades', async (page) => {
  await page.getByTestId('lesson-node').first().click()
  await page.getByRole('button', { name: 'Nova atividade' }).waitFor({ timeout: 10_000 })
  await page.screenshot(shot('02-licao.png', { fullPage: true }))
})

step('o diálogo de exportação abre com recorte e idioma', async (page) => {
  await page.getByRole('button', { name: 'Exportar' }).click()
  await page.getByText('Exportar conteúdo').waitFor({ timeout: 10_000 })
  await page.getByRole('button', { name: /Baixar \.md/ }).waitFor()
  await page.screenshot(shot('03-exportar.png'))
  await page.keyboard.press('Escape')
})

/*
 * Regressão: o diálogo saía impresso em todas as páginas do PDF.
 *
 * Ele é renderizado num portal fora da árvore do `App`, então `.print-hidden`
 * não o alcançava, e por ser `position: fixed` o Chrome o repetia em cada
 * página. Fechá-lo antes de imprimir não resolve — a animação de saída de
 * 200 ms sempre ganha do `setTimeout` de 150 ms. Quem resolve é a regra em
 * `index.css`, e é ela que este passo verifica.
 */
step('o diálogo não vai para o papel', async (page) => {
  await page.getByRole('button', { name: 'Exportar' }).click()
  await page.locator('[data-slot="dialog-content"]').waitFor({ timeout: 10_000 })

  await page.emulateMedia({ media: 'print' })
  let visivel
  try {
    visivel = await page.locator('[data-slot="dialog-content"]').isVisible()
  } finally {
    // O `finally` fecha o diálogo e restaura a mídia mesmo quando o passo
    // reprova: sem isso, uma falha aqui deixaria a página em modo impressão com
    // o diálogo aberto e derrubaria em cascata todos os passos seguintes,
    // escondendo qual era o defeito real.
    await page.emulateMedia({ media: null })
    await page.keyboard.press('Escape')
  }

  if (visivel) {
    throw new Error('o diálogo continua visível na mídia de impressão')
  }
})

step('o diálogo de áreas abre e lista as áreas', async (page) => {
  await page.getByRole('button', { name: 'Áreas' }).click()
  await page.getByRole('heading', { name: 'Áreas' }).waitFor({ timeout: 10_000 })
  await page.screenshot(shot('04-areas.png'))
  await page.keyboard.press('Escape')
})

step('o diálogo de publicação mostra a versão vigente', async (page) => {
  await page.getByRole('button', { name: 'Publicar', exact: true }).click()
  await page.getByText('Publicar versão do conteúdo').waitFor({ timeout: 10_000 })
  await page.getByText('Versão vigente').waitFor({ timeout: 10_000 })

  // A versão precisa chegar de fato da API — um painel vazio passaria batido.
  const versoes = await page.locator('[role="dialog"] code.font-mono').count()
  if (versoes === 0) {
    throw new Error('nenhuma versão vigente foi exibida')
  }

  await page.screenshot(shot('07-publicar.png'))
  await page.keyboard.press('Escape')
})

step('a bolha do React Query aparece em desenvolvimento', async (page) => {
  const bubble = page.getByLabel('Open Tanstack query devtools')
  await bubble.waitFor({ timeout: 10_000 })
})

step('o formulário de atividade abre com o preview de highlight', async (page) => {
  // Escopo no painel de detalhe e nome exato: a árvore tem botões "Editar
  // módulo"/"Editar lição", que um match por substring pegaria primeiro.
  await page.locator('main').getByRole('button', { name: 'Editar', exact: true }).first().click()
  await page.getByText('Termos destacados').first().waitFor({ timeout: 10_000 })

  // A prévia precisa mostrar o texto com os termos efetivamente pintados, não
  // só a contagem de ocorrências.
  await page.getByText('Prévia do destaque').waitFor({ timeout: 10_000 })
  const painted = await page.locator('.space-y-2.rounded-md.border span.text-primary').count()
  if (painted === 0) {
    throw new Error('a prévia não pintou nenhum termo')
  }

  // Sem esses campos no formulário (e no zod), salvar uma teoria apagava
  // `noTerminal`/`terminalCode` do conteúdo em silêncio.
  await page.getByLabel('Sem terminal (noTerminal)').waitFor({ timeout: 10_000 })
  await page.getByLabel('Código do terminal (terminalCode)').waitFor({ timeout: 10_000 })

  await page.screenshot(shot('05-atividade.png'))
  await page.keyboard.press('Escape')
})

/*
 * A primeira lição de HTML tem prática `option` com pool. Se o formulário não
 * carregar `pool` de volta, salvar pelo dashboard apaga o sorteio em silêncio.
 * A primeira `option` da lição, não a última: a última é o "ache o erro", que
 * fica fora dos pools.
 */
step('o formulário de múltipla escolha mostra o sorteio', async (page) => {
  await editActivityOfType(page, 'option', { first: true }).click()
  await page.getByText('Alternativas').first().waitFor({ timeout: 10_000 })
  await page.getByText('Sorteio').waitFor({ timeout: 10_000 })
  await page.getByLabel('Trecho de código').waitFor({ timeout: 10_000 })

  const pool = await page.getByLabel('Pool').inputValue()
  if (pool.length === 0) {
    throw new Error('o campo Pool veio vazio para uma atividade com pool')
  }

  await page.screenshot(shot('06-multipla-escolha.png'))
  await page.keyboard.press('Escape')
})

/*
 * A primeira lição de JavaScript tem um `code_blank` (piloto do Módulo 1). O
 * formulário precisa carregar o código e uma resposta por lacuna — sem isso,
 * salvar pelo dashboard apagaria o exercício em silêncio.
 */
step('o formulário de completar código carrega lacunas e respostas', async (page) => {
  await page.getByRole('combobox', { name: 'Área' }).click()
  await page.getByRole('option', { name: 'JavaScript' }).click()
  await page.getByTestId('lesson-node').first().click()
  await editActivityOfType(page, 'code_blank').click()
  await page.getByLabel('Resposta da lacuna 1').waitFor({ timeout: 10_000 })

  const answer = await page.getByLabel('Resposta da lacuna 1').inputValue()
  const code = await page.locator('#blank-code').inputValue()
  if (!code.includes('___') || answer.length === 0) {
    throw new Error('o formulário de code_blank não carregou o código com lacunas e a resposta')
  }

  await page.screenshot(shot('08-completar-codigo.png'))
  await page.keyboard.press('Escape')
})

// --- passos do "ache o erro" (optionsAsCode) aqui ---

/*
 * "Ache o erro": uma `option` existente (a primeira lição de JavaScript tem
 * várias) ganha o toggle de `optionsAsCode`; ligado, as alternativas viram
 * campos de código. Nada é salvo — o passo só liga o toggle no formulário e sai
 * com Escape, deixando a página como a encontrou (área JavaScript, lição aberta).
 */
step('o toggle "ache o erro" transforma as alternativas em campos de código', async (page) => {
  await editActivityOfType(page, 'option').click()
  const toggle = page.getByLabel('Alternativas como código (optionsAsCode)')
  await toggle.waitFor({ timeout: 10_000 })

  // Parte do estado em que a atividade veio: o conteúdo real pode já usar
  // optionsAsCode (é o objetivo do recurso), e o passo não deve depender disso.
  const codeFields = page.getByLabel(/^Alternativa \d+ \(código\)$/)
  const startedOn = await toggle.getAttribute('aria-checked') === 'true'
  const total = startedOn
    ? await codeFields.count()
    : await page.getByLabel(/^Alternativa \d+$/).count()
  if (startedOn !== (await codeFields.count() > 0)) {
    throw new Error('o toggle de optionsAsCode e os campos de alternativa estão em desacordo')
  }

  if (!startedOn) {
    await toggle.click()
  }
  await page.getByLabel(/^Alternativa 1 \(código\)$/).waitFor({ timeout: 10_000 })
  if (await toggle.getAttribute('aria-checked') !== 'true') {
    throw new Error('o toggle de optionsAsCode não ligou')
  }
  if (await codeFields.count() !== total) {
    throw new Error('cada alternativa deveria virar um campo de código')
  }
  const tag = await codeFields.first().evaluate((element) => element.tagName)
  const mono = await codeFields.first().evaluate((element) => getComputedStyle(element).fontFamily)
  if (tag !== 'TEXTAREA' || !/mono/i.test(mono)) {
    throw new Error(`a alternativa em código deveria ser um textarea monoespaçado (veio ${tag} / ${mono})`)
  }

  // Linha de 31 caracteres: o aviso aparece na hora, antes de salvar.
  await codeFields.first().fill('x'.repeat(31))
  await page.getByText('o máximo é 30').waitFor({ timeout: 10_000 })

  await page.screenshot(shot('11-ache-o-erro.png'))
  await page.keyboard.press('Escape')
})

/*
 * `fill_blank` novo só até o formulário, como os passos abaixo: o tipo precisa
 * trazer o formulário dedicado, a prévia encaixa a resposta principal na
 * lacuna, e uma resposta com símbolo (`<p>`) é recusada no envio — é o que
 * mantém o formato longe de pedir `<`, `{` ou `;` no teclado do celular. Nada é
 * salvo: a instrução fica vazia, e o passo fecha com Escape.
 */
step('o formulário de digitar a resposta valida a lacuna e as respostas', async (page) => {
  await page.getByRole('button', { name: 'Nova atividade' }).click()
  await page.locator('#activity-type').fill('fill_blank')

  await page.getByLabel('Resposta 1', { exact: true }).waitFor({ timeout: 10_000 })
  await page.getByLabel('Ignorar maiúsculas (ignoreCase)').waitFor({ timeout: 10_000 })

  await page.locator('#fill-code').fill('nums.___(3);')
  await page.getByLabel('Resposta 1', { exact: true }).fill('push')
  const preview = await page.getByTestId('fill-preview').textContent()
  if (preview !== 'nums.[push](3);') {
    throw new Error(`a prévia não encaixou a resposta: ${JSON.stringify(preview)}`)
  }

  await page.getByLabel('Resposta 1', { exact: true }).fill('<p>')
  await page.getByRole('button', { name: 'Criar atividade' }).click()
  await page.getByText('Use só letras, números e hífen', { exact: false }).first().waitFor({ timeout: 10_000 })

  await page.screenshot(shot('12-digitar-resposta.png'))
  await page.keyboard.press('Escape')
  await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'detached', timeout: 10_000 })
})

// --- passos de reorder aqui ---

/*
 * Abre uma atividade `reorder` nova só até o formulário: o tipo é um campo de
 * texto livre, e escolher `reorder` precisa trazer o formulário dedicado (com a
 * lista de linhas e a prévia), não o editor de JSON cru. Nada é salvo — o passo
 * termina com Escape e espera o diálogo sumir, para o passo seguinte encontrar
 * a página como estava.
 */
step('o formulário de montar código preserva a indentação e mostra a prévia', async (page) => {
  await page.getByRole('button', { name: 'Nova atividade' }).click()
  await page.locator('#activity-type').fill('reorder')

  // `exact`: os botões "Subir a linha 1" etc. também contêm "linha 1".
  await page.getByLabel('Linha 1', { exact: true }).waitFor({ timeout: 10_000 })
  await page.getByLabel('Linha 3', { exact: true }).waitFor({ timeout: 10_000 })
  await page.getByTestId('reorder-preview').waitFor({ timeout: 10_000 })
  if (await page.getByLabel('Linha 4', { exact: true }).count() !== 0) {
    throw new Error('o formulário de reorder nasceu com mais de 3 linhas')
  }

  await page.getByLabel('Linha 1', { exact: true }).fill('<ul>')
  await page.getByLabel('Linha 2', { exact: true }).fill('  <li>Pão</li>')
  await page.getByLabel('Linha 3', { exact: true }).fill('</ul>')

  // A indentação digitada precisa chegar inteira à prévia (sem trim).
  const codigo = page.getByTestId('reorder-preview').locator('code')
  const segunda = await codigo.nth(1).textContent()
  if (segunda !== '  <li>Pão</li>') {
    throw new Error(`a prévia perdeu a indentação da linha 2: ${JSON.stringify(segunda)}`)
  }

  // Subir a linha 2 troca as duas de lugar, levando a indentação junto.
  await page.getByRole('button', { name: 'Subir a linha 2' }).click()
  const primeira = await codigo.nth(0).textContent()
  if (primeira !== '  <li>Pão</li>') {
    throw new Error(`subir a linha 2 não a levou para o topo: ${JSON.stringify(primeira)}`)
  }

  // A 4ª linha só aparece ao adicionar, e passar de 30 caracteres acende o contador.
  await page.getByRole('button', { name: 'Linha', exact: true }).click()
  await page.getByLabel('Linha 4', { exact: true }).fill('x'.repeat(31))
  await page.getByText('31/30').waitFor({ timeout: 10_000 })

  // O envio com a instrução vazia e a linha longa é barrado no cliente, e o
  // erro da linha aparece junto do campo, não só num aviso genérico.
  await page.getByRole('button', { name: 'Criar atividade' }).first().click()
  await page.getByText('Passa de 30 caracteres').first().waitFor({ timeout: 10_000 })

  await page.getByTestId('reorder-preview').scrollIntoViewIfNeeded()
  await page.screenshot(shot('09-reorder.png'))
  await page.keyboard.press('Escape')
  await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'hidden', timeout: 10_000 })
})

// --- passos de matching aqui ---

/*
 * Cria uma atividade `matching` só até o formulário: o tipo é um campo de
 * texto livre, e escolher `matching` precisa trazer o formulário dedicado (com
 * os pares), não o editor de JSON cru. Nada é salvo — o passo termina com
 * Escape, e o envio que ele tenta de propósito fica com a instrução vazia, o
 * que o zod barra no cliente antes de qualquer requisição.
 */
step('o formulário de ligar pares renderiza os pares e valida os limites', async (page) => {
  await page.getByRole('button', { name: 'Nova atividade' }).click()
  await page.locator('#activity-type').fill('matching')

  await page.getByLabel('Item da esquerda do par 1').waitFor({ timeout: 10_000 })
  await page.getByLabel('Item da direita do par 3').waitFor({ timeout: 10_000 })
  if (await page.getByLabel('Item da esquerda do par 4').count() !== 0) {
    throw new Error('o formulário de matching nasceu com mais de 3 pares')
  }

  await page.getByRole('button', { name: 'Par', exact: true }).click()
  await page.getByLabel('Item da direita do par 4').waitFor({ timeout: 10_000 })
  if (!await page.getByRole('button', { name: 'Par', exact: true }).isDisabled()) {
    throw new Error('o botão "Par" deveria desabilitar ao chegar em 4 pares')
  }

  // 25 caracteres na esquerda: o contador passa do limite e o envio é barrado.
  await page.getByLabel('Item da esquerda do par 1').fill('a'.repeat(25))
  await page.getByLabel('Item da direita do par 1').fill('Um parágrafo de texto')
  await page.getByText('25/20').waitFor({ timeout: 10_000 })
  await page.getByRole('button', { name: 'Criar atividade' }).first().click()
  await page.getByText('Use no máximo 20 caracteres.').waitFor({ timeout: 10_000 })

  await page.screenshot(shot('10-matching.png'))
  await page.keyboard.press('Escape')
  await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'hidden', timeout: 10_000 })
})

step('a lista de atividades mostra o destaque aplicado', async (page) => {
  const painted = await page.locator('main span.text-primary').count()
  if (painted === 0) {
    throw new Error('a visualização da atividade não pintou nenhum termo')
  }
})

async function main () {
  await rm(SHOT_DIR, { recursive: true, force: true })
  await mkdir(SHOT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() !== 'error' && message.type() !== 'warning') {
      return
    }
    const text = message.text()
    if (IGNORED_CONSOLE.some((ignored) => text.includes(ignored))) {
      return
    }
    consoleErrors.push(`[${message.type()}] ${text}`)
  })
  page.on('pageerror', (error) => { consoleErrors.push(`[pageerror] ${error.message}`) })

  // Respostas 4xx/5xx não viram erro de console de forma confiável: o Chromium
  // headless nem chega a pedir /favicon.ico, então um 404 real passava batido
  // aqui e só aparecia no navegador com interface. Escutar a rede fecha essa
  // lacuna. Ignora as respostas da API que os fluxos exercitam de propósito.
  page.on('response', (response) => {
    const status = response.status()
    if (status < 400) {
      return
    }
    const url = response.url()
    if (url.startsWith(API_URL)) {
      return
    }
    consoleErrors.push(`[http ${status}] ${url}`)
  })

  let failed = 0

  for (const { name, fn } of steps) {
    try {
      await fn(page)
      console.log(`  ok  ${name}`)
    } catch (error) {
      failed += 1
      console.log(`FAIL  ${name}`)
      console.log(`      ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
    }
  }

  await browser.close()

  if (consoleErrors.length > 0) {
    console.log('\nErros de console:')
    for (const entry of consoleErrors) {
      console.log(`  ${entry}`)
    }
  }

  const problems = failed + consoleErrors.length
  console.log(
    `\n${steps.length - failed}/${steps.length} passos, ${consoleErrors.length} erro(s) de console.`
  )
  console.log(`Capturas em dashboard/.playwright/`)

  process.exit(problems === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
