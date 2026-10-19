# XP, níveis e Bits (Fase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar uso ao XP com um nível (1–50) calculado no app, mostrar o progresso no perfil e numa tela de conclusão de lição, e trocar "Dependabots" por **Bits**, creditados ao subir de nível.

**Architecture:** Funções puras de nível vivem duplicadas na API e no app (o app só importa `codap-api` como tipo). O app grava XP/Bits no SQLite na mesma transação da conclusão (offline-first); o `/sync` credita no servidor e devolve `profile: { xp, bits }`, que o app adota quando a fila está vazia. A coluna `dependabots` vira `bits` no Postgres, no SQLite e no código.

**Tech Stack:** Fastify 5 + Prisma 7 (Postgres/Neon) + `node:test` na API; Expo/React Native + `expo-sqlite` + zustand + react-i18next no app.

**Spec:** `docs/superpowers/specs/2026-10-18-xp-niveis-bits-design.md`

## Global Constraints

- **Sem commits**: nenhum commit sem pedido explícito do desenvolvedor (CLAUDE.md). Este plano não tem passos de commit.
- **Nunca ler `.env`** (só `.env.example`). Comandos que usam `DATABASE_URL` por baixo (`prisma migrate deploy`, testes) são permitidos.
- **Nunca fazer eject do Expo.**
- Curva: `thresholdForLevel(n) = round(0.41·(n−1)² + 54·(n−1))`, `n` de 1 a 50; `MAX_LEVEL = 50`; `LESSON_XP_REWARD = 10`; `bitsForLevel(n) = 10·n` para `n ≥ 2`, `0` para nível 1. Referências: nível 2 = 54, 10 = 519, 19 = 1105, 30 = 1911, 50 = 3630.
- XP e Bits só na **primeira** conclusão de cada lição, no app e no servidor.
- Imports relativos da API com extensão `.js` (ESM). Todo endpoint alterado atualiza Swagger (`schema`) e testes na mesma tarefa.
- Instalar dependências só pela raiz; comandos via `pnpm --filter codap-api …` / `pnpm --filter codap …`.
- Textos de UI em `pt.json` e `en.json`; componentes `Themed*` e primitivas de layout; respeitar "reduzir movimento".
- Sem mudança de conteúdo pedagógico: `api/prisma/seed.ts` não é tocado.

## Review Focus

1. **Refazer uma lição já concluída** não rende XP/Bits no app (e o `/sync` responde `duplicate` sem pagar). Teste na API; no app, verificação manual descrita na Task 8.
2. **Perfil velho no AsyncStorage** (`dependaBots`, XP do dia do login) após atualizar o app ou reabrir: a UserStore deve nascer com o XP/Bits do SQLite. Task 7.
3. **Lote com várias lições cruzando um nível** não conta o Bit duas vezes (eventos rodam em `Promise.all`). Task 3.
4. **XP acima do teto, negativo ou nulo**: nível 50 com barra "máximo", sem `NaN`/divisão por zero; `xp`/`bits` nulos no banco contam como 0. Tasks 2, 3 e 5.
5. **Servidor antigo sem `profile` na resposta** e fila com eventos `failed`: não quebram o flush, e `failed` não impede adotar o valor do servidor. Task 7.

---

### Task 1: API — renomear `dependabots` para `bits`

**Files:**
- Modify: `api/prisma/schema.prisma:51`, `api/src/routes/users/{create,update,list,getById}.ts`, `api/src/routes/users/users.schema.ts`, `api/src/routes/auth/{register,login}.ts`, `api/src/routes/auth/auth.schema.ts`
- Create: `api/prisma/migrations/20261018140000_rename_dependabots_to_bits/migration.sql`
- Test: `api/test/routes/users/create.test.ts`, `api/test/routes/users/update.test.ts` (e qualquer teste de auth que leia o campo)

**Interfaces:**
- Produces: `users.bits` (Prisma `Int?`, nome da coluna `bits`); `UserResponse` ganha `bits` e perde `dependabots` (derivado do Prisma). Corpo de `POST /users` e `PATCH /users/:id` aceita `bits` no lugar de `dependabots`.

