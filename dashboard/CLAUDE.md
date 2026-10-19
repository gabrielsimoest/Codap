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
      contentVersion.ts     # VERSION_PATTERN, espelhado do schema da API
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

### Publicar versão é o que faz o conteúdo chegar ao usuário

Editar conteúdo no dashboard **não basta**: o app guarda o catálogo em cache por
tempo indeterminado e só rebusca quando a `content_version` do idioma dele muda.
Sem publicar, quem já abriu o app continua com o conteúdo antigo — por isso o
`ContentVersionDialog` diz isso na própria descrição, em vez de deixar a
consequência implícita.

- **A publicação é por idioma.** Um idioma com suporte parcial não deve rebuscar
  porque outro mudou. Se a edição cobriu os dois, publique duas vezes — o
  diálogo avisa.
- **`VERSION_PATTERN` (`lib/contentVersion.ts`) espelha o schema da API.**
  Mudou de um lado, mude do outro na mesma tarefa; validar só aqui apenas troca
  um 400 da API por um erro de formulário. Escrito com `[0-9]`/`[.]` e sem barra
  invertida, pelo mesmo motivo documentado em api/CLAUDE.md.
- **A sugestão de próximo patch é só uma sugestão** (`suggestNextVersion`): o
  campo continua editável, porque subir *minor* ou *major* é decisão editorial
  que o dashboard não tem como inferir.
- **O 409 de duplicata é mostrado com a mensagem da API**, não como "erro 409" —
  ela diz qual é a versão vigente, que é a informação de que o autor precisa.
- **"Avisar os alunos" decide se a publicação aparece no aviso de "conteúdo
  atualizado" do app** (`announce` na API). Nasce **ligado**: a maior parte das
  publicações é novidade para o aluno, e esquecer de ligar faria uma novidade
  chegar em silêncio. Desligado, o conteúdo chega do mesmo jeito, só sem aviso —
  é o certo para correções pequenas. A API, ao contrário, tem padrão `false`
  (quem chama sem o campo publica em silêncio); o formulário sempre envia o
  valor explícito. Com o aviso ligado, **o campo "O que mudou" é o texto que o
  aluno lê** — escreva para ele, não para o histórico interno. O painel "Versão
  vigente" marca "com aviso" na publicação que foi anunciada.

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

