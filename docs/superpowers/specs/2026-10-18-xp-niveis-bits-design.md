# XP, níveis e Bits — design

Data: 2026-10-18. Resultado de um brainstorm com o desenvolvedor sobre dar
**uso** ao XP e às moedas do app. Este documento cobre o sistema inteiro, mas
**só a Fase 1 está pronta para construir**; as fases seguintes registram o que já
foi decidido para não se perder.

## Intenção

Hoje o XP só se acumula (10 por lição, só no servidor) e as moedas
("Dependabots") não têm nenhuma fonte; a loja é vitrine (toda compra abre o
"em breve"). O objetivo é que ganhar XP **mude alguma coisa** e que a pessoa
queira ir atrás de mais: um **nível** com progresso visível, moedas que vêm
desse progresso, e, mais adiante, conteúdo opcional e difícil como recompensa.

Tudo isso é motivação, nunca obstáculo: nenhuma lição da trilha principal fica
bloqueada por nível, moeda ou sorte.

## Objetivos, não objetivos e anti-objetivos

**Objetivos (Fase 1)**
- Nível derivado do XP, de 1 a 50, com curva fixa e barra de progresso no perfil.
- XP calculado **no próprio app** (offline-first), para o nível reagir na hora.
- Aviso de nível (com animação) ao concluir uma lição.
- Moeda renomeada para **Bits**, creditada ao subir de nível.

**Não objetivos (por ora)**
- Cosméticos (molduras, temas do Cody). Ficam para depois do TCC.
- Cronômetro de aula e desafio com tempo.
- Mostrar nível ou XP dentro das trilhas (a decisão do desenvolvedor é manter
  isso só no perfil; pode mudar no futuro).
- Loja funcional, aulas opcionais e baú — são as Fases 2 e 3.

**Anti-objetivos (falha mesmo que "funcione")**
- Qualquer coisa da trilha principal ficar bloqueada.
- XP ser gasto (ele só mede progresso; quem se gasta é o Bit).
- Dar a impressão de que refazer uma lição rende XP de novo.

## Decisões já tomadas (pelo desenvolvedor)

- **XP = progresso, nunca é gasto.** Define o nível.
- **Nível máximo 50.** A trilha principal completa fecha por volta do nível 30;
  o resto (31–50) é alcançado só com conteúdo opcional (Fase 3).
- **Moeda se chama Bits.** Referência a tecnologia, e sai da dependência da
  marca Dependabot (a GitHub).
- **Nível e XP aparecem no perfil, não nas trilhas.**
- **O aviso de subida de nível aparece na tela de conclusão da lição.**
- Aulas exclusivas do baú: **coleção permanente**, ocultas até serem reveladas
  (Fase 3).

## Escolhas minhas (revise)

Marcadas como minhas, não do desenvolvedor:

1. **Curva de nível.** Quantidade de XP para *alcançar* o nível `n` (nível 1 =
   0 XP): `threshold(n) = round(0,41·(n−1)² + 54·(n−1))`, para `n` de 1 a 50.
   Referências: nível 2 = 54, nível 10 = 519, nível 19 = 1105, nível 30 = 1911,
   nível 50 = 3630. Com 10 XP por lição, as 192 lições dão 1920 XP:
   HTML (55 lições, 550 XP) fecha no **nível 10**; HTML+CSS (1160) no **19**;
   a trilha toda (1920) no **30**. Primeiro nível em 6 lições, para a primeira
   subida vir rápido. Acima do nível 50 o XP continua somando, e o nível fica 50.
2. **Bits por nível alcançado.** `10 × n` Bits ao chegar no nível `n` (n ≥ 2).
   Até o nível 10 isso soma 540 Bits (um baú de 500, o preço hoje exibido na
   loja). Constante ajustável.
3. **O nome muda em tudo, inclusive no banco** (decisão do desenvolvedor, depois
   da primeira versão desta spec): `users.dependabots` vira `users.bits`
   (Postgres, por migration com `RENAME COLUMN`, que preserva os dados),
   `Users.dependaBots` vira `Users.bits` (SQLite, nova versão em `migrations.ts`),
   e o campo acompanha nos contratos, rotas de `users`/`auth`, testes e no app
   (`User.bits`). As referências a "dependabots" nesta spec descrevem o estado
   anterior ou passam a ser lidas como `bits`.
