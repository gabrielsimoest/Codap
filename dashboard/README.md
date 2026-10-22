# Codap — Dashboard de conteúdo

Ferramenta web local para gerenciar o conteúdo pedagógico do Codap: áreas,
módulos, lições e atividades, nos dois idiomas, sem passar por Swagger ou
Postman — e sem editar à mão as quase 9 mil linhas de `api/prisma/seed.ts`.

É uma SPA de uma tela só, tema escuro, **sem autenticação**, feita para rodar em
`localhost` apontando para a API local.

## O que dá para fazer

- **Navegar** a árvore de uma área: módulos → lições → atividades, com o
  conteúdo de cada atividade renderizado por idioma.
- **Criar, editar, remover e reordenar** áreas, módulos, lições e atividades.
- **Ver o que falta traduzir** — um selo marca cada entidade sem tradução num
  idioma, algo que a API não consegue distinguir de "tradução vazia" e que hoje
  chegaria ao app como um campo em branco.
- **Conferir os termos de `highlight` ao vivo**, com a contagem de ocorrências
  que cada termo teria no texto, pela mesma regra que o app aplica.
- **Exportar** qualquer recorte (área, módulo ou lição) num idioma, em Markdown
  ou PDF — legível por uma pessoa e por um modelo de linguagem.

## Rodando

Instale as dependências **a partir da raiz do repositório** (é um workspace pnpm
unificado):

```bash
pnpm install
```

Depois, com dois terminais:

```bash
pnpm api:dev     # API em http://localhost:3000 (precisa ser modo dev)
pnpm dash:dev    # dashboard em http://localhost:5173
```

> **A API precisa estar em `NODE_ENV=development`.** As rotas de escrita do
> catálogo só são registradas nesse modo — em produção elas não existem e o
> dashboard recebe 404. `pnpm api:dev` já faz isso; `pnpm api:start` não.

Copie `.env.example` para `.env` se a API não estiver em `http://localhost:3000`.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dash:dev` | Sobe o dev server do Vite |
| `pnpm dash:build` | Typecheck (`tsc -b`) + build de produção |
| `pnpm dash:verify` | Validação de UI via Playwright (ver abaixo) |
| `pnpm --filter codap-dashboard lint` | oxlint |

Os três primeiros têm equivalentes dentro de `dashboard/`: `pnpm dev`,
`pnpm build`, `pnpm verify:ui`.

### Validação de UI

`pnpm dash:verify` abre o dashboard num Chromium headless, percorre os fluxos
principais, salva capturas em `dashboard/.playwright/` e **falha se houver
qualquer erro no console**. Precisa da API e do dev server no ar. É read-only:
não escreve nada no banco.

Na primeira vez, instale o navegador:

```bash
pnpm --filter codap-dashboard exec playwright install chromium
```

## Stack

Vite + React + TypeScript, Tailwind CSS v4 e shadcn/ui, React Query para dados,
react-hook-form + zod para os formulários. Os tipos da API não são reescritos
aqui: vêm de `codap-api/src/types/contracts.ts` pelo workspace, os mesmos que o
app mobile consome.

Convenções de código, estrutura e a regra de validação estão em
[CLAUDE.md](CLAUDE.md).
