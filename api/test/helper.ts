// This file contains code that we reuse between our tests.
import * as path from 'node:path'
import * as test from 'node:test'
import helper from 'fastify-cli/helper.js'
import type { FastifyInstance } from 'fastify'
import type { MailMessage } from '../src/plugins/mailer.js'

// @fastify/autoload only auto-detects TS loaders preloaded via `--require`;
// `tsx` is registered via `--import`, so it isn't picked up automatically.
process.env.FASTIFY_AUTOLOAD_TYPESCRIPT ??= '1'

// Os links dos e-mails exigem PUBLIC_URL fora de desenvolvimento, e os testes
// rodam sem NODE_ENV. Valor fixo, para o teste nunca depender do .env de quem roda.
process.env.PUBLIC_URL = 'http://localhost:3000'

export type TestContext = {
  after: typeof test.after
}

const AppPath = path.join(import.meta.dirname, '..', 'src', 'app.ts')

const outboxes = new WeakMap<FastifyInstance, MailMessage[]>()

/**
 * E-mails que a app enviou durante o teste. Os envios são assíncronos: chame
 * `await app.mailer.flush()` antes de ler.
 */
function outboxOf (app: FastifyInstance): MailMessage[] {
  return outboxes.get(app) ?? []
}

// Fill in this config with all the configurations
// needed for testing the application
function config () {
  return {
    skipOverride: true // Register our application with fastify-plugin
  }
}

// Automatically build and tear down our instance.
//
// O retorno é anotado como `FastifyInstance` porque `fastify-cli/helper.js` não
// tem tipos: sem a anotação, `app` seria `any` e todo teste perderia a checagem
// de tipo em `app.inject`/`app.prisma` (o decorator `prisma` vem da module
// augmentation em `src/plugins/prisma.ts`).
async function build (t: TestContext): Promise<FastifyInstance> {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, config()) as FastifyInstance

  // Nenhum teste manda e-mail de verdade, mesmo com RESEND_API_KEY no .env:
  // os envios caem numa caixa em memória, lida com `outboxOf(app)`.
  const outbox: MailMessage[] = []
  app.mailer.transport = async (message) => { outbox.push(message) }
  outboxes.set(app, outbox)

  // Tear down our app after we are done
  // eslint-disable-next-line no-void
  t.after(() => void app.close())

  return app
}

/**
 * Coloca a app em modo de desenvolvimento pela duração do teste, restaurando o
 * valor anterior no final.
 *
 * As rotas de escrita do catálogo (areas/modules/lessons/activities) só são
 * registradas com `NODE_ENV=development`, e nenhum script de teste define essa
 * variável — sem chamar isto **antes** de `build(t)`, a rota simplesmente não
 * existe e o teste recebe 404. Mesmo padrão de `test/plugins/swagger.test.ts`.
 */
function useDevelopmentEnv (t: TestContext) {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  t.after(() => { process.env.NODE_ENV = previousEnv })
}

/**
 * Roda `fn` com `NODE_ENV` trocado e restaura depois. Serve para alternar entre
 * desenvolvimento e "fora dele" **por requisição** na mesma app: regras como a
 * conta de teste e a checagem de domínio leem o ambiente a cada chamada, não no
 * boot (ao contrário das rotas de escrita de conteúdo, ver `useDevelopmentEnv`).
 */
async function withNodeEnv<T> (nodeEnv: string | undefined, fn: () => Promise<T>): Promise<T> {
  const previous = process.env.NODE_ENV
  if (nodeEnv === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = nodeEnv
  try {
    return await fn()
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previous
  }
}

export {
  config,
  build,
  outboxOf,
  useDevelopmentEnv,
  withNodeEnv
}
