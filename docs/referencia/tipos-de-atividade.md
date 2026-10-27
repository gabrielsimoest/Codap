# Tipos de atividade

Cada atividade tem um `type` (string livre no banco) e um `content` (JSONB por idioma).
Os tipos TypeScript estão em [`api/src/types/contracts.ts`](../../api/src/types/contracts.ts)
(`*ActivityContent`); a validação de autoria está nos schemas zod do dashboard
(`dashboard/src/lib/activitySchemas.ts`); a renderização, em
`app/src/screens/classes/components/`.

A API **não valida** o `content`. Quem valida é o dashboard; quem decide o que sabe
renderizar é o app.

## Resumo

| `type` | O que o aluno faz | Componente | Regra-chave de conteúdo |
|---|---|---|---|
| `theory` | Lê e vê código | `TheoryLesson` | Introdução obrigatória; 1ª teoria da lição é `cody` |
| `option` | Escolhe uma alternativa (múltipla escolha, V/F, "qual código?") | `OptionExercise` | `correctOption` é **1-based** |
| `code_blank` | Completa código tocando em blocos | `CodeBlankExercise` | 1 a 3 lacunas `___` |
| `fill_blank` | Completa código digitando | `FillBlankExercise` | Exatamente 1 lacuna; só letras/números/`-`/`_` |
| `reorder` | Monta o código ordenando linhas | `ReorderExercise` | Só trechos com **uma** ordem válida |
| `matching` | Liga pares | `MatchingExercise` | 3–4 pares |
| `code_playground` | Completa lacunas e **executa**; correção por comportamento | `CodePlaygroundExercise` | `checkScript` chama `__codap_report` |
| `code_editor` | **Digita** código livre num desafio | `CodeEditorExercise` | `checkScript` chama `__codap_check` por requisito |

`highlight: string[]` é obrigatório em todos os tipos (pode ser vazio). `tutorial?: boolean` abre o tutorial da atividade já na entrada (o "?" do cabeçalho o abre a qualquer momento, com ou sem o campo) e, junto do sorteio `pool`/`draw`, vale para os tipos de prática, menos o `code_editor`, que tem campos próprios.

Regra transversal de formatação de código: **no máximo 30 caracteres por linha**
(contando a resposta já encaixada), para o aluno não precisar rolar na horizontal no celular.

Linguagens de código aceitas (`CodeLanguage`): `HTML`, `CSS`, `JavaScript`,
`TypeScript`, `JSX`. Só as três primeiras executam; `TypeScript` e `JSX` apenas exibem.

## `theory`

```ts
{
  introduction: { title?: string; text: string; persona: 'cody' | 'neutral' }
  explanation?: { title?: string; text: string }
  codeLanguage?, code?, additionalCode?: { codeLanguage, code }[]
  onlyCode?: boolean       // omite a aba "Web"
  noTerminal?: boolean     // omite o terminal "Executar"
  terminalCode?: string    // JS que roda no terminal no lugar do código exibido
  closing?: string         // cartão complementar
  highlight: string[]      // termos pintados na prosa (obrigatório, pode ser vazio)
  tutorial?: boolean
}
```

- No dashboard, `title` da introdução e da explicação é obrigatório.
- Mais de um bloco de código = uma aba por bloco (comum em CSS: um `HTML` e um `CSS`).
- `terminalCode` serve a TypeScript (JS já transpilado, gerado uma vez na autoria) e a
  JavaScript que não roda direto na sandbox (`export` é erro de sintaxe fora de módulo; um
  `fetch` real falharia). O código **exibido** permanece fiel ao que é ensinado.
- `noTerminal` é o opt-out quando o código é elegível mas não produz saída.

## `option`

```ts
{
  question: string
  aditionalParagraph?: string  // sic — o nome tem um erro histórico, NÃO corrigir
  highlight: string[]
  options: string[]            // a correta fica sempre na posição 1 no conteúdo
  correctOption: number        // 1-based
  code?: string; codeLanguage?: CodeLanguage   // trecho entre enunciado e alternativas (só leitura)
  optionsAsCode?: boolean      // cada alternativa é um trecho de código ("ache o erro")
  pool?: string; draw?: number // sorteio dentro da lição
  fixedOrder?: boolean         // não embaralha (verdadeiro/falso)
}
```

- **Pool/draw**: atividades com o mesmo `pool` são alternativas; a sessão sorteia `draw`
  delas (lido da primeira do pool; padrão 1).
- **Enunciado explícito**: pergunta de "qual a saída?" foi conferida executando o trecho.
- `optionsAsCode` aceita código de várias linhas por alternativa; exatamente **uma** certa.

## `code_blank` e `fill_blank`

```ts
// code_blank
{ question; codeLanguage; code /* 1–3 × "___" */; answers: string[]; distractors: string[]; pool?; draw? }

// fill_blank
{ question; codeLanguage; code /* exatamente 1 × "___" */; answers: string[] /* 1–3 */;
  ignoreCase?: boolean; pool?; draw? }
```

- `code_blank`: blocos de toque = `answers` + `distractors`, embaralhados. A correção compara
  cada lacuna com `answers[k]`. **Quando duas respostas podem trocar de lugar e o código
  continua válido, use uma lacuna só.**
- `fill_blank`: respostas **só letras, números, hífen e sublinhado, até 20 caracteres**
  (símbolos ficam para o `code_blank`, que existe para não exigir digitar `<`, `{`, `;` no
  celular). `ignoreCase` para HTML/CSS; em JavaScript/TypeScript fica ausente (`push` ≠ `Push`).
  Sinônimos legítimos entram todos em `answers`.

