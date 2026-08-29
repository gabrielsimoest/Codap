# Arquitetura de atividades práticas e progressão de módulos

> Documento de design, não implementado ainda. Nasceu de um brainstorm em 2026-08-29 e fica guardado aqui para retomar quando o desenvolvedor pedir explicitamente — ver Seção 6 (Roadmap faseado) para a ordem de implementação prevista.

## Context

Hoje o Codap só tem 2 tipos de atividade (`theory`, `option`), e a "dificuldade" de um módulo é puramente cosmética no app (`areaMetadata.ts`, um array de 4 posições por área, desacoplado do banco). O desenvolvedor quer diversificar bastante os tipos de atividade prática — seguindo a metodologia de microlearning (rápido de resolver, alto impacto) — e já sabe que quer uma progressão HTML→React, JavaScript→TypeScript+Node, CSS→Tailwind/Bootstrap como uma extensão futura de cada área. Gosta da ideia de algo "compilado" (rodar código de verdade) mas não sabia como viabilizar isso dentro das limitações de um app mobile.

Este documento é **arquitetura de referência para adoção progressiva**, não uma tarefa a implementar de uma vez — cada fase abaixo é independente e deve ser implementada isoladamente, começando pela Fase 1, só quando o desenvolvedor pedir explicitamente.

Duas decisões importantes que vieram do próprio desenvolvedor durante o brainstorm (substituindo uma proposta inicial mais pesada que havia sido rascunhada com um agente de design):

- **Não existe (nem vai existir) um campo de dificuldade/tier no schema.** `modules.index` já ordena tudo no sistema (áreas, módulos, lições, atividades já funcionam assim); "módulo 2 é mais difícil que módulo 1" é uma convenção de conteúdo, não um dado. Quais tipos de atividade entram em cada lição já é 100% decisão de quem autora aquela lição (`lesson.activities[]` já aceita qualquer combinação, em qualquer ordem, hoje). A trilha "além da tecnologia" (React/TypeScript+Node/Tailwind) não é uma dimensão separada — é simplesmente o **próximo módulo por index** de cada área (ex.: módulo 4 de HTML = "React"), com o nome vindo normalmente de `module_translations.name`.
- **Tudo precisa ser leve o bastante para rodar bem num aparelho real.** Nenhuma peça deste plano depende de dependência nova, nem de motor de execução pesado (compilador/transpilador embutido) — onde isso apareceria (React/TypeScript na Fase 4), fica marcado explicitamente como spike futuro a avaliar por peso real em dispositivo, nunca como escopo padrão.

## Princípios transversais

1. **Contrato da API não muda de filosofia**: `activities.type` continua `string` livre (sem enum no Postgres), `content` continua schemaless no Fastify (`additionalProperties: true`, sem `properties`/`oneOf`) — tipagem forte de cada tipo novo mora só no client (`contracts.ts` compartilhado + `entities.d.ts`). Isso já é assim hoje e nenhuma fase abaixo precisa mexer em `schema.prisma` nem em `modules.schema.ts`.
2. **Reaproveitar antes de criar** — `OptionExercise`, `ValidationModal`, `CodeSection`, `CustomSyntaxHighlighter`, `ThemedView` resolvem boa parte da variedade pedida como extensão aditiva, não como tipo novo.
3. **Preferir zero dependência nova enquanto toque/`TextInput` resolver — mas isso é uma preferência de custo/risco, não uma proibição.** Nenhuma fase abaixo *exige* instalar `react-native-reanimated` ou qualquer lib de drag/editor para funcionar como descrito. Se, na prática, uma dependência nova resolver melhor um problema real (não especulativo), ela pode entrar — avaliada por peso/manutenção/maturidade antes de adotar, não descartada por princípio.
4. **Toda extensão é aditiva** (campo novo opcional em interface, novo valor de `type`) — é o que permite desenhar tudo agora e adotar aos poucos sem retrabalho.

**Referências de produto**: o desenvolvedor apontou **Duolingo** e **Grasshopper** (app do Google/Area 120 para ensinar JavaScript) como bons exemplos a seguir. Os dois validam com produtos usados em escala decisões que já estavam nesta arquitetura, e sugerem 2 refinamentos concretos (incorporados nas Seções 3-4):