4. **O servidor é a autoridade, e o app se corrige sozinho.** O `/sync` passa a
   devolver o `xp` e os Bits atuais; com a fila vazia, o app adota esses valores
   (ver seções 2 e 3). Isso substitui uma regra de `max(local, servidor)` que eu
   havia pensado e que deixava o XP inflado para sempre numa reinstalação.
   Alternativa mais barata, se preferir: aceitar essa divergência rara.
5. **Bits retroativos.** Quem já tem XP recebe os Bits dos níveis que seu XP já
   cobre, por um script avulso e idempotente (seção 7). Sem isso, quem tem 300 XP
   ficaria no nível 6 com saldo zero para sempre.
6. **Dobro de Tempo custa 300** (o valor da lógica original em `Market.tsx`).
7. **Nova tela de conclusão de lição** (hoje não existe — ver abaixo).
8. **Sem tela de "bem-vindo aos níveis"** para quem já tem XP: o perfil passa a
   mostrar o nível direto. Se quiser um momento único, é uma tela a mais.

## Fase 1 — o que construir

### 1. Curva e funções puras (`levels`)

Funções puras, sem I/O: `levelForXp(xp)`, `thresholdForLevel(n)`,
`progressInLevel(xp)` (XP no nível atual, XP necessário para o próximo, fração),
`bitsForLevel(n)` e `bitsEarnedBetween(xpAntes, xpDepois)` (soma os Bits dos
níveis cruzados). Constantes: `MAX_LEVEL = 50`, `LESSON_XP_REWARD = 10`.

**Vivem nos dois lados** (app e API), porque o app importa `codap-api` só como
tipo (`import type`) e não consegue compartilhar código executável. Mesma regra
dos ids de conquista: **mudou um, mude o outro** — comente isso nos dois
arquivos. No servidor, `LESSON_XP_REWARD` já existe em `sync/create.ts`.

### 2. XP e Bits locais (SQLite)

- `completeLesson` passa a, **na mesma transação** que grava `UserLessons` e o
  evento da fila, somar `LESSON_XP_REWARD` em `Users.xp` e os Bits dos níveis
  cruzados em `Users.dependaBots`.
- **XP e Bits só na primeira conclusão daquela lição.** Hoje `UserLessons` não
  tem constraint única e refazer uma lição insere outra linha; o servidor
  responde `duplicate` e não paga XP de novo. O app precisa pagar igual: se a
  lição já está em `UserLessons` para o usuário, não soma nada (o evento pode
  continuar indo para a fila; o servidor trata como duplicado).
- Devolve um resultado: `{ firstTime, xpGained, bitsGained, xpBefore, xpAfter,
  levelBefore, levelAfter }`. `SyncService.recordLessonCompletion` repassa isso
  (hoje devolve `void`).
- Depois de gravar, o app **atualiza o `UserStore`** (`xp`, `dependaBots`) com os
  valores novos. Hoje o `user.xp` só muda no login.
- **O servidor é a autoridade; o app se corrige.** O número local é uma
  estimativa imediata (para o nível reagir offline), e o valor do servidor
  prevalece sempre que não há nada na fila. Duas ocasiões:
  - **Depois de um `flushQueue`**: o `/sync` devolve `profile: { xp, dependabots }`
    (seção 3). Se, terminado o processamento, o usuário **não tem mais eventos
    `pending` nem `syncing`**, o app grava esses valores em `Users` e no
    `UserStore`. Se ainda há fila, não mexe (o local continua à frente do
    servidor por causa dos eventos pendentes, e a próxima sincronização corrige).
    **Com a fila vazia o app consulta mesmo assim** (`events: []`, com timeout
    próprio), senão o valor do servidor nunca chegaria no boot; e eventos
    presos em `syncing` (app encerrado com o envio em voo) voltam para `pending`
    no início de cada flush, para não desligar a autocorreção. (Acrescentado
    depois da revisão final.)
  - **No login** (`upsertLocalProfile`, ramo do usuário existente): com a fila
    vazia, o valor do servidor vence; com eventos pendentes, vale
    `max(local, servidor)` (não apagar o que ainda vai ser enviado).
  Isso cobre, sem regra especial: reinstalação/novo dispositivo (`UserLessons`
  vazio, o app acha que é a primeira conclusão, mas o servidor responde
  `duplicate`), progresso de outro dispositivo, e uma lição que some do
  catálogo. **Limitação conhecida e aceita:** num caso desses (refazer uma lição
  já concluída num aparelho sem o histórico), a tela de conclusão mostra +10 XP
  por um instante e o valor volta ao correto assim que a sincronização termina.
  Só um *pull* do progresso evitaria isso (ver "Limitação conhecida" em
  `app/CLAUDE.md`), e ele fica fora do escopo.