- [ ] **Step 1: Atualizar os testes para `bits`** (`create.test.ts`: `body.bits === 0` e payload `{ xp: 42, bits: 3 }` → `body.bits === 3`; `update.test.ts`: fixture `bits: 0`). Rodar `pnpm --filter codap-api exec tsx --test test/routes/users/create.test.ts` (ou o comando de arquivo único de `api/CLAUDE.md`): deve **falhar**.
- [ ] **Step 2: Editar `schema.prisma`** (`bits Int?`) e criar a migration com `ALTER TABLE "users" RENAME COLUMN "dependabots" TO "bits";` (preserva os dados; não editar a migration `init`).
- [ ] **Step 3: Aplicar e regenerar**: `pnpm --filter codap-api exec prisma migrate deploy` e `pnpm --filter codap-api exec prisma generate`. Esperado: migration aplicada sem erro. (Mexe no banco real, autorizado pelo desenvolvedor.)
- [ ] **Step 4: Trocar `dependabots` por `bits`** em todas as rotas e schemas listados (lista exata no `grep` de `dependabots` em `api/src`). O `select` explícito do Prisma continua sem `password`.
- [ ] **Step 5: Rodar** `pnpm --filter codap-api build:ts` (compila sem erro) e os testes de `users` e `auth` (passam).

### Task 2: API — funções puras de nível (`levels`)

**Files:**
- Create: `api/src/utils/levels.ts`
- Test: `api/test/utils/levels.test.ts`

**Interfaces:**
- Produces (todas exportadas):
  - `const MAX_LEVEL = 50`, `const LESSON_XP_REWARD = 10`
  - `thresholdForLevel(level: number): number` — recorta `level` em `[1, MAX_LEVEL]`
  - `levelForXp(xp: number): number` — `xp` negativo/`NaN` → 1; acima do limiar 50 → 50
  - `interface LevelProgress { level: number; xpIntoLevel: number; xpForNextLevel: number | null; fraction: number; isMax: boolean }`
  - `progressInLevel(xp: number): LevelProgress` — no nível 50: `xpForNextLevel: null`, `fraction: 1`, `isMax: true`
  - `bitsForLevel(level: number): number`
  - `bitsEarnedBetween(xpBefore: number, xpAfter: number): number` — soma `bitsForLevel(n)` para `n` em `(levelForXp(before), levelForXp(after)]`; `0` se `after <= before`

- [ ] **Step 1: Escrever os testes** (`levels.test.ts`): limiares 1/2/10/19/30/50 = 0/54/519/1105/1911/3630; limiares estritamente crescentes de 1 a 50; `levelForXp` de 0→1, 53→1, 54→2, 550→10, 1160→19, 1920→30, 10000→50, −5→1, `NaN`→1; `progressInLevel(0)` = nível 1, `xpIntoLevel 0`, `xpForNextLevel 54`, `fraction 0`; `progressInLevel(4000).isMax === true` e `fraction === 1`; `bitsEarnedBetween(0, 54) === 20`, `(0, 519) === 540`, `(53, 53) === 0`, `(100, 50) === 0`.
- [ ] **Step 2: Rodar** `node --import tsx --test test/utils/levels.test.ts` em `api/`: falha (módulo inexistente).
- [ ] **Step 3: Implementar** `levels.ts` com as assinaturas acima. Comentário no topo: "Duplicado em `app/src/utils/levels.ts` — mudou um, mude o outro" (mesma regra dos ids de conquista).
- [ ] **Step 4: Rodar o teste**: passa.

### Task 3: API — `/sync` credita Bits e devolve `profile`

**Files:**
- Modify: `api/src/routes/sync/create.ts`, `api/src/routes/sync/sync.schema.ts`, `api/src/types/contracts.ts`
- Test: `api/test/routes/sync/create.test.ts`

**Interfaces:**
- Consumes: `LESSON_XP_REWARD`, `bitsEarnedBetween` de `utils/levels.js` (remover a constante local de `create.ts`).
- Produces: `SyncResponseBody` ganha `profile?: { xp: number; bits: number }` (em `contracts.ts`); a API sempre o envia.

- [ ] **Step 1: Escrever os testes** (reutilizando `registerTestUser`/`createLessonFixture`; o cleanup do usuário já cobre `user_lessons`):
  - `POST /sync below the first level threshold credits no Bits`: 1 lição → `users.xp === 10`, `users.bits === 0`, `body.profile` igual a `{ xp: 10, bits: 0 }`.
  - `POST /sync credits Bits once when a batch crosses a level`: **6 eventos** (6 fixtures) no mesmo lote → `xp === 60`, `bits === 20` (nível 2 em 54 XP), `body.profile` igual a `{ xp: 60, bits: 20 }`.
  - `POST /sync does not pay a duplicate lesson`: mesmo evento em duas requisições → segunda `duplicate`, `profile.xp` continua 10.
  - `POST /sync treats null xp and bits as zero`: depois de registrar, `prisma.users.update({ data: { xp: null, bits: null } })`; uma lição → `xp === 10`.
  - `POST /sync returns the profile even with no events`: `events: []` → 200 e `profile` `{ xp: 0, bits: 0 }`.