- **Feedback imediato por passo, nunca em lote** — já é como `ValidationModal` funciona hoje; os dois apps confirmam que é o padrão certo pra microlearning, não só uma suposição nossa.
- **Toque em vez de digitação livre, sempre que possível.** O "monte a frase" do Duolingo (banco de palavras embaralhado, toca pra montar em ordem, toca de novo pra desfazer) é o mecanismo exato que `reorder` deveria usar — não drag-and-drop. O Grasshopper vai além: mesmo "preencha o código" costuma ser escolha de token por toque entre poucas opções plausíveis, não teclado livre — evita a dor real de digitar símbolos de código (`<`, `{`, `;`) num teclado de celular. Isso motivou o campo `wordBank?` opcional em `fill_blank`/`code_blank` abaixo.

**Ideia observada mas fora de escopo**: o Duolingo mistura atividades de lições já concluídas em sessões de revisão (*spaced repetition*, técnica bem validada na literatura de aprendizagem). Não é um tipo de atividade novo — reaproveitaria os tipos já existentes, só mudando como são selecionados/agendados. Fica anotado como iniciativa futura separada (mexe em agendamento/progresso, não em tipos de atividade), fora deste roadmap.

---

## 1. Framework de tipos de atividade: quando evoluir do `switch`

Hoje: `SUPPORTED_TYPES = new Set(["theory", "option"])` + `switch (current.type)` em `app/src/screens/classes/components/ActivityPlayer.tsx`. Para 2 tipos esse é o design certo — não introduzir uma registry agora seria over-engineering.

**Evoluir para uma registry só quando a Fase 2 chegar** (ver Seção 6) — é o ponto em que o total cruza 5 tipos (`theory`, `option`, `fill_blank`, `reorder`, `matching`) e aparece uma segunda família de interação (sequenciar/parear, não só "escolher 1 de N"). Forma recomendada nesse momento: um objeto `Record<string, { render }>` em `app/src/screens/classes/components/activityRegistry.ts`, onde cada entrada é literalmente o corpo do `case` atual movido pra lá — migração mecânica, sem mudar a assinatura dos componentes-folha (`TheoryLesson`/`OptionExercise` continuam recebendo props espalhadas como hoje). `filterPlayable()` passa a checar `type in ACTIVITY_REGISTRY` em vez do `Set`.

Benefício lateral: com a registry existindo, o tipo mais pesado (`code_playground`, Fase 3) pode virar `React.lazy(...)`, adiando o custo de bundle até alguém abrir uma lição que o usa — relevante para o princípio de leveza mobile.

---

## 2. Progressão por módulo (sem campo novo)

`modules.index` já é suficiente. Nenhuma migration, nenhuma coluna nova. Consequência prática a resolver como groundwork leve na Fase 1:

**`app/src/screens/classes/areaMetadata.ts` hoje assume exatamente 4 módulos por área** (`modules: ModuleMetadata[]` de 4 posições fixas, mapeado por índice de array). Com o roadmap prevendo um 4º módulo real (e potencialmente mais) por área, isso precisa de um fallback gracioso quando não há entrada de cosmético pra um módulo além da lista (ex.: reaproveitar a última entrada, ou um cosmético genérico) — sem isso, o 4º módulo real (ou um 5º) quebraria a busca por posição. Pequeno ajuste, não redesenho.

---

## 3. Novos tipos de atividade

**A maior parte da "variedade" pedida não exige tipo novo — é extensão aditiva do `option` já existente:**

| Variação | Tipo novo? | Como |
|---|---|---|
| Múltipla escolha (atual) | — | `OptionActivityContent` como já existe |
| Verdadeiro/Falso | Não | `option` com `options.length === 2` |
| Lacuna fechada (escolher entre N palavras) | Não | `option` com a lacuna escrita dentro de `question` |
| "O que este código faz?" | Não | `code?`/`codeLanguage?` novos e opcionais em `OptionActivityContent`; `OptionExercise.tsx` passa a renderizar `CodeSection` quando presentes |
| "Ache o erro no código" | Não | `optionsAsCode?: boolean` novo; cada `option` renderizada via `CustomSyntaxHighlighter` em vez de texto puro |

