# Codap API

API em Fastify + TypeScript do Codap. Ainda em estágio inicial (estrutura base gerada pelo `fastify-cli`, sem rotas de negócio reais), com integração a Prisma + PostgreSQL/NeonDB em desenvolvimento.

Para detalhes de arquitetura, convenções e regras de contribuição específicas da API, veja [CLAUDE.md](CLAUDE.md) (e o [CLAUDE.md](../CLAUDE.md) da raiz do monorepo).

## Stack

- Fastify 5 + TypeScript, estrutura de plugins/rotas carregada via `@fastify/autoload`
- Pacote ESM puro (`"type": "module"`)
- Prisma + PostgreSQL/NeonDB *(instalado, mas ainda sem models/migrations)*
- Testes com o runner nativo `node:test` + `c8` (cobertura) + `tsx`

## Instalação

Este pacote faz parte de um workspace pnpm unificado — instale as dependências a partir da raiz do repositório, não aqui:
```bash
cd ..
pnpm install
```

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