`fill_blank`, `code_playground`, `code_editor`, `reorder` e `matching` também têm formulário próprio. O de `code_playground` (`CodePlaygroundFields`) edita o código do aluno com lacunas, os blocos, a solução de referência (uma entrada por lacuna), os arquivos de apoio (HTML/CSS/JS, menos a linguagem do aluno) e o `checkScript`, e tem o botão **Testar com a solução**: roda o exercício num `<iframe sandbox="allow-scripts">` com `srcDoc` (sem acesso ao dashboard nem à rede) e mostra a prévia, o console e o veredito do `__codap_report` — sem isso, um script de correção quebrado só apareceria no celular. O documento de teste vem de `lib/playgroundDocument.ts`, **espelho** do `buildSandboxHtmlDocument` do app (o dashboard e o app não compartilham código em tempo de execução, só tipos): quem mudar o shim, o `__codap_report`, a CSP ou a proteção de laços (`protectLoops`) de um lado muda o outro. Aqui a proteção de laços é ainda mais necessária — um laço infinito no iframe congelaria a aba inteira do dashboard, que roda no mesmo processo. O iframe é remontado a cada teste (`key`), porque o mesmo `srcDoc` não recarregaria sozinho. O de `code_editor` (`CodeEditorFields`, desafio do módulo) edita o desafio, o código inicial, a solução completa, as dicas (1 a 3), os arquivos de apoio e o `checkScript`, e tem **dois** testes no mesmo iframe: **Testar com a solução** (precisa passar) e **Testar o código inicial** (precisa **não** passar — senão o desafio começaria resolvido), mostrando a lista de requisitos do `__codap_check` como o aluno vai vê-la. Os dois formulários usam `buildSandboxTestDocument` (o documento genérico; o do playground só encaixa os blocos antes), que espelha também a correção travada contra o código do aluno, o `__codap_check`, o escape de `</script>` e a correção no `DOMContentLoaded`. O de `fill_blank` (`FillBlankFields`) pede o código com exatamente uma lacuna `___`, uma lista de 1 a 3 respostas aceitas (editada com `setValue`, porque o `useFieldArray` espera objetos e não strings), o switch **Ignorar maiúsculas** (`ignoreCase`) e mostra a prévia com a resposta principal encaixada; o schema recusa resposta com símbolo (só letras, números, hífen e sublinhado, até 20 caracteres — `FILL_BLANK_ANSWER`), resposta repetida e linha acima de 30 caracteres com a resposta mais longa encaixada. O de `reorder` (`ReorderFields`) edita as linhas como uma lista de strings controlada (`useWatch` + `setValue`, sem `useFieldArray`), **sem trim em nenhum ponto** — os espaços à esquerda são a indentação do código montado; o schema também não usa `.trim()` (que transforma o valor) nas linhas nem nos distratores, só valida que não estão vazios. Tem botões para recuar/avançar a indentação e mover a linha, contador de 30 caracteres por linha e uma prévia do código montado e do banco que o app mostra (sem indentação). O de `matching` (`MatchingFields`) tem os pares lado a lado com contadores de 20/40 caracteres, de 3 a 4 pares, e o schema recusa item repetido numa coluna. O formulário de `option` ganhou o toggle **Alternativas como código** (`optionsAsCode`), que troca as alternativas por campos monoespaçados multilinha e passa a exigir no máximo 30 caracteres por linha. Os três têm passo próprio no `verify:ui`, que abre o formulário, preenche, confere a validação e fecha **sem salvar** (as capturas são `09-reorder.png`, `10-matching.png`, `11-ache-o-erro.png`, `12-digitar-resposta.png` — cujo passo também confere que uma resposta com símbolo é recusada — `13-playground.png`, cujo passo testa a solução no iframe: passa com a certa, reprova com um bloco errado e é cortado pela proteção de laços com um laço infinito, e `14-desafio.png`, cujo passo confere que a solução do desafio passa com a lista de requisitos, que o código inicial não passa e que um HTML terminado no meio de uma tag ainda recebe veredito).

O `code_blank` tem formulário próprio (`CodeBlankFields`): o número de respostas acompanha sozinho o número de lacunas `___` do código, há uma lista de blocos errados e uma prévia com as respostas encaixadas; o schema recusa 0 ou mais de 3 lacunas, respostas em número diferente das lacunas e linhas acima de 30 caracteres com a resposta encaixada. Na exportação, as respostas aparecem como alternativas corretas e os blocos errados como incorretas. O formulário de `option` tem um campo **Trecho de código** (`code` + `codeLanguage`, que a exportação em Markdown/PDF também inclui como bloco de código) e uma seção **Sorteio** com `pool`, `draw` e
`fixedOrder`, e o de `theory` tem `noTerminal` e `terminalCode` (ver
`api/CLAUDE.md` e `app/CLAUDE.md`). O zod descarta campo não declarado, então
um campo de contrato que falte no schema **é apagado em silêncio** ao salvar
pelo dashboard — `noTerminal`/`terminalCode` chegaram a ficar de fora por um
tempo. Por isso o `verify:ui` confere esses campos nos dois formulários.

### Aula de aprofundamento é um interruptor no formulário da lição