**Tipos genuinamente novos:**

| `type` | Fase | Por que (hipótese pedagógica, não validada — ver Seção 7) | Esforço RN |
|---|---|---|---|
| `fill_blank` | 1 | Força *recall* em vez de reconhecimento; ainda 1 campo, custo de erro baixo | Componente novo pequeno, zero dependência (`TextInput` é core) |
| `reorder` | 2 | Testa compreensão estrutural/procedural (ordem de tags, cascata CSS); banco de chips embaralhado, toca pra montar em ordem — mecanismo do "monte a frase" do Duolingo, sem drag-and-drop | Componente novo pequeno, zero dependência, reaproveita `ValidationModal` |
| `matching` | 2 | Força reter múltiplas associações simultâneas, feedback por par | Componente novo pequeno, zero dependência |
| `code_blank` | 3 | Primeira tarefa de produção real, mas com raio de erro contido a 1 token — ponte antes do playground | Reaproveita o componente de `fill_blank` com wrapper de highlight |
| `code_playground` | 3 | Único formato que testa síntese completa | Ver Seção 4 |

Contratos propostos (`api/src/types/contracts.ts`, espelhados em `app/src/types/entities.d.ts` como hoje):

```ts
export interface FillBlankActivityContent {
  textBefore: string;
  textAfter?: string;
  acceptedAnswers: string[]; // comparação case-insensitive + trim
  /** Presente = chips de toque (estilo Duolingo/Grasshopper), uma delas = acceptedAnswers[0]; ausente = TextInput livre. */
  wordBank?: string[];
  highlight?: string[];
  tutorial?: boolean;
}

export interface ReorderActivityContent {
  prompt: string;
  items: string[]; // ordem correta; embaralhar no client antes de exibir
  // UI: banco de chips embaralhado, toca pra montar em sequência (toca de novo
  // pra desfazer) — mecanismo do "monte a frase" do Duolingo, não drag-and-drop.
  highlight?: string[];
  tutorial?: boolean;
}

export interface MatchingActivityContent {
  prompt?: string;
  pairs: { left: string; right: string }[];
  highlight?: string[];
  tutorial?: boolean;
}
```

**Limitação real de RN a respeitar na autoria de `fill_blank`/`code_blank`**: `TextInput` não flui embutido num parágrafo como um `<input>` inline em CSS na web — a lacuna precisa ficar no início/fim de uma linha curta (`RowView` com `Text` + `TextInput` lado a lado), não no meio de um parágrafo longo.

**Sobre "programação em blocos aninháveis"**: avaliado e não recomendado como tipo dedicado — é essencialmente um dialeto visual de `reorder` com aninhamento, uma ordem de magnitude mais complexo em RN (drag real, zonas de encaixe, validação de árvore) sem ganho pedagógico proporcional sobre `reorder` por toque. Fica fora deste roadmap.

Restrição de nomenclatura: `activities.type` é `VarChar(25)` no Postgres — todos os nomes acima cabem confortavelmente.

---

## 4. Playground de código (Fase 3 — o item mais ambicioso)

**Nenhuma dependência npm nova é necessária.** `react-native-webview` já está instalado (ver `app/package.json`) e já injeta `window.ReactNativeWebView.postMessage` automaticamente em qualquer página carregada — hoje usado só para renderizar HTML estático em `app/src/screens/classes/components/CodeSection.tsx` (`source={{ html: code }}`, sem interatividade). HTML/CSS/JS já têm motor de execução real de graça via WebView (é um browser engine) — não é necessário escrever interpretador/compilador próprio.

- **Duas sub-fases, não uma** — o Grasshopper roda código de verdade mas mantém a entrada bem restrita (escolha por toque entre poucos tokens plausíveis), mesmo tendo motor de execução completo por trás. Vale seguir o mesmo caminho aqui em vez de abrir uma tela em branco de cara:
  - **3a — guiado (primeira versão)**: `starterCode` majoritariamente fixo, com poucos pontos editáveis via o mesmo mecanismo de `wordBank` do `code_blank` (chips de toque, não teclado livre). Reaproveita quase tudo do `code_blank` — só adiciona a execução real via WebView por cima.
  - **3b — editor livre (upgrade posterior)**: `TextInput` multiline monoespaçado sem restrição, alternado por toggle com o resultado (mesmo padrão "Index"/"Web" já usado em `CodeSection.tsx`). Um editor com highlight-enquanto-digita (`TextInput` transparente sobreposto a `<Text>` destacado) fica como upgrade posterior a isso, não pré-requisito — evita o risco de desalinhamento de fonte/cursor por enquanto.