### 3. Servidor (`POST /sync`)

- Em `applyLessonCompleted`, depois do insert em `user_lessons`: o `update` de
  XP **devolve o XP novo** (`select: { xp: true }`); `xpAntes = xpNovo − 10`;
  Bits = `bitsEarnedBetween(xpAntes, xpNovo)`; incrementa `dependabots` com
  esse valor, **na mesma transação**.
- Por que usar o valor devolvido pelo `update` e não ler antes: os eventos de um
  lote rodam em paralelo (`Promise.all`); o `UPDATE` trava a linha até o commit,
  então o XP devolvido é o serializado, e dois eventos do mesmo lote não contam
  o mesmo cruzamento duas vezes.
- Tratar `xp`/`dependabots` nulos como 0 (as colunas são `Int?`; `increment` em
  `NULL` continua `NULL`). Contas criadas por `/auth/register` já nascem com 0.
- **A resposta do `/sync` ganha `profile: { xp, dependabots }`**, os valores
  atuais do usuário **depois** de aplicar o lote (uma leitura ao final do
  handler, valores nulos como 0). Mudança aditiva: um app antigo ignora o campo.
  Atualizar `SyncResponseBody` em `contracts.ts`, o `syncResponseSchema` e o
  tratamento em `flushQueue` (o campo é opcional no cliente, por precaução).
- Atualizar o Swagger do `/sync` (descrição: lição também credita XP e Bits) e os
  testes de `test/routes/sync/` — XP, Bits, cruzamento de um e de vários níveis
  numa lição só (não acontece com 10 XP por lição, então teste a função pura
  separadamente), idempotência (`duplicate` não paga), teto do nível 50.

### 4. Perfil

- `UserHeader`: o selo passa a mostrar o **nível** ("Nv. 7"); o XP total fica
  visível no corpo do perfil.
- No perfil, um bloco com **barra de progresso até o próximo nível** (XP no
  nível / necessário) e os **Bits**. No nível 50: "Nível máximo".
- Usa os componentes `Themed*` e as primitivas de layout; respeita fonte
  aumentada (`ResizableText`) e o tema claro/escuro. Layout exato: do builder.

### 5. Tela de conclusão da lição (nova)

**Não existe hoje**: ao terminar, `Lesson.finish` grava e volta com `goBack()`.
A Fase 1 acrescenta uma tela/camada de conclusão, mostrada em `Lesson` no lugar
do `goBack()` imediato.

- Mostra: "+10 XP" e a barra de nível **animando** do valor anterior ao novo.
  Se subiu de nível: destaque "Nível N!" e "+X Bits". Se `firstTime` for falso:
  "Lição já concluída" e nenhum ganho (sem barra animando).
- Botão **Continuar** → `goBack()`. Fechar pelo voltar do Android também sai.
- A ordem em `finish` se mantém: `recordLessonCompletion` e depois
  `evaluateAfterLesson` (conquistas) — e só então a tela de conclusão.
- **Respeita "reduzir movimento"** (como o `AchievementSpotlight`): sem
  animação, o estado final aparece direto.
- Quem não tem `remoteId` (sem usuário) continua indo direto para o `goBack()`.

### 6. Bits: renome

- Texto: "Dependabots" → "Bits" (pt e en, incluindo as chaves de alerta e do
  cabeçalho da loja).
- Ícone: trocar o `octicons: dependabot` (marca da GitHub) por um genérico (chip,
  moeda ou o Cody). Uso em `MarketHeader`, `SurpriseChest`, `DoubleExperience`,
  `DoubleTime`, `MarketModal`.
- Os preços exibidos na loja não mudam nesta fase. **Corrigir a inconsistência
  do Dobro de Tempo**: o card diz 300 e o modal de compra usa 200; vale **300**
  (o valor da lógica original em `Market.tsx`), então o modal passa a 300. O
  **Dobro de XP** tem a inconsistência inversa (card 200, modal 300): vale **200**,
  também da lógica original, e o modal passa a 200.

### 7. Bits retroativos (script avulso)

Hoje `dependabots` é 0 (ou nulo) em todas as contas, e o XP delas já existe.
Sem tratamento, quem tem 300 XP está no nível 6 e nunca recebe os Bits dos
níveis 2 a 6, porque o crédito só acontece ao *cruzar* um nível.

