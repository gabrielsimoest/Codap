# CLAUDE.md — API

Este arquivo complementa o [CLAUDE.md](../CLAUDE.md) da raiz (que contém as regras globais do projeto, sempre válidas aqui) com o contexto específico da API. Leia os dois antes de trabalhar em `/api`.

## Stack e estado atual

- **Fastify 5** com **TypeScript** (`~5.9`), estruturado via `fastify-cli` (`@fastify/autoload`, `fastify-plugin`).
- O pacote é **ESM puro** (`"type": "module"` em `package.json`). Isso tem uma consequência direta no código: **`__dirname`/`__filename`/`require` não existem em runtime** — use `import.meta.dirname` (já usado em `src/app.ts` e `test/helper.ts`) e `import` no lugar deles. Não reintroduza `__dirname`/`require` ao editar ou criar arquivos aqui.
- Testes com o runner nativo `node:test` + `c8` (cobertura) + `tsx` (execução direta de `.ts` sob ESM via `--import tsx`; `ts-node` foi removido do projeto por não suportar bem esse cenário).
- **Prisma já está instalado** (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`) e `api/prisma/schema.prisma` existe (`provider: postgresql`, gerador `prisma-client`), mas **ainda não há nenhum model definido, nenhuma migration e nenhum uso de Prisma em `src/`** — a integração com NeonDB/PostgreSQL está no início. `@fastify/swagger`/`@fastify/swagger-ui` **ainda não estão nas dependências**. Ao expandir o schema ou conectar o Prisma Client a um plugin/rota, siga as convenções de plugin do Fastify já usadas no projeto (registrar via `fastify-plugin` em `src/plugins`) em vez de criar uma estratégia de acesso a dados paralela.

## Estrutura de diretórios

```
api/
  src/
    app.ts            # ponto de entrada: registra plugins e routes via @fastify/autoload
    plugins/           # cross-cutting concerns, carregados ANTES das routes
      sensible.ts      # registra @fastify/sensible (helpers de erro HTTP)
      support.ts       # exemplo de decorator (fastify.someSupport())
    routes/             # endpoints da aplicação, carregados DEPOIS dos plugins
      root.ts           # GET / -> { root: true }
      example/index.ts  # GET /example -> "this is an example"
  test/
    helper.ts           # build() sobe a app inteira via fastify-cli/helper para testes com app.inject
    plugins/*.test.ts    # espelha src/plugins
    routes/*.test.ts     # espelha src/routes
    tsconfig.json
  dist/                 # saída compilada do tsc (gerada, não editar à mão)
  tsconfig.json          # extends "fastify-tsconfig"
```

### Convenção de autoload

`src/app.ts` registra dois `@fastify/autoload`: primeiro `src/plugins` (não encapsulado, plugins com `fastify-plugin` expõem decorators para toda a app), depois `src/routes` (encapsulado — cada plugin de rota tem seu próprio escopo). **Não edite as linhas marcadas "Do not touch" em `app.ts`.**

- Novo endpoint → novo arquivo/pasta em `src/routes` (um arquivo por recurso, ex. `users.ts`; se crescer demais, converta em pasta com `index.ts` e suba subplugins dentro dela). O nome do arquivo/pasta define o path (ex.: `routes/example/index.ts` → prefixo `/example`).
- Nova funcionalidade compartilhada entre rotas (auth, cache, decorators) → novo arquivo em `src/plugins`, envolvido em `fastify-plugin` (`fp`) quando precisar expor decorators/hooks para fora do escopo do plugin.

## Testes

- Runner: `node:test` nativo (não Jest/Vitest). Arquivos em `test/`, espelhando a estrutura de `src/`.
- `test/helper.ts` expõe `build(t)`, que sobe a aplicação completa via `fastify-cli/helper` (com `skipOverride: true`) e registra `t.after` para fechar a app — use isso para testes de integração de rota via `app.inject({ url: ... })` (ver `test/routes/example.test.ts`).
- Testes de plugin isolado instanciam `Fastify()` diretamente e registram só o plugin em questão (ver `test/plugins/support.test.ts`).
- `pnpm test` faz build (`build:ts`), typecheck dos testes (`test/tsconfig.json`) e roda `c8 node --import tsx --test "test/**/*.ts"`.
- `test/helper.ts` define `process.env.FASTIFY_AUTOLOAD_TYPESCRIPT ??= '1'` antes de subir a app: o `@fastify/autoload` só detecta suporte a TS automaticamente via loaders carregados com `--require`, e o `tsx` é carregado via `--import` — sem essa variável, o autoload falha ao importar os plugins `.ts` durante os testes.

## Comandos

O repositório é um workspace pnpm unificado (ver [CLAUDE.md](../CLAUDE.md) da raiz) — **instale as dependências uma única vez a partir da raiz** (`pnpm install`), nunca dentro de `/api` isoladamente. Os scripts abaixo podem ser rodados de duas formas equivalentes: com `cd api` e o comando direto, ou a partir da raiz com `pnpm --filter codap-api <script>` (há atalhos prontos em `package.json` da raiz: `api:dev`, `api:build`, `api:test`).

- Rodar em desenvolvimento (build + watch + reload): `pnpm dev`
- Apenas watch do TypeScript: `pnpm watch:ts`
- Build: `pnpm build:ts`
- Rodar em produção (build + start): `pnpm start`
- Rodar toda a suíte de testes: `pnpm test`
- Rodar um único arquivo de teste (após `pnpm run build:ts`):
  ```
  node --import tsx --test test/routes/example.test.ts
  ```
- Rodar um teste específico por nome:
  ```
  node --import tsx --test --test-name-pattern="support works standalone" test/plugins/support.test.ts
  ```
- **Não há script de lint configurado atualmente** no `package.json`.

## Regras específicas da API

- **Todo endpoint criado, removido ou alterado precisa, na mesma tarefa**: documentação Swagger atualizada (request, response, parâmetros, schemas e códigos de resposta) e um teste automatizado implementado e executado com sucesso. Um endpoint não está pronto se a documentação Swagger ou o teste correspondente estiverem faltando. Como Swagger ainda não está configurado no projeto, a primeira vez que for necessário adicioná-lo, faça isso seguindo o padrão de plugin do Fastify (registrado em `src/plugins`, como os demais) em vez de uma abordagem diferente.
- Ao alterar um endpoint existente, atualize os testes correspondentes para refletir o novo comportamento.
- Siga sempre os padrões já existentes na API (autoload de plugins/routes, `fastify-plugin` para decorators, testes via `node:test` espelhando `src`) antes de introduzir uma nova abordagem arquitetural.
- Para Prisma/NeonDB, respeite a arquitetura e configuração que forem estabelecidas no projeto quando essa integração for implementada. Não introduza uma nova estratégia de acesso ao banco sem necessidade ou sem solicitação explícita.