- [ ] **Step 2: Rodar o arquivo de teste**: os novos falham.
- [ ] **Step 3: Implementar em `applyLessonCompleted`**, dentro da transação existente: normalizar nulos (`updateMany` com `where: { id, xp: null }` → `xp: 0`, e idem `bits`), depois `update` de `xp` com `increment` e `select: { xp: true }`; `bits` creditado com `bitsEarnedBetween(xp − LESSON_XP_REWARD, xp)` na mesma transação (o `UPDATE` trava a linha, então o XP devolvido é serializado entre eventos concorrentes do lote). Ao fim do handler, ler `xp`/`bits` do usuário (`findUniqueOrThrow`, nulos → 0) e responder `{ results, profile }`.
- [ ] **Step 4: Declarar `profile`** em `syncResponseSchema` (objeto com `xp` e `bits` inteiros, não obrigatório no schema de resposta — o `fast-json-stringify` apaga o que não está declarado) e em `SyncResponseBody`. Atualizar `description` da rota: lição também credita XP e Bits e a resposta traz o perfil.
- [ ] **Step 5: Rodar** `pnpm --filter codap-api test` completo: tudo passa.

### Task 4: API — script de Bits retroativos

**Files:**
- Create: `api/prisma/backfillBits.ts`
- Modify: `api/package.json` (script `bits:backfill`), `package.json` da raiz (atalho `api:bits:backfill`)

**Interfaces:**
- Consumes: `bitsEarnedBetween` de `src/utils/levels.js`.
- Produces: script que, **por padrão, só simula** (lista quantas contas mudariam e o total de Bits a conceder) e só escreve com `--apply`; para cada usuário `bits = max(bits ?? 0, bitsEarnedBetween(0, xp ?? 0))`. Idempotente e só aumenta. Mesmo estilo de conexão de `checkSeedDrift.ts` (`PrismaPg`, `$disconnect()` no fim, nada de Fastify).

- [ ] **Step 1: Implementar** o script com uma função pura exportada `bitsToGrant(xp: number | null, bits: number | null): number` (retorna o novo saldo) e o `main()` atrás da checagem de execução direta (`import.meta.url` × `process.argv[1]`), como `seed.ts`.
- [ ] **Step 2: Rodar a simulação** (`pnpm --filter codap-api bits:backfill`, sem `--apply`) e anotar a saída. **Não rodar com `--apply`**: escreve no banco real e depende de confirmação do desenvolvedor.

### Task 5: App — funções puras de nível

**Files:**
- Create: `app/src/utils/levels.ts`

**Interfaces:**
- Produces: exatamente as mesmas exportações e assinaturas de `api/src/utils/levels.ts` (Task 2), mais o mesmo comentário de duplicação. Sem imports.

- [ ] **Step 1: Copiar a implementação da Task 2** para `app/src/utils/levels.ts`.
- [ ] **Step 2: Verificar com um script descartável** no scratchpad que importa o arquivo do app pelo caminho absoluto e reexecuta as mesmas asserções dos testes da Task 2 (o app não tem suíte de testes), rodando-o com o `tsx` da API (`pnpm --filter codap-api exec tsx <script>`). Esperado: nenhuma asserção falha. Apagar o script.

### Task 6: App — SQLite: coluna `bits` e DatabaseClient

**Files:**
- Modify: `app/src/services/migrations.ts`, `app/src/services/DatabaseClient.ts`, `app/src/types/entities.d.ts`

**Interfaces:**
- Consumes: `levelForXp`, `bitsEarnedBetween`, `LESSON_XP_REWARD` de `utils/levels`.
- Produces:
  - `User.bits: number` (substitui `dependaBots`).
  - `interface LessonCompletionResult { firstTime: boolean; xpGained: number; bitsGained: number; xpBefore: number; xpAfter: number; levelBefore: number; levelAfter: number; bitsAfter: number }` (em `entities.d.ts`).
  - `completeLesson(userId: string, lessonId: number): LessonCompletionResult`
  - `getLocalProfile(userId: string): User | null`
  - `hasUnsyncedEvents(userId: string): boolean` — há `pending` ou `syncing` para o usuário
  - `applyServerProfile(userId: string, profile: { xp: number; bits: number }): User | null`
  - `upsertLocalProfile(profile: { remoteId; name; email; xp: number | null; bits: number | null }): User`

