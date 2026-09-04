# CLAUDE.md — Dashboard

Este arquivo complementa o [CLAUDE.md](../CLAUDE.md) da raiz (regras globais do
projeto, sempre válidas aqui) com o contexto específico do dashboard de
conteúdo. Leia os dois antes de trabalhar em `/dashboard`. Quando o trabalho
tocar endpoints, leia também [api/CLAUDE.md](../api/CLAUDE.md).

## O que é

Ferramenta web **local** para gerenciar o conteúdo pedagógico (áreas, módulos,
lições, atividades) nos dois idiomas, substituindo a edição manual de
`api/prisma/seed.ts` e o uso de Swagger/Postman para inspecionar o banco.

SPA de uma tela, tema escuro, **sem autenticação e sem router**. Aponta para a
API em `localhost`. Ver [README.md](README.md) para como rodar.

## Stack

- **Vite + React + TypeScript.** `react`/`react-dom` ficam **fixados em
  `19.2.3`**, a mesma versão do app, para o workspace não hospedar duas cópias
  do React.
- **Tailwind CSS v4** via `@tailwindcss/vite` (não há `tailwind.config.js` — os
  tokens vivem em `src/index.css`) + **shadcn/ui** (`components.json`).
- **React Query** para estado de servidor, **`fetch` nativo** para HTTP.
  Deliberadamente sem axios: ele existe no app por causa dos interceptors de
  refresh de token, que aqui não existem.
- **react-hook-form + zod + @hookform/resolvers** nos formulários.
- **Playwright** (devDependency) para a validação de UI obrigatória.
- Tipos da API por `codap-api: workspace:*`, iguais aos que o app consome.

## Estrutura

```
dashboard/
  scripts/verifyUi.mjs      # validação de UI por Playwright (ver regra abaixo)
  src/
    api/
      client.ts             # fetch + ApiError (traz a mensagem real do @fastify/sensible)
      content.ts            # uma função por operação da API, sem cache
      queryKeys.ts          # TODAS as chaves de query do app
    components/
      ui/                   # shadcn — GERADO pelo CLI, não editar à mão
      tree/                 # árvore de navegação (módulos, lições)
      forms/                # diálogos de criação/edição
      export/               # diálogo de exportação e view de impressão
    hooks/                  # useContentQueries, useContentMutations
    lib/
      activitySchemas.ts    # schemas zod do `content` de cada tipo de atividade
      exportDocument.ts     # modelo intermediário da exportação
      exportMarkdown.ts     # renderiza o modelo em Markdown
      highlight.ts          # réplica da regra de destaque do app
      mergeContent.ts       # junta as árvores de pt e en
      reorder.ts            # move um item e devolve a ordem completa
    types/api.ts            # reexporta os contratos + tipos de visão do dashboard
```

## Decisões que não devem ser desfeitas sem motivo

### A árvore é a junção de duas requisições, não um endpoint novo

`useContentTreeQuery` busca `GET /modules?areaId&locale=pt` e `&locale=en` e
junta por `id` em `mergeContent.ts`. Não existe (nem deve existir) um endpoint
"admin" que devolva a área inteira multilíngue: `GET /modules` é o endpoint do
**app**, com testes travando o formato da resposta, e uma variante multilíngue
seria uma segunda forma de resposta para manter em sincronia. Duas requisições
resolvem sem esse custo.

`GET /lessons?moduleId=` existe para o caso oposto — atualizar o painel de um
módulo sem rebuscar a área inteira (o currículo de JavaScript é grande).

### "Sem tradução" e "tradução vazia" chegam iguais

`GET /modules` resolve as traduções num idioma e faz `?? ''` / `?? {}` quando não
há linha. Do lado do cliente, portanto, as duas situações são indistinguíveis.
`mergeContent.ts` adota a convenção de tratar **nome vazio ou `content` sem
chaves como ausência** — o que é seguro, porque `minLength: 1` no schema de
escrita impede gravar um nome vazio de propósito. É isso que alimenta o selo
"sem pt"/"sem en" (`LocaleBadges`), a única defesa contra conteúdo meio-traduzido
vazar para o app.

### Cache longo, finito e em memória — nunca persistente

`staleTime` e `gcTime` são definidos uma única vez, em `src/main.tsx`
(1 hora e 24 horas). Nenhuma query os sobrescreve. São três decisões separadas:

- **Longo, não zero.** O dashboard é usado por uma pessoa de cada vez; não há um
  segundo editor mexendo no catálogo em paralelo. Quem escreve é o próprio
  usuário, e as mutations já invalidam a área afetada — rebuscar a cada foco de
  janela seria requisição jogada fora, ainda mais porque `GET /modules` de
  JavaScript devolve o currículo inteiro.
- **Finito, não infinito.** O app usa infinito porque para ele o conteúdo é
  imutável. Aqui não é: o banco muda por fora (`pnpm api:seed`, Prisma Studio,
  `psql`), e um cache eterno esconderia isso indefinidamente. Recarregar a
  página continua sendo a saída imediata quando algo mudou por fora.
- **Nunca persistente.** O app persiste o cache (AsyncStorage +
  `@tanstack/react-query-persist-client`) porque precisa funcionar offline.
  Repetir isso aqui seria um defeito: o cache sobreviveria ao fechamento do
  navegador e a edição seguinte partiria de uma foto antiga do banco, sem nada
  na tela indicando isso. **Não adicione um persister a este pacote.**

### A ordem só muda por endpoint de reorder

Não há constraint única em `(pai, index)` no banco. Escrever `index` avulso
permitiria duplicatas e ordem não-determinística, então `lib/reorder.ts` sempre
devolve a **lista completa** de ids e os endpoints `.../reorder` renumeram
`0..n-1` numa transação.

### Os schemas zod são a única validação do `content`

`activity_translations.content` é um JSONB sem forma no Postgres, e a API o
transporta fielmente de propósito — sem `oneOf`, sem `properties` — para que um
`type` novo atravesse sem mudança de schema (ver api/CLAUDE.md). Isso significa
que `lib/activitySchemas.ts` é **o único ponto do sistema** onde esse conteúdo é
validado. Ao mudar `TheoryActivityContent`/`OptionActivityContent` em
`contracts.ts`, mude o schema zod correspondente na mesma tarefa.

Atenção ao campo `aditionalParagraph` de `option`: o nome tem um erro de
digitação que veio do contrato e está gravado no banco. **Não corrija** — isso
quebraria todo o conteúdo já semeado.

### Um tipo sem formulário dedicado cai no editor de JSON

`theory` e `option` têm formulário tipado; qualquer outro `type` é editado como
JSON cru. É a mesma postura da API (transportar fielmente o que não se sabe
interpretar) e já serve os tipos previstos em
[docs/roadmap-atividades-praticas.md](../docs/roadmap-atividades-praticas.md)
sem retrabalho.

### `highlight.ts` precisa ser cópia fiel do app

`lib/highlight.ts` replica o padrão de `ThemedHighlighter.tsx`
(`app/src/components/themed/`). **Se os dois divergirem, a prévia mente** — e
mentir é pior do que não ter prévia, porque o autor confia nela para decidir.
Ao mexer no destaque de um lado, mexa no outro na mesma tarefa.

O padrão tem **duas formas**, e a prévia precisa refletir as duas: um termo
escrito como `<tag>` destaca o nome da tag e só dentro dos colchetes (`<a>` casa
em `<a>` e `</a>`, pintando apenas o `a`); qualquer outro termo casa palavra
inteira em qualquer lugar.

Duas restrições herdadas do app, que não devem ser "melhoradas" só aqui:

- **A classe de letras usa escapes `\u`, não `\p{L}`.** O `highlight-words-core`
  (sob o `@sanar/react-native-highlight-text`) monta a `RegExp` **sem a flag
  `u`**, e sem ela `\p{...}` não é interpretado. A faixa `À-ÿ` cobre o
  português; outro alfabeto exigiria estender.
- **O termo vai para a expressão sem escape.** É por isso que a prévia sinaliza
  "expressão inválida": um metacaractere de regex no termo quebra o destaque no
  app de verdade. Escapar aqui esconderia o problema em vez de mostrá-lo.

### O PDF sai por `window.print()`

Sem biblioteca de PDF. `PrintDocument` fica escondida na tela e aparece só na
impressão, onde o bloco `@media print` de `index.css` apaga o resto da
interface. jsPDF/pdfmake renderizariam mal justamente os blocos de código, que
estão em quase toda atividade. Markdown e PDF partem do **mesmo**
`ExportDocument` (`lib/exportDocument.ts`), para os dois formatos nunca
divergirem em conteúdo.

