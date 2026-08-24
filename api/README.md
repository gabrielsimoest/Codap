# Codap API

API em Fastify + TypeScript do Codap, conectada a um banco Postgres real (NeonDB) via Prisma. Recursos implementados: CRUD completo de `users`, autenticação via JWT (access + refresh token com rotação e detecção de reuso) e um endpoint de sincronização em lote (`/sync`) para progresso feito offline pelo app.

Para detalhes de arquitetura, convenções e regras de contribuição específicas da API, veja [CLAUDE.md](CLAUDE.md) (e o [CLAUDE.md](../CLAUDE.md) da raiz do monorepo).

## Stack

- Fastify 5 + TypeScript, estrutura de plugins/rotas carregada via `@fastify/autoload`
- Pacote ESM puro (`"type": "module"`)
- Prisma + PostgreSQL/NeonDB, driver adapter `@prisma/adapter-pg`
- `@fastify/jwt` + `@fastify/rate-limit` (autenticação e proteção contra abuso)
- Swagger/OpenAPI (`@fastify/swagger` + `swagger-ui`), somente em desenvolvimento — `/documentation`
- Testes com o runner nativo `node:test` + `c8` (cobertura) + `tsx`, rodando contra o banco real

## Instalação

Este pacote faz parte de um workspace pnpm unificado — instale as dependências a partir da raiz do repositório, não aqui:
```bash
cd ..
pnpm install
```

Configure o `.env` (ver `.env.example`): `DATABASE_URL` (NeonDB) e `JWT_ACCESS_SECRET` — a aplicação não sobe sem os dois.

## Comandos

Rode a partir de `/api`, ou a partir da raiz com `pnpm --filter codap-api <script>` (há atalhos prontos: `pnpm api:dev`, `pnpm api:build`, `pnpm api:test`).

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | build + watch do TypeScript + servidor com reload automático |
| `pnpm build:ts` | compila `src/` para `dist/` |
| `pnpm start` | build + inicia em modo produção |
| `pnpm test` | build + typecheck dos testes + roda a suíte completa com cobertura |

Por padrão o servidor sobe em [http://localhost:3000](http://localhost:3000).

## Saiba mais

- [Documentação do Fastify](https://fastify.dev/docs/latest/)
- [Documentação do Prisma](https://www.prisma.io/docs)