`LessonFormDialog` tem o interruptor **Aula de aprofundamento** e, ligado, os campos **Nível mínimo** (2 a 50) e **XP ao concluir** (1 a 100, sugestão 30). Eles espelham `lessons.min_level`/`xp_reward` da API (mesmos limites); a lógica vive em `lib/lessonForm.ts` (funções puras: o schema zod, `toFormValues`, `toDeepeningFields`). Três regras que não devem ser desfeitas: **o formulário mostra o que está gravado, sem inventar** — um `xpReward` nulo aparece vazio ("padrão: 10"), nunca como 30, porque preencher 30 por conta própria faria um simples "Salvar" de renomeação trocar 10 XP por 30 sem ninguém ver (a sugestão de 30 só entra ao **ligar** o interruptor com o campo vazio); **o XP vazio vale "padrão"** e vai como `null`; e **só se envia o que o usuário mexeu** — com o interruptor ligado vão o nível e o XP, uma aula de aprofundamento que foi desligada manda `null` nos dois (volta à trilha principal), e uma lição da trilha editada sem ligar o interruptor **não manda nada**, para não zerar um `xpReward` que veio pela API (ausente não mexe na coluna). A árvore marca a lição com o selo "Nv. N · +XP" (`data-testid="lesson-optional-badge"`). `mergeContent` copia `minLevel`/`xpReward` da resposta de `GET /modules` (iguais nos dois idiomas). O `verify:ui` abre o formulário, liga o interruptor, confere que os campos aparecem e que nível 1 é recusado, e fecha **sem salvar** (captura `15-licao-aprofundamento.png`). Criar a lição por aqui **não publica** uma `content_version`: veja o aviso sobre apps antigos em [api/CLAUDE.md](../api/CLAUDE.md).

### Aula do baú é o segundo interruptor do formulário

O formulário da lição tem também **Aula do baú** (`lessons.is_chest`): uma aula exclusiva que só chega a quem a revelou no Baú Surpresa da loja (ver [api/CLAUDE.md](../api/CLAUDE.md), "Loja e baú"). Os dois interruptores são **mutuamente exclusivos** — ligar um desliga o outro, porque uma aula do baú nunca tem nível mínimo (a API também recusa os dois juntos com 400). Ligada, só o campo **XP ao concluir** aparece (sugestão de 50, `DEFAULT_CHEST_XP_REWARD`; a aula de aprofundamento sugere 30) e o de nível some. `toDeepeningFields(values, lesson?)` envia **só o que mudou**: baú ligado → `{ chest: true, xpReward }` (só `{ xpReward }` se a lição já era do baú); aprofundamento ligado → `{ minLevel, xpReward }`, mais `chest: false` se ela vinha do baú; voltar uma aula do baú à trilha limpa `chest`, `minLevel` e `xpReward`; uma lição da trilha editada sem ligar nada continua **não mandando nada**. **A árvore precisa pedir `includeChest=true` em `GET /modules`** (`src/api/content.ts`): sem o parâmetro a API esconde as aulas do baú (é o filtro que as mantém fora do catálogo do app), e o dashboard não as veria nem poderia editá-las — o parâmetro só vale em `NODE_ENV=development`, como o resto da escrita. A árvore as marca com o selo "Baú · +XP" (`data-testid="lesson-chest-badge"`) e `mergeContent` copia `chest` da resposta. O `verify:ui` liga o interruptor do baú, confere a exclusão mútua e o campo de XP, e fecha **sem salvar** (captura `16-licao-bau.png`). Criar uma aula do baú por aqui **não publica** `content_version` e não a entrega a ninguém: só o sorteio do baú a revela.

### Um tipo sem formulário dedicado cai no editor de JSON

`theory`, `option`, `code_blank`, `fill_blank`, `code_playground`, `code_editor`, `reorder` e `matching` têm formulário tipado; qualquer outro `type` é editado como
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

**O `@media print` precisa esconder o portal do diálogo, e isso não é
detalhe.** Os diálogos do Radix são renderizados num portal pendurado no
`document.body`, fora da árvore do `App` — então o `.print-hidden` que está no
header/aside/main nunca os alcança. Como são `position: fixed`, o Chrome os
repete em **todas** as páginas impressas, não só na primeira: o PDF saía com o
diálogo de exportação carimbado nas 26 páginas, tapando o conteúdo.

Fechar o diálogo antes de imprimir **não** resolve. `exportPdf` chama
`setOpen(false)` e espera 150 ms, mas a animação de saída do Radix é
`duration-200` e o elemento só desmonta ao fim dela — a corrida é perdida
sempre, não de vez em quando. Por isso a regra vive na folha de impressão
(`[data-slot='dialog-overlay'], [data-slot='dialog-content']`), que elimina a
corrida em vez de apostar num timeout maior e cobre qualquer diálogo aberto na
hora de imprimir. O passo "o diálogo não vai para o papel" em
`scripts/verifyUi.mjs` trava isso emulando a mídia de impressão; ele foi
conferido reprovando com a regra desativada.

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