- [ ] **Step 1: Migration v5** em `migrations.ts`: `ALTER TABLE Users RENAME COLUMN dependaBots TO bits;`, `CURRENT_SCHEMA_VERSION = 5`. **Trocar o `PRAGMA user_version = ${CURRENT_SCHEMA_VERSION}` do bloco v4 por `= 4` literal** (senão uma instalação nova pularia direto para 5 antes do bloco v5 e a leitura de `version` seguiria correta só por acaso). Atualizar o comentário do topo e as colunas dos `CREATE TABLE`/`INSERT` antigos **não** (migrações aplicadas são imutáveis; só o v5 renomeia).
- [ ] **Step 2: `completeLesson`** passa a, dentro da mesma `withTransactionSync`: se já existe linha em `UserLessons` para `(userId, lessonId)`, **não grava nada** e devolve `firstTime: false` com ganhos 0 e os valores atuais; senão insere a lição e o evento da fila, soma `LESSON_XP_REWARD` em `Users.xp` (nulo → 0) e `bitsEarnedBetween(xpBefore, xpAfter)` em `Users.bits`, e devolve o resultado. Evento duplicado deixa de ser enfileirado (o servidor já é idempotente; decisão minha, o resultado é o mesmo).
- [ ] **Step 3: `upsertLocalProfile`**: `bits` no lugar de `dependaBots`; no ramo do usuário existente, se `hasUnsyncedEvents` → `xp`/`bits` = `max(local, servidor)`; senão o valor do servidor vence. Ramo de inserção usa o do servidor (nulo → 0).
- [ ] **Step 4: Implementar** `getLocalProfile`, `hasUnsyncedEvents` e `applyServerProfile` (atualiza `xp`/`bits` e devolve o `User` resultante; `null` se a linha não existe).
- [ ] **Step 5: Verificar**: `npx tsc --noEmit` em `app/` (ainda vai acusar os arquivos das Tasks 7 a 10 que usam `dependaBots`; os erros restantes devem ser só esses).

### Task 7: App — SyncService, perfil em cache e UserStore

**Files:**
- Modify: `app/src/services/SyncService.ts`, `app/src/services/AuthService.ts`

**Interfaces:**
- Consumes: Task 6 (`completeLesson`, `hasUnsyncedEvents`, `applyServerProfile`, `getLocalProfile`); `SyncResponseBody.profile?` de `contracts.ts`.
- Produces: `recordLessonCompletion(userId: string, lessonId: number): LessonCompletionResult` (antes `void`); `getCachedProfile()` passa a devolver o perfil do SQLite.

- [ ] **Step 1: `recordLessonCompletion`** devolve o resultado do `completeLesson` e, quando `firstTime`, atualiza a `UserStore` (`useUserStore.getState().setUser({ ...user, xp: xpAfter, bits: bitsAfter })`, só se o `remoteId` do usuário na store for o mesmo); o `flushQueue()` continua sendo disparado em seguida.
- [ ] **Step 2: `flushQueue`**: depois de processar `data.results`, se `data.profile` existe **e** `!database.hasUnsyncedEvents(userId)` (checado *depois* da resposta; eventos `failed` não contam), chamar `applyServerProfile` e refletir o usuário retornado na `UserStore`. Sem `profile` (servidor antigo): não faz nada.
- [ ] **Step 3: `getCachedProfile`** (AuthService): lê o JSON do AsyncStorage só para descobrir o `remoteId` e devolve `database.getLocalProfile(remoteId)` (com `initDefaultTables()` antes, como o login); se a linha não existir, devolve `null`. `applySession` passa `bits: authResponse.user.bits`. Isso corrige o XP velho do cache e o campo legado `dependaBots`.
- [ ] **Step 4: Verificar** `npx tsc --noEmit` em `app/`: erros só nos arquivos das Tasks 8 a 10.

### Task 8: App — tela de conclusão da lição

**Files:**
- Create: `app/src/screens/classes/components/LessonComplete.tsx`
- Modify: `app/src/screens/classes/Lesson.tsx`, `app/src/translations/i18n/locales/pt.json`, `en.json`

**Interfaces:**
- Consumes: `LessonCompletionResult`, `progressInLevel` (`utils/levels`), `recordLessonCompletion`.
- Produces: `LessonComplete({ result, onContinue }: { result: LessonCompletionResult; onContinue: () => void })`; chaves i18n `levels.complete.*` e `levels.*`.

