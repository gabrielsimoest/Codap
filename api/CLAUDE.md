# CLAUDE.md — API

Este arquivo complementa o [CLAUDE.md](../CLAUDE.md) da raiz (que contém as regras globais do projeto, sempre válidas aqui) com o contexto específico da API. Leia os dois antes de trabalhar em `/api`.

## Stack e estado atual

- **Fastify 5** com **TypeScript** (`~5.9`), estruturado via `fastify-cli` (`@fastify/autoload`, `fastify-plugin`).
- O pacote é **ESM puro** (`"type": "module"` em `package.json`). Isso tem duas consequências diretas no código:
  - **`__dirname`/`__filename`/`require` não existem em runtime** — use `import.meta.dirname` e `import`.
  - **Todo import relativo entre arquivos próprios precisa da extensão `.js` explícita** (ex.: `from './users.schema.js'`, mesmo o arquivo fonte sendo `.ts`) — o `moduleResolution: "bundler"` do `tsconfig.json` aceita omitir a extensão só para fins de type-check, mas o Node em ESM nativo exige a extensão em runtime para resolver o `.js` já compilado. **Não omita a extensão `.js` em novos imports relativos**, e não reintroduza `__dirname`/`require`.
- Testes com o runner nativo `node:test` + `c8` (cobertura) + `tsx` (execução direta de `.ts` sob ESM via `--import tsx`; `ts-node` foi removido do projeto por não suportar bem esse cenário).
- **Prisma está instalado e conectado** (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`) a um banco **NeonDB/PostgreSQL** real, via `src/plugins/prisma.ts` (decorator `fastify.prisma`). O schema (`api/prisma/schema.prisma`) já tem os models completos (ver diagrama de origem no histórico do projeto) e a migration inicial foi aplicada (`prisma/migrations/`).
- **Swagger/OpenAPI configurado, mas só em desenvolvimento** — ver seção própria abaixo.
- **CRUD de `users` implementado** (`src/routes/users/`) — primeiro recurso real da API, serve de modelo para os próximos.
- **Autenticação via JWT implementada** (`@fastify/jwt` + `@fastify/rate-limit`) — access token de 15 min + refresh token rotativo (7 ou 60 dias, conforme "lembrar-me") persistido hasheado (SHA-256) na tabela `refresh_tokens`, com detecção de reuso. Ver seção "Autenticação" abaixo.
- **Endpoint de sincronização em lote** (`POST /sync`, protegido por access token) — recebe eventos de progresso feitos offline pelo app (lição concluída, conquista desbloqueada) e aplica de forma idempotente via constraints únicas no Prisma. Ver seção "Sincronização" abaixo.
- **`src/types/contracts.ts`** — tipos de contrato (request/response) compartilhados com o app via `codap-api: workspace:*`; tipos que representam entidades persistidas são derivados do Prisma Client gerado, não reescritos à mão.

## Estrutura de diretórios

```
api/
  prisma/
    schema.prisma          # models, gerador prisma-client, datasource postgresql
    migrations/             # histórico de migrations (versionado no git)
  src/
    app.ts                  # ponto de entrada: registra plugins e routes via @fastify/autoload
    generated/prisma/       # Prisma Client gerado (`prisma generate`) — NÃO editar à mão, NÃO versionado (.gitignore)
    types/
      contracts.ts            # tipos de request/response compartilhados com o app (workspace:*)
    plugins/                # cross-cutting concerns, carregados ANTES das routes
      prisma.ts             # conecta ao Postgres via @prisma/adapter-pg, expõe fastify.prisma
      swagger.ts             # registra @fastify/swagger + swagger-ui, só se NODE_ENV=development
      sensible.ts            # registra @fastify/sensible (fastify.httpErrors, etc.)
      jwt.ts                  # registra @fastify/jwt, expõe fastify.authenticate (preHandler)
      rateLimit.ts             # registra @fastify/rate-limit globalmente (limite brando; rotas sensíveis sobrescrevem via config.rateLimit)
      support.ts              # exemplo de decorator (fastify.someSupport())
    routes/                   # endpoints da aplicação, carregados DEPOIS dos plugins
      root.ts                 # GET / -> { root: true }
      example/index.ts        # GET /example -> "this is an example"
      users/                   # CRUD de usuários — ver "Padrão de rotas com múltiplos arquivos" abaixo
        index.ts                # registra create/list/getById/update/remove sob o prefixo /users
        create.ts, list.ts, getById.ts, update.ts, remove.ts
        users.schema.ts          # JSON Schemas reutilizados entre as rotas acima (request/response/params)
      auth/                    # login/registro/refresh/logout — mesmo padrão de múltiplos arquivos de users/
        index.ts, register.ts, login.ts, refresh.ts, logout.ts, auth.schema.ts
      sync/                    # POST /sync — protegido por fastify.authenticate
        index.ts, create.ts, sync.schema.ts
    utils/
      password.ts              # hashPassword / comparePassword (bcryptjs)
      refreshToken.ts           # generateRefreshToken (alta entropia) / hashRefreshToken (SHA-256)
      session.ts                 # createSession() — emite access+refresh token, usado por register/login/refresh
  test/
    helper.ts                  # build() sobe a app inteira via fastify-cli/helper para testes com app.inject
    plugins/*.test.ts           # espelha src/plugins
    routes/*.test.ts            # espelha src/routes
    routes/users/*.test.ts       # espelha src/routes/users
    routes/auth/*.test.ts        # espelha src/routes/auth
    routes/sync/*.test.ts        # espelha src/routes/sync
    tsconfig.json
  .c8rc.json                  # exclui test/** e src/generated/** da cobertura
  dist/                        # saída compilada do tsc (gerada, não editar à mão)
  tsconfig.json                 # extends "fastify-tsconfig", rootDir "src"
```

### Convenção de autoload

`src/app.ts` registra dois `@fastify/autoload`: primeiro `src/plugins` (não encapsulado, plugins com `fastify-plugin` expõem decorators para toda a app), depois `src/routes` (encapsulado — cada plugin de rota tem seu próprio escopo). **Não edite as linhas marcadas "Do not touch" em `app.ts`.**

- Novo endpoint simples → novo arquivo em `src/routes` (ex. `achievements.ts`). O nome do arquivo/pasta define o path (ex.: `routes/example/index.ts` → prefixo `/example`).
- Nova funcionalidade compartilhada entre rotas (auth, cache, decorators) → novo arquivo em `src/plugins`, envolvido em `fastify-plugin` (`fp`) quando precisar expor decorators/hooks para fora do escopo do plugin.

#### Padrão de rotas com múltiplos arquivos (ex.: `routes/users/`)

Quando um recurso tem várias operações (CRUD completo), organize em uma pasta com um `index.ts` — **o `@fastify/autoload` só enxerga o `index.ts` de uma pasta; os demais arquivos dentro dela são ignorados pelo autoload e precisam ser importados e registrados manualmente pelo `index.ts`** (ver `src/routes/users/index.ts`). Convenção adotada:
- Um arquivo por operação (`create.ts`, `list.ts`, `getById.ts`, `update.ts`, `remove.ts`), cada um um `FastifyPluginAsync` registrando sua própria rota (`fastify.post('/', ...)`, `fastify.get('/:id', ...)`, etc.) — o prefixo da pasta (`/users`) já é aplicado automaticamente pelo autoload.
- Schemas JSON (request body, params, response) reutilizados entre os arquivos ficam num `<recurso>.schema.ts` na mesma pasta (ex. `users.schema.ts`), não duplicados em cada arquivo de rota.
- Siga esse mesmo padrão ao criar o próximo recurso com CRUD completo, em vez de introduzir uma organização diferente.

## Banco de dados (Prisma)

- Conexão via `src/plugins/prisma.ts`: usa o driver adapter `@prisma/adapter-pg` (padrão Prisma 7 para Postgres) e expõe o client como `fastify.prisma` em toda a aplicação. Desconecta automaticamente no hook `onClose`.
- **O output do Prisma Client foi movido para dentro de `src/`** (`src/generated/prisma`, configurado em `schema.prisma` como `output = "../src/generated/prisma"`) — precisa estar sob `src/` porque o `tsconfig.json` tem `rootDir: "src"`; um output fora dali quebra o build (`tsc` não consegue mapear um arquivo fora do `rootDir` para o `outDir`). Não mude esse output sem ajustar `rootDir`/`.gitignore` junto.
- O gerador também usa `importFileExtension = "js"` — sem isso, o próprio Prisma Client gerado usa imports relativos sem extensão entre seus arquivos internos, o que quebra em runtime pelo mesmo motivo do ESM (ver acima). **Sempre que rodar `prisma generate`, o client será regenerado com essa opção — não remova essa flag do `generator client` no schema.**
- `src/generated/prisma` **não é versionado** (está no `.gitignore`) — depois de um clone novo ou de alterar o `schema.prisma`, é preciso rodar `pnpm --filter codap-api exec prisma generate` antes do build funcionar.
- `prisma/migrations/` **é versionado** — é o histórico real do banco. Nunca edite uma migration já aplicada; crie uma nova com `prisma migrate dev --name <nome>`.
- A URL de conexão (NeonDB) vem de `DATABASE_URL` no `.env`, carregada via `prisma.config.ts` (CLI) e via `import 'dotenv/config'` no topo de `src/app.ts` (runtime da aplicação).
- `user_lessons`/`user_achievements` têm `@@unique([user_id, lesson_id])`/`@@unique([user_id, achievement_id])` — é essa constraint (não uma tabela de log genérica) que garante a idempotência do `/sync` ao reaplicar um evento já processado (`P2002` do Prisma → resultado `"duplicate"`).
- **Este ambiente é não-interativo**: `prisma migrate dev` falha aqui (exige TTY). Para criar uma migration, gere o SQL com `prisma migrate diff --from-config-datasource --to-schema ./prisma/schema.prisma --script`, salve manualmente em `prisma/migrations/<timestamp>_<nome>/migration.sql` e aplique com `prisma migrate deploy` (não-interativo). Regenere o client depois com `prisma generate`.

## Autenticação (JWT)

- `src/plugins/jwt.ts` registra `@fastify/jwt` (secret via `JWT_ACCESS_SECRET`, obrigatório no `.env` — o plugin lança erro no boot se ausente) e expõe `fastify.authenticate`, um `preHandler` reutilizável (`request.jwtVerify()`) para proteger qualquer rota nova; popula `request.user.id`.
- **Access token**: JWT, 15 min, payload `{ id: user.id }`.
- **Refresh token**: valor aleatório de alta entropia (`crypto.randomBytes`, nunca um JWT) — só o hash SHA-256 é persistido em `refresh_tokens.token_hash` (`src/utils/refreshToken.ts`). SHA-256, não bcrypt: é um segredo de alta entropia, não uma senha humana, e precisa de lookup indexado por igualdade em toda chamada a `/auth/refresh`.
- **TTL**: 7 dias por padrão, 60 dias se `rememberMe: true` na requisição (`refresh_tokens.remember_me`).
- **Rotação**: cada `POST /auth/refresh` bem-sucedido cria um novo `refresh_tokens` e revoga o anterior (`revoked_at`, `replaced_by_id`) na mesma transação (`src/utils/session.ts#createSession`), mantendo o mesmo `family_id`.
- **Detecção de reuso**: se o token apresentado já está revogado, toda a família (`family_id`) é revogada — força reautenticação em todos os dispositivos daquela sessão.
- `POST /auth/register` e `POST /auth/login` têm rate limit próprio (5/min) via `config.rateLimit` na rota; `POST /auth/refresh` é mais permissivo (20/min); o restante usa o limite global de `src/plugins/rateLimit.ts` (100/min).
- Ao adicionar uma nova rota protegida, siga o padrão de `src/routes/sync/create.ts`: `preHandler: fastify.authenticate` + ler o dono do recurso de `request.user.id` (nunca do body — evita forjar dados para outra conta).

## Sincronização (`POST /sync`)

- Recebe um lote de eventos (`{ events: [{ clientEventId, type, occurredAt, payload }] }`, máx. 100) gerados offline pelo app e aplica cada um independentemente — um evento inválido não aborta o lote (`src/routes/sync/create.ts`).
- Idempotência via as constraints únicas do Prisma citadas acima (não um `clientEventId` persistido no servidor) — `P2002` vira `"duplicate"`, `P2003` (FK inexistente) vira `"error"`. XP só é incrementado na primeira aplicação bem-sucedida, dentro da mesma transação do insert.
- Resposta `200` sempre que a requisição em si é válida e autenticada — é um ack em lote (`results: [{ clientEventId, status, error? }]`), não uma falha única; só `400`/`401`/`429` refletem problema na chamada como um todo.
- Ao adicionar um novo tipo de evento sincronizável, siga esse mesmo padrão: uma função `applyXxx` dedicada, idempotência via constraint única no schema (evite introduzir uma tabela de log genérica sem necessidade real).

## Swagger / OpenAPI

- `src/plugins/swagger.ts` registra `@fastify/swagger` + `@fastify/swagger-ui` **somente quando `process.env.NODE_ENV === 'development'`** — fora disso a função retorna cedo e as rotas de documentação nem chegam a existir (não é só UI escondida; em produção/teste elas não são registradas).
- `NODE_ENV=development` é setado (via `cross-env`) apenas no script `dev:start`; `start` (produção) usa `NODE_ENV=production`. Em testes, o valor de `NODE_ENV` não é setado pelos scripts — cada teste que precisa validar o comportamento do swagger define `process.env.NODE_ENV` manualmente (ver `test/plugins/swagger.test.ts`).
- Em dev, a UI fica em `/documentation` e o schema OpenAPI em `/documentation/json`.
- Toda rota nova deve ter `schema` (Fastify) preenchido (`description`, `tags`, `body`/`params`/`response`) — é isso que alimenta a documentação automaticamente; não escreva documentação Swagger à mão em paralelo.

## Testes

- Runner: `node:test` nativo (não Jest/Vitest). Arquivos em `test/`, espelhando a estrutura de `src/`.
- `test/helper.ts` expõe `build(t)`, que sobe a aplicação completa via `fastify-cli/helper` (com `skipOverride: true`) e registra `t.after` para fechar a app — use isso para testes de integração de rota via `app.inject({ url: ... })`.
- Testes de plugin isolado instanciam `Fastify()` diretamente e registram só o plugin em questão (ver `test/plugins/support.test.ts`).
- **Os testes de `users`, `auth` e `sync` rodam contra o banco NeonDB real** (não há mock nem banco de teste separado configurado) — cada teste cria os próprios dados com e-mails únicos (`randomUUID()`) e **remove o que criou ao final** (via `app.prisma.<model>.delete(...)` ou pela própria rota DELETE). Ao escrever novos testes que tocam o banco, siga esse mesmo padrão de isolamento e limpeza; não deixe dados de teste órfãos no banco.
- `pnpm test` faz build (`build:ts`), typecheck dos testes (`test/tsconfig.json`) e roda `c8 node --import tsx --test "test/**/*.ts"`.
- `test/helper.ts` define `process.env.FASTIFY_AUTOLOAD_TYPESCRIPT ??= '1'` antes de subir a app: o `@fastify/autoload` só detecta suporte a TS automaticamente via loaders carregados com `--require`, e o `tsx` é carregado via `--import` — sem essa variável, o autoload falha ao importar os plugins `.ts` durante os testes.
- `.c8rc.json` exclui `src/generated/**` (código gerado pelo Prisma, fora do nosso controle) da cobertura.

## Comandos

O repositório é um workspace pnpm unificado (ver [CLAUDE.md](../CLAUDE.md) da raiz) — **instale as dependências uma única vez a partir da raiz** (`pnpm install`), nunca dentro de `/api` isoladamente. Os scripts abaixo podem ser rodados de duas formas equivalentes: com `cd api` e o comando direto, ou a partir da raiz com `pnpm --filter codap-api <script>` (há atalhos prontos em `package.json` da raiz: `api:dev`, `api:build`, `api:test`, `api:add`).

- Rodar em desenvolvimento (build + watch + reload, com Swagger ativo): `pnpm dev`
- Apenas watch do TypeScript: `pnpm watch:ts`
- Build: `pnpm build:ts`
- Rodar em produção (build + start, sem Swagger): `pnpm start`
- Rodar toda a suíte de testes: `pnpm test`
- Rodar um único arquivo de teste (após `pnpm run build:ts`):
  ```
  node --import tsx --test test/routes/users/create.test.ts
  ```
- Rodar um teste específico por nome:
  ```
  node --import tsx --test --test-name-pattern="support works standalone" test/plugins/support.test.ts
  ```
- Regenerar o Prisma Client após alterar o schema: `npx prisma generate` (dentro de `/api`)
- Criar/aplicar uma migration: `npx prisma migrate dev --name <nome>` (dentro de `/api`) — em ambiente não-interativo, ver o passo a passo alternativo na seção "Banco de dados (Prisma)".
- **`.env` precisa de `DATABASE_URL` e `JWT_ACCESS_SECRET`** (ver `.env.example`) — sem `JWT_ACCESS_SECRET` a aplicação não sobe (erro explícito no boot, em `src/plugins/jwt.ts`).
- **Não há script de lint configurado atualmente** no `package.json`.

## Regras específicas da API

- **Para todo endpoint criado, editado ou removido, atualize o Swagger na mesma tarefa** — via o `schema` da própria rota (`description`, `tags`, `body`/`params`/`response` com todos os códigos relevantes: sucesso, validação, não encontrado, conflito, etc.). Não escreva documentação Swagger à mão em paralelo; é o `schema` do Fastify que alimenta `/documentation` automaticamente. Um endpoint criado/editado sem o `schema` correspondente atualizado não está pronto.
- **Para todo endpoint criado, editado ou removido, atualize os testes na mesma tarefa**, garantindo cobertura completa de todos os endpoints envolvidos — não só o caminho feliz: inclua os casos de erro relevantes (validação, não encontrado, conflito, etc.). Ao editar um endpoint existente, corrija/estenda os testes já existentes (não apenas adicione novos por cima de testes desatualizados). Rode a suíte e confirme que passa antes de considerar a tarefa concluída. Um endpoint criado/editado/removido sem os testes correspondentes atualizados não está pronto.
- Siga sempre os padrões já existentes na API (autoload de plugins/routes, `fastify-plugin` para decorators, um arquivo por operação em pastas de recurso com múltiplas rotas, `fastify.httpErrors.*` do `@fastify/sensible` para erros HTTP, `select` explícito no Prisma para nunca vazar `password`) antes de introduzir uma nova abordagem arquitetural.
- Para Prisma/NeonDB, respeite a arquitetura já estabelecida (driver adapter `@prisma/adapter-pg`, client via `fastify.prisma`, output do client dentro de `src/generated`). Não introduza uma nova estratégia de acesso ao banco sem necessidade ou sem solicitação explícita.
