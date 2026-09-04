// This file contains code that we reuse between our tests.
import * as path from 'node:path'
import * as test from 'node:test'
import helper from 'fastify-cli/helper.js'
import type { FastifyInstance } from 'fastify'

// @fastify/autoload only auto-detects TS loaders preloaded via `--require`;
// `tsx` is registered via `--import`, so it isn't picked up automatically.
process.env.FASTIFY_AUTOLOAD_TYPESCRIPT ??= '1'

export type TestContext = {
  after: typeof test.after
}

const AppPath = path.join(import.meta.dirname, '..', 'src', 'app.ts')

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

export {
  config,
  build,
  useDevelopmentEnv
}
