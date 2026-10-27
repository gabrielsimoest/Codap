# Contribuindo

Convenções e regras do repositório. Para o fluxo de issues e pull requests, veja
também o [README](../README.md#contribuição).

## Antes de começar

1. Leia a [Visão geral](visao-geral.md) e a [Arquitetura](arquitetura.md).
2. Rode o projeto ([Primeiros passos](primeiros-passos.md)).
3. Entenda o código relacionado **antes** de mexer: procure implementações que possam ser
   reutilizadas, confira os padrões do pacote e pense no impacto nas outras partes.
4. Implemente **somente o que foi pedido**. Melhorias fora do escopo viram sugestões
   separadas, não código.

## Regras do repositório

| Regra | Detalhe |
|---|---|
| **Instale da raiz** | `pnpm install` na raiz; nunca dentro de um pacote. |
| **Nunca faça eject do Expo** | O app vive no fluxo gerenciado; `android/` e `ios/` não entram no repositório. |
| **Segredos** | Nunca versione `.env`/`.env.production`. O que existe de variáveis está nos `.env.example`. |
| **Commits** | Mensagem descritiva do trabalho do projeto (ver abaixo). |
| **Documentação junto da mudança** | Mudou comportamento, rota, tabela, comando ou fluxo? Atualize o documento correspondente na mesma tarefa. |
| **Verificar antes de concluir** | Typecheck, testes e conferência real — veja a seção abaixo. |

### Commits

- Mensagens objetivas, descrevendo **o que mudou e por quê**, no padrão do histórico
  (`git log --oneline`): prefixo `Add:`, `Fix:`, `Refactor:` ou `Feat:` seguido de uma frase
  em português.
- Uma mudança coerente por commit; documentação no mesmo commit do código que ela descreve.

## Verificação por pacote

| Mexeu em… | Verifique |
|---|---|
| **API** | `pnpm api:test`; Swagger (`schema` da rota) e testes atualizados; se houve conteúdo, `pnpm api:seed:check` |
| **App** | `cd app && npx tsc --noEmit`; conferência no emulador/aparelho (não há suíte nem lint) |
| **Dashboard** | `pnpm dash:build` e, se a UI mudou, `pnpm dash:verify` (obrigatório) |
| **Conteúdo** | `pnpm api:seed:generate` → `pnpm api:seed:check` → publicar `content_version` |
| **Contrato** (`contracts.ts`) | App, API e dashboard compilam; schema zod do dashboard e galeria do app atualizados |

Se uma verificação não puder ser executada, diga explicitamente por quê. Não declare algo
como funcionando sem uma verificação compatível com a afirmação.

## Convenções por pacote

### API

- ESM puro: imports relativos com **`.js`**; sem `__dirname`/`require`.
- Um arquivo por operação; schemas em `<recurso>.schema.ts`; autoload só vê o `index.ts`.
- **Rota criada, editada ou removida ⇒ `schema` do Fastify (Swagger) e testes na mesma tarefa**,
  inclusive os casos de erro (validação, não encontrado, conflito).
- Rotas protegidas: `preHandler: fastify.authenticate`, dono lido de `request.user.id`.
- Prisma: `select` explícito (nunca vazar `password`); respeite o driver adapter e o output
  dentro de `src/generated`.
- Testes de escrita de conteúdo chamam `useDevelopmentEnv(t)` antes de `build(t)`.
- Testes rodam no banco real: use identificadores únicos e **limpe tudo** que criar.
- Mudou a curva de nível ou os ids de conquista? Atualize **os dois lados** (API e app).

### App

- TypeScript estrito. Tipos da API via `import type` de `codap-api/src/types/contracts`.
- Prefira os componentes `Themed*` e as peças compartilhadas (`AppModal`, `ListRow`,
  `AppButton`, `TextField`, `ScreenHeader`).
- **Reutilize antes de criar.** Nem cópias quase idênticas (`ComponentType1`, `…2`), nem um
  monólito de condicionais.
- Persistência nova: siga o padrão (chave fixa + hook + store). Esquema do SQLite: nova
  versão em `migrations.ts`, **idempotente**.
- Rota nova com parâmetros: entrada em `RootStackParamList`/`MainTabParamList`.
- Query com parâmetro assíncrono: nunca chame com `undefined` (cria entrada de cache órfã).
- Texto de lição **nunca** em i18n; texto de interface sempre em `pt.json` **e** `en.json`.
- Cuidado com `ThemedTouchableOpacity`/`ThemedView`: aplicam a cor do tema **depois** do
  `style`, então um `backgroundColor` no `style` é ignorado.
- Gradientes: `#RRGGBB00`, nunca `"transparent"`.

### Dashboard

- Toda chamada de API passa por um hook; chaves em `queryKeys.ts`.
- Não edite `components/ui/` (gerado pelo shadcn).
- Sem `any`; sem tipos da API redeclarados.
- **UI alterada ⇒ `pnpm dash:verify`** e um passo novo em `scripts/verifyUi.mjs` para fluxos novos.

## Navegador do Playwright (MCP)

Se usar o Playwright via MCP para inspeção interativa: prefira a instância **isolada**
declarada em `.mcp.json`, abra sempre um navegador novo, feche o que abriu e **nunca derrube
à força** um navegador que encontrou aberto (pode estar em uso por outra sessão). Para
validação de rotina, `pnpm dash:verify` usa um Chromium próprio e nunca toca nesse perfil.

## Abrindo um pull request

1. Branch com nome descritivo a partir da `main`.
2. Mudança pequena, coerente e com a documentação atualizada.
3. Descreva **o que mudou, por quê e como foi verificado**.
4. Se a mudança exige ordem de publicação (migration → API → app → conteúdo), diga isso na
   descrição — veja [Publicação](guias/publicacao.md).