- Script `api/prisma/backfillBits.ts` (no mesmo estilo de `checkSeedDrift.ts`
  e `generateSeed.ts`): para cada usuário, `dependabots = max(dependabots, 
  bitsEarnedBetween(0, xp))`. **Idempotente** (rodar de novo não muda nada) e
  **só aumenta**.
- Por ser seguro só enquanto nenhum Bit foi gasto ou concedido por outro
  caminho, **roda uma vez, antes da Fase 2**. Depois da Fase 2 (saldo com gastos)
  esse script deixaria de ser seguro e deve ser removido ou desativado.
- Ele escreve no banco real: **executar só com a confirmação do
  desenvolvedor**, depois de mostrar quantas contas seriam alteradas (modo de
  simulação por padrão).
- No app, o valor retroativo chega pelo mesmo caminho de sempre: o próximo login
  (ou sincronização com a fila vazia) adota o saldo do servidor.

### 8. Documentação e verificação

- Atualizar `app/CLAUDE.md` (XP local, níveis, tela de conclusão, conciliação),
  `api/CLAUDE.md` (sync credita XP e Bits, curva duplicada), `CLAUDE.md` da raiz
  se o resumo mudar. Sem mudança de conteúdo pedagógico: **o `seed.ts` não é
  tocado**.
- Verificar: `pnpm api:test`, typecheck do app e da API; a curva por um script
  descartável (pontos de referência acima); e no emulador — concluir uma lição,
  ver a barra e a subida de nível, refazer a mesma lição e ver que não paga.
  O emulador pode estar em uso por outra frente: **perguntar antes de recarregar
  ou tocar**.

## Fases seguintes (decididas, ainda não construir)

**Fase 2 — loja funcional.** Hoje todo botão de compra é um "em breve", e os
flags `doubleXp`/`doubleTime` nunca são lidos. Gastar Bits exige **autoridade no
servidor** (saldo), então vira um desenho próprio: saldo = ganhos − gastos, e um
evento ou endpoint de compra validado. Itens:
- **Dica instantânea** (no lugar do Dobro de Tempo): libera a próxima dica de um
  `code_editor` sem esperar. Já cabe no `ChallengeHelp` (passo a cada 2
  execuções que não passam ou 90 s); não precisa de cronômetro novo.
- **Dobro de XP**: multiplica o XP do conteúdo opcional (o da trilha segue fixo,
  porque o servidor calcula 10 por lição).

**Fase 3 — conteúdo opcional.**
- **Aprofundamento por nível**: aulas opcionais, **apagadas com borda tracejada,
  cadeado e o nível exigido** no cartão ("Nível 12"); desbloqueadas, ganham borda
  **roxa sutil** (menos chamativa que o troféu dourado do desafio do módulo). O
  XP delas conta para o nível. Para chegar ao nível 50 faltariam ~1710 XP além
  da trilha: é o tamanho-alvo, não uma obrigação — no começo bastam poucas.
- **Baú Surpresa**: abrir custa Bits e revela uma aula **exclusiva e muito
  difícil**, que fica **para sempre** (coleção), com borda **magenta** e uma
  **caveira cibernética** (a forma garante que não dependa só de cor). Aulas
  não reveladas ficam **ocultas**; o modal do baú, na loja, mostra a contagem por
  área ("HTML: 3 de 8 · CSS: 1 de 6 · JavaScript: 4 de 9"). Garantia contra
  azar: a cada X baús, sai pelo menos uma aula nova. Pool inicial pequeno
  (3–4 por área). Conteúdo novo passa pelo dashboard, `seed.ts`, `seed:check` e
  uma `content_version`.
- A indicação de nível acima da área, nas trilhas: **adiada** pelo desenvolvedor.

**Futuro.** Conquistas de completude ("todas as aulas de HTML desbloqueadas") no
sistema de emblemas existente; cosméticos.

## Restrições

- App offline-first: nada novo pode exigir rede para a pessoa ver o próprio
  nível. O SQLite é a fonte da verdade e a nuvem só recebe.
- Prazo do TCC: sem cosméticos, sem cronômetro, sem conteúdo novo na Fase 1.
- Regras do repositório: nunca fazer eject do Expo; nenhum commit sem pedido do
  desenvolvedor; ler só `.env.example`, nunca `.env`.
- O `sync` continua idempotente por constraint única; não criar tabela de log
  genérica.

## Deixado ao builder

Layout e visual exatos do perfil e da tela de conclusão; biblioteca de animação
(já há `react-native-animatable` e `react-native-svg` no projeto); o ícone dos
Bits; nomes de arquivos e componentes; como testar a função pura do app (o app
não tem suíte de testes).