- **Execução**: documento HTML montado inteiramente no lado RN (`buildHtmlDocument(userCode, checkScript)`), com um `<script>` de shim físico e primeiro no documento (roda antes do código do usuário) que sobrescreve `console.log`/`console.error`/`window.onerror` para mandar via `postMessage`. **Recarregar `source` inteiro a cada "Rodar"**, não `injectJavaScript` incremental — evita estado global vazando entre tentativas, e mantém o consumo de memória do WebView previsível (relevante para o princípio de leveza mobile).
- **Validação ("compilado")**: cada atividade carrega um `checkScript` pequeno, **autorado pelo time de conteúdo** (nunca pelo usuário final), que roda depois do código do usuário e chama um helper (`__codap_report(passed, message?)`) que a ponte transforma em resultado. Ex.: `checkScript: "__codap_report(!!document.querySelector('h1 + h2'))"`. Mesma fronteira de confiança que `content` já tem hoje (dado confiável vindo do banco).
- **Sandboxing**: o código nunca sai do dispositivo, nunca toca API/banco — o WebView do RN já roda em processo isolado do SO (Chromium/WKWebView), não é execução multi-tenant que precise de infraestrutura extra. Hardening não-opcional na baseline da Fase 3: `onShouldStartLoadWithRequest` bloqueando navegação além do documento sintético; nunca habilitar acesso universal a arquivo; watchdog de timeout (~3-5s sem `postMessage` de conclusão → oferecer recarregar, matando loop infinito escrito pelo usuário).