## `reorder`

```ts
{ question; codeLanguage; lines: string[] /* 3–6, na ordem correta, com indentação */;
  distractors?: string[] /* 0–2 */; pool?; draw? }
```

O **enunciado precisa citar cada valor que entra no código e a ordem** (textos, nomes,
cores), senão o aluno não sabe o que vai onde. A correção compara a sequência montada com
`lines`, então **só vale trecho com uma ordem válida** (no CSS, uma declaração por regra; no
JS, linhas com dependência entre si).

## `matching`

```ts
{ question; pairs: { left: string /* ≤20 */; right: string /* ≤40 */ }[] /* 3–4 */;
  leftAsCode?: boolean; pool?; draw? }
```

Sem repetição em cada coluna. Usado nas lições de vocabulário (tags, atributos,
seletores, métodos HTTP…), não em toda lição.

## `code_playground`

```ts
{
  question; codeLanguage /* HTML | CSS | JavaScript */;
  code /* 1–3 × "___" */; blocks: string[]; solution: string[] /* só para autoria */;
  html?, css?, js?: string   // arquivos de apoio fixos
  checkScript: string        // chama __codap_report(passed, message?)
}
```

- A correção é **pelo comportamento** (DOM, `getComputedStyle`, console capturado em
  `window.__codapConsoleEntries`); a `solution` é só referência.
- Densidade: é a prática mais complexa, então aparece **pouco no começo e mais no fim** —
  concentrada nas últimas lições de cada módulo e nos módulos avançados.
- **Evite lacunas na tag de abertura e na de fechamento ao mesmo tempo** (`<___>…</___>`): o
  navegador aceita `<h2>…</h3>`, então uma tag mal fechada passaria.
- **Desfaça no fim o que a correção mexer** (marcar um radio, clicar): a prévia é o que o
  aluno vê.
- **A prévia não pode contradizer o veredito**: não use distrator cujo efeito visual imite a
  resposta certa (`title` no lugar de `alt` rende texto igual no WebView do Android).
- Antes de gravar, **rode todas as combinações de blocos** num harness (carregue o documento
  por navegação, não por `setContent`, senão os `.then` rodam depois do `DOMContentLoaded`).
- Fica de fora o que depende de rede ou de timer (a correção roda no `DOMContentLoaded`).

## `code_editor` — desafio do módulo

```ts
{
  question; highlight?; codeLanguage;
  starterCode: string          // o editor começa assim; NÃO pode já passar
  html?, css?, js?: string
  checkScript: string          // chama __codap_check(rotulo, passou) por requisito
  hints: string[]              // 1–3, da mais leve à mais direta
  solution: string             // liberada por último; usada no "Testar" do dashboard
}
```

- Uma lição só com ele, "Testando seus conhecimentos", no fim dos módulos 2 e 3. O app marca a
  lição como desafio por **ter um `code_editor`** (sem campo no banco).
- Cada rótulo de requisito precisa estar no enunciado, com os valores exatos.
- A correção deve ser **defensiva** (o código é livre): confira que o elemento existe, meça
  comportamento e não forma (`input.labels`, botão `<button>` ou `<input type="submit">`),
  chame as funções do aluno com **outros valores**, envolva tudo numa IIFE.
- Antes de gravar, rode a solução, o código inicial e variantes erradas de exemplo.

## Princípios de desenho da prática

Inspirados em apps como Duolingo e Grasshopper (microlearning: rápido de resolver, alto
impacto):

- **Feedback imediato por passo**, nunca em lote (o `ValidationModal` diz na hora se
  acertou).
- **Toque em vez de digitação livre, sempre que possível.** Digitar `<`, `{` e `;` num teclado
  de celular é a parte ruim de escrever código, não a parte a exercitar. Por isso o
  `code_blank` (blocos), o `reorder` (montar a frase) e o `matching` existem; o `fill_blank`
  restringe a resposta a letras e números, e só o desafio do módulo pede digitação livre — com
  uma barra de símbolos acima do teclado.
- **Do reconhecimento à produção**: teoria → escolher (`option`) → completar por blocos
  (`code_blank`) → digitar (`fill_blank`) → montar (`reorder`) → executar (`code_playground`) →
  produzir sozinho (`code_editor`).
- **Extensões sempre aditivas**: campo novo opcional ou valor novo de `type`, nunca mudança de
  formato de um campo existente. É o que permite adotar aos poucos sem retrabalho e deixa um
  app antigo conviver com conteúdo novo.
- **Sem campo de dificuldade**: a ordem (`index`) é a progressão.
- **Leveza em aparelho real**: nenhum tipo exige dependência pesada nem motor de execução
  embarcado; o que não roda no WebView (React, Tailwind, Node, TypeScript) é exibido, não
  executado.

## Como acrescentar um tipo novo

1. **Contrato**: `XxxActivityContent` em `contracts.ts` (aditivo; não exige migration).
2. **App**: componente em `screens/classes/components/`, entrada em `ACTIVITY_REGISTRY`,
   tipo em `types/entities.d.ts`, exemplar na galeria escondida e um **tutorial** (`TutorialType`,
   `TUTORIALS`, cenas e textos `tutorial.*` em pt e en).
3. **Dashboard**: schema zod em `activitySchemas.ts`, formulário (ou o editor de JSON serve
   de início), exportação, passo no `verify:ui`.
4. **Documentação**: este arquivo e [Lição e atividades](../fluxos/licao-e-atividades.md).

`buildLessonSession` já trata como prática tudo que não é `theory`, inclusive `pool`/`draw`,
então não precisa mudar.
