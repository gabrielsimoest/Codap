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

  await page.screenshot(shot('05-atividade.png'))
  await page.keyboard.press('Escape')
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