```ts
export interface CodeBlankActivityContent {
  codeLanguage: 'HTML' | 'CSS' | 'JavaScript';
  codeBefore: string;
  codeAfter?: string;
  acceptedAnswers: string[];
  /** Recomendado como padrão pra lacunas de código — evita digitar símbolos (`<`, `{`, `;`) no teclado do celular. */
  wordBank?: string[];
  highlight?: string[];
}

export interface CodePlaygroundActivityContent {
  instructions: string;
  language: 'HTML' | 'CSS' | 'JavaScript';
  starterCode: string;
  checkScript: string;
  highlight?: string[];
}
```

**Por que Tailwind/Bootstrap fica de fora daqui**: carregam via CDN normalmente, incompatível com o app ser offline-first (staleTime/gcTime infinitos, fila de sync SQLite). Viabilizar offline exigiria bundlar CSS estático local (via `expo-asset`) cobrindo só as classes ensinadas — não trivial, e um "Tailwind completo" de verdade precisaria do motor JIT (Node-only, pesado demais pro celular). Fica como spike da Fase 4, nunca bloqueando o playground puro de HTML/CSS/JS.

---

## 5. Placeholder "além da tecnologia" (Fase 4 — raso de propósito)

- **HTML → React**: rodar JSX arbitrário exigiria transpilador (Babel standalone/sucrase) + bundle de React/ReactDOM, tudo local — pesado demais para ser escopo padrão. Recomendo abrir com os tipos **já construídos** nas Fases 1-3 aplicados a React de forma conceitual ("preveja a saída deste JSX", "ordene os passos do ciclo de vida") em vez de playground ao vivo. Playground de React fica como spike futuro dedicado, avaliado por peso real antes de entrar em escopo.
- **JavaScript → TypeScript + Node**: embarcar o compilador TS na WebView tem custo de bundle real — a maioria dos exercícios não precisa disso (`option`/`matching` já cobrem "ache o erro de tipo"). Ecossistema Node (npm, servidores) provavelmente não é executável em WebView de forma razoável — ficaria conceitual, ou exigiria algo fora de escopo (terminal simulado).
- **CSS → Tailwind/Bootstrap**: o mais barato dos três de eventualmente virar playground ao vivo — só precisa do spike de bundling estático da Seção 4, não de transpilador.
- **Ação concreta desta fase**: nenhuma infra nova — só seed de um módulo novo por área (próximo `index`), com conteúdo usando os tipos já existentes.

---

## 6. Roadmap faseado

| Fase | Escopo | Dependência nova |
|---|---|---|
| **1** | `fill_blank` (componente + `contracts.ts` + `entities.d.ts` + `case` em `ActivityPlayer.tsx` + `SUPPORTED_TYPES`); extensão aditiva de `OptionActivityContent` (`code?`/`codeLanguage?`/`optionsAsCode?`) em `OptionExercise.tsx`; fallback gracioso em `areaMetadata.ts` (Seção 2); bump de `persistOptions.buster` em `App.tsx`; seed de conteúdo real em `api/prisma/seed.ts` seguindo o padrão `ActivitySeed`/`LessonSeed` já existente. **Sem migration, sem alteração em `schema.prisma`/`modules.schema.ts`.** | Nenhuma |
| **2** | `reorder` + `matching` (componentes + contratos); introdução da registry em `activityRegistry.ts` (Seção 1), substituindo `SUPPORTED_TYPES`+`switch`; `optionsAsCode` de fato usado em conteúdo real. Bump de `buster`. | Nenhuma |
| **3** | `code_blank` primeiro (reaproveita `fill_blank`); depois `code_playground` **3a guiado** (starter fixo + gaps por `wordBank`, estilo Grasshopper — `CodePlaygroundActivityContent`, novo `CodePlayground.tsx` + `app/src/services/CodeSandboxBridge.ts`, entrada na registry, hardening de sandbox como baseline); **3b editor livre** só depois, como upgrade. | Nenhuma exigida |
| **4** | Módulo novo por área (próximo `index`) usando tipos já construídos, conteúdo conceitual sobre React/TypeScript+Node/Tailwind. Spikes futuros documentados mas fora de escopo: transpilador React em WebView, TS-checker em WebView, bundle estático Tailwind/Bootstrap — cada um avaliado por peso real em dispositivo antes de entrar em qualquer sprint. | A decidir por spike |

**Ordem importa**: Fase 1 primeiro por ser a mais barata (zero dependência, zero migration) e já entregar variedade real nos módulos iniciais. Registry só na Fase 2 — introduzi-la antes seria over-engineering para 3 tipos. Fase 3 é o maior risco técnico e de peso mobile — hardening de sandbox não é opcional ali. Fase 4 não abre nenhuma infra nova; os spikes citados só entram em escopo depois de avaliados individualmente.

---

## 7. Checkpoint pedagógico

O desenvolvedor não é pedagogo e pediu para eu aplicar julgamento de instructional design (feedback rápido, custo de erro baixo, scaffolding progressivo) — mas deixou claro que quer levar a um profissional de educação para validação. **Recomendação**: antes de (ou em paralelo à) autoria de conteúdo real de cada fase — não do trabalho mecânico de plumbing, que pode prosseguir sem esse gate — um profissional deveria revisar a sequência teoria→reconhecimento→recall→produção proposta na Seção 3. Este documento aplica uma hipótese de trabalho, não currículo validado.

---

## Verificação (por fase, ao implementar)

```bash
pnpm --filter codap exec tsc --noEmit
pnpm api:test
pnpm api:seed
pnpm run app:android
```

- Testar cada tipo novo manualmente no emulador: golden path (resposta certa) e edge case (resposta errada, campo vazio).
- **Fase 3 especificamente**: testar em dispositivo/emulador real observando tempo de carregamento do WebView e comportamento sob código que trava (loop infinito) — verificação de performance, não só de corretude, dado o princípio de leveza mobile.
- Confirmar bump de `buster` sempre que o formato persistido de `["modules", ...]` mudar (mesma regra já documentada em `app/CLAUDE.md`).
- Atualizar `api/CLAUDE.md`/`app/CLAUDE.md`/`CLAUDE.md` raiz ao final de cada fase implementada (regra 3 do CLAUDE.md raiz), documentando os tipos novos e, na Fase 2, a substituição do `switch` pela registry.