## Regras de código

### Hooks e dados

- **Toda chamada de API passa por um hook** em `src/hooks/`. Nunca `fetch` ou
  `useQuery` solto dentro de um componente — é o padrão que o app já segue com
  `useModulesQuery`.
- **Chaves de query nascem em `src/api/queryKeys.ts`.** Uma chave montada como
  string solta no meio de um componente é como uma invalidação silenciosamente
  errada acontece.
- Toda mutation invalida, no `onSuccess`, o **prefixo da área**
  (`queryKeys.modulesByArea`), não a chave de um idioma só: a árvore da UI é a
  junção das duas queries.

### Componentes

- Antes de criar um componente, procure em `components/ui/` e em
  `components/<domínio>/`. Reusar e compor antes de escrever de novo.
- **Componente de apresentação não busca dado** — recebe por props.
- **Não edite à mão nada em `components/ui/`**: são arquivos gerados pelo CLI do
  shadcn e serão sobrescritos. Estenda por composição, num componente próprio.
  (Foi por isso que `components/Toaster.tsx` existe: o Toaster gerado dependia
  de `next-themes` para um tema que aqui é fixo.)
- Arquivo grande demais é sinal de que faz coisa demais — separe por
  responsabilidade.

### Código

- TypeScript estrito, **sem `any`**. O `content` de atividade é `unknown` e é
  estreitado por `type`, mesma regra que o app segue.
- **Tipos da API vêm de `codap-api/src/types/contracts` com `import type`** (via
  o barril `src/types/api.ts`), **nunca redeclarados aqui**. Se falta um tipo,
  ele nasce em `contracts.ts`.
- Transformação de dado vive em `lib/`, estado de servidor no React Query,
  estado de UI em `useState`. Componente não carrega regra de negócio.
- Prefira derivar valores durante a renderização a sincronizá-los com `useEffect`
  — o `oxlint` reclama de `setState` dentro de efeito, e com razão.

## Validação obrigatória por Playwright

**Toda alteração que muda a UI precisa ser validada com Playwright antes de ser
considerada concluída.** Não vale declarar pronto porque compilou.

```bash
pnpm api:dev      # terminal 1 — a API precisa estar em modo dev
pnpm dash:dev     # terminal 2
pnpm dash:verify  # terminal 3
```

`scripts/verifyUi.mjs` percorre os fluxos principais, salva capturas em
`dashboard/.playwright/` (não versionado) e **falha se houver qualquer erro no
console**. Ao acrescentar uma tela ou um fluxo, acrescente um passo lá.

Três detalhes que já custaram tempo e estão resolvidos no script — não os
desfaça:

- **`animations: 'disabled'` em toda captura.** Os diálogos do Radix entram com
  um fade de 200 ms; sem congelar a animação a captura sai no meio dela, e tudo
  aparece semitransparente, o que parece um bug de fundo que não existe.
- **Sincronize pelo estado da UI, nunca por `waitForTimeout` ou
  `networkidle`.** A mutation invalida as queries dentro do `onSuccess`, então
  existe uma janela em que a escrita já terminou (rede ociosa) mas o refetch
  ainda nem começou. Espere o nó aparecer na árvore.
- **Não use um toast como sinal de conclusão.** O toast anterior pode continuar
  na tela e um `waitFor` casa com ele na hora. Conte os nós renderizados.

`verify:ui` usa o Chromium próprio do pacote, com perfil efêmero — **não** o
navegador do Playwright MCP. São coisas separadas de propósito: o script pode
rodar a qualquer momento sem disputar o perfil compartilhado que o MCP usa (ver
a seção 6 do [CLAUDE.md](../CLAUDE.md) da raiz para as regras desse navegador).

O script é **read-only** de propósito, para poder rodar a qualquer momento sem
escrever no banco real (não há banco de teste separado — ver api/CLAUDE.md).
Verificações de escrita são feitas em scripts avulsos e descartáveis, que devem
**apagar tudo que criaram** e nunca tocar no currículo semeado.

Os controles de editar/remover/reordenar da árvore só aparecem no hover
(`opacity-0` + `group-hover`). Num teste, faça `hover()` na linha antes de
clicar, como um usuário faria — um clique forçado sem hover não é confiável.