- [ ] **Step 1: Criar `LessonComplete`**: mostra "Lição concluída!", "+{xp} XP" e a barra de nível (`progressInLevel`) animando do valor anterior ao novo com `Animated`; se `levelAfter > levelBefore`, a barra enche, reinicia e segue até o novo nível, e aparecem "Nível N!" (com `spring`) e "+X Bits". Se `!firstTime`: "Você já tinha concluído esta lição. Sem XP desta vez.", sem barra animando. Botão **Continuar** chama `onContinue`. Em "reduzir movimento" (`AccessibilityInfo.isReduceMotionEnabled`, como no `AchievementSpotlight`) mostra o estado final direto. Usa `Themed*`/`ResizableText`.
- [ ] **Step 2: Integrar em `Lesson.tsx`**: `finish` guarda o resultado de `recordLessonCompletion` num `useState`, mantém a ordem `recordLessonCompletion` → `evaluateAfterLesson`, e renderiza `LessonComplete` no lugar do `ActivityPlayer` até o toque em Continuar (`goBack`). Sem `remoteId`, `finish` continua indo direto para `goBack()`.
- [ ] **Step 3: Strings** em pt e en (título, `+{{xp}} XP`, já concluída, `Nível {{level}}!`, `+{{bits}} Bits`, Continuar).
- [ ] **Step 4: Verificar** `npx tsc --noEmit`. Verificação manual (emulador, **perguntar antes de tocar nele**): concluir uma lição vê "+10 XP" e a barra; refazer a mesma lição mostra "já concluída" e o XP do perfil não muda.

### Task 9: App — nível e progresso no perfil

**Files:**
- Create: `app/src/screens/user/components/LevelProgress.tsx`
- Modify: `app/src/screens/user/components/UserHeader.tsx`, `app/src/screens/user/User.tsx`

**Interfaces:**
- Consumes: `progressInLevel`, `useUserStore`.
- Produces: `LevelProgress()` (sem props, lê a store): nível, barra, `xpIntoLevel / xpForNextLevel XP`, XP total e Bits; no nível 50 mostra "Nível máximo".

- [ ] **Step 1: `UserHeader`**: o selo mostra "Nv. N" (`levelForXp(user.xp ?? 0)`) em vez de "XP: n".
- [ ] **Step 2: `LevelProgress`** como primeiro item do `ScrollView` de `User.tsx` (não mexe no layout fixo acima). Respeita fonte aumentada (`ResizableText`) e tema.
- [ ] **Step 3: Verificar** `npx tsc --noEmit` e abrir a tela no emulador se estiver livre.

### Task 10: App — renome para Bits na loja e preços

**Files:**
- Modify: `app/src/screens/market/components/{MarketHeader,MarketModal,SurpriseChest,DoubleExperience,DoubleTime}.tsx`, `app/src/screens/market/Market.tsx`, `pt.json`, `en.json`

- [ ] **Step 1: Ícone**: trocar `octicons`/`dependabot` por `octicons`/`cpu` em todos os usos; `MarketHeader` lê `user?.bits`.
- [ ] **Step 2: Textos**: "COMPRE COM DEPENDABOTS" → "COMPRE COM BITS" e "Dependabots insuficientes" → "Bits insuficientes" (pt e en); remover as referências a `dependaBots` no código comentado de `Market.tsx` ou atualizá-las para `bits`.
- [ ] **Step 3: Preços**: `DoubleExperience` modal `price={200}` (card já 200); `DoubleTime` modal `price={300}` (card já 300).
- [ ] **Step 4: Verificar** `grep -ri dependa` em `app/src` e `api/src` sem ocorrências (exceto a migration `init` e a de renome), e `npx tsc --noEmit` limpo.

### Task 11: Documentação e verificação final

**Files:**
- Modify: `app/CLAUDE.md`, `api/CLAUDE.md`, `CLAUDE.md` (raiz), `package.json` (raiz, atalho da Task 4)

- [ ] **Step 1: `app/CLAUDE.md`**: esquema local v5 (`bits`), XP/Bits locais e a regra "só na primeira conclusão", a tela de conclusão, a adoção do `profile` do servidor, `getCachedProfile` vindo do SQLite, `levels.ts` duplicado, Bits (ícone `cpu`). **`api/CLAUDE.md`**: `/sync` credita Bits e devolve `profile`, `levels.ts`, `users.bits`, o script de Bits retroativos (rodar uma vez, antes da Fase 2). **Raiz**: atualizar o resumo do estado do app/API.
- [ ] **Step 2: Rodar** `pnpm --filter codap-api test` (tudo passa), `npx tsc --noEmit` em `app/` (limpo) e `pnpm --filter codap-api build:ts`.
- [ ] **Step 3: Revisar o diff** (`git diff --stat` e leitura dos arquivos tocados) e conferir os cinco itens do Review Focus. Reportar o que foi verificado e o que não foi (emulador, `--apply` do script).
