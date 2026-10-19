# Aulas de aprofundamento por nível (Fase 3a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aulas opcionais liberadas por nível, que rendem XP próprio, com estados visuais no app, edição no dashboard e um piloto de 3 lições.

**Architecture:** Duas colunas anuláveis em `lessons` (`min_level`, `xp_reward`) atravessam a API (`GET /modules`, rotas de escrita, `/sync`), o app (lista, bloqueio, XP, conquistas) e o dashboard. O nível mínimo é o que define a aula opcional.

**Tech Stack:** Fastify + Prisma + `node:test` (API); Expo/React Native (app); Vite/React/zod/Playwright (dashboard).

**Spec:** `docs/superpowers/specs/2026-10-18-aulas-aprofundamento-design.md`

## Global Constraints

- Sem commits sem pedido; nunca ler `.env`; nunca fazer eject do Expo.
- `min_level`: inteiro de 2 a 50 ou nulo. `xp_reward`: inteiro de 1 a 100 ou nulo (nulo = 10, `LESSON_XP_REWARD`).
- Aulas opcionais nunca contam para `isAreaComplete` e nunca bloqueiam a trilha.
- O servidor não confere `min_level` no `/sync`.
- Não publicar `content_version` (decisão do desenvolvedor depois do app novo estar com os alunos).
- Conteúdo pedagógico: pt e en; código com no máximo 30 caracteres por linha; exemplos de JavaScript executados antes de gravar; **atualizar `api/prisma/seed.ts` na mesma tarefa** e confirmar com `pnpm api:seed:check`.
- Mudança de UI do dashboard: validar com `pnpm dash:verify` (API em `NODE_ENV=development` e dev server no ar).
- Imports relativos da API com `.js`; todo endpoint alterado atualiza Swagger e testes.

## Review Focus

1. Lição sem `minLevel` (cache antigo, campo ausente) é tratada como trilha principal em todo o app.
2. Aula opcional **não** impede o emblema da área, e a trilha sozinha continua a completar a área.
3. `PATCH /lessons/:id` com `minLevel: null` limpa o campo; sem o campo, não mexe; corpo vazio é 400.
4. XP de aula opcional cruzando mais de um nível paga os Bits de todos os níveis cruzados (app e servidor).
5. Aula bloqueada aberta por deep link não roda nem paga XP.

---

### Task 1: API — colunas, `GET /modules` e contratos

**Files:** Modify `api/prisma/schema.prisma` (model `lessons`), `api/src/routes/modules/list.ts`, `api/src/routes/modules/modules.schema.ts` (`lessonResponseSchema`), `api/src/types/contracts.ts` (`LessonResponse`); Create `api/prisma/migrations/20261018150000_lessons_min_level_xp_reward/migration.sql`; Test `api/test/routes/modules/list.test.ts`.

**Interfaces:** Produces `LessonResponse.minLevel: number | null`, `LessonResponse.xpReward: number | null`; colunas `lessons.min_level`, `lessons.xp_reward`.

- [ ] **Step 1 (RED):** em `list.test.ts`, um teste `GET /modules returns minLevel and xpReward of a lesson (null for a main-trail lesson)`: cria uma lição com `min_level: 8, xp_reward: 30` e outra sem os campos (fixtures de `contentFixtures.ts`) e confere `{ minLevel: 8, xpReward: 30 }` e `{ minLevel: null, xpReward: null }`. Rodar: falha.
- [ ] **Step 2:** adicionar `min_level Int?` e `xp_reward Int?` ao model; migration `ALTER TABLE "lessons" ADD COLUMN "min_level" INTEGER, ADD COLUMN "xp_reward" INTEGER;`; `prisma migrate deploy` e `prisma generate`.
- [ ] **Step 3:** `list.ts` seleciona e devolve os dois campos (`minLevel: lesson.min_level`, `xpReward: lesson.xp_reward`); `lessonResponseSchema` os declara como `['integer', 'null']` (e no `required`) — um campo não declarado é apagado pelo serializador; `LessonResponse` ganha os tipos.
- [ ] **Step 4:** `pnpm --filter codap-api build:ts` e o teste do passo 1 passam.

### Task 2: API — escrita de lições

**Files:** Modify `api/src/routes/lessons/{create,update}.ts`, `lessons.schema.ts`, `api/src/utils/content.ts` (`findAdminLessons`), `contracts.ts` (`AdminLessonResponse`, `CreateLessonBody`, `UpdateLessonBody`); Test `api/test/routes/lessons/write.test.ts`.

**Interfaces:** Consumes Task 1. Produces `AdminLessonResponse.minLevel/xpReward` e os campos nos corpos de create/update.

- [ ] **Step 1 (RED), em `write.test.ts` (com `useDevelopmentEnv(t)` antes de `build(t)`):**
  `POST /lessons stores minLevel and xpReward`; `POST /lessons rejects minLevel 1 and xpReward 0 and 101 with 400`; `PATCH /lessons/:id sets minLevel and xpReward without touching translations`; `PATCH /lessons/:id with minLevel null clears it`; `PATCH /lessons/:id without minLevel leaves it alone`; `PATCH /lessons/:id with an empty body is 400`; e que `translations` sozinho continua funcionando.
- [ ] **Step 2:** schemas: `minLevel: { type: ['integer','null'], minimum: 2, maximum: 50 }`, `xpReward: { type: ['integer','null'], minimum: 1, maximum: 100 }` em create/update e na resposta admin; no update, `translations` deixa de ser `required` e o corpo ganha `minProperties: 1`. Rotas gravam `min_level`/`xp_reward` (`undefined` não mexe, `null` limpa); `findAdminLessons` devolve os dois; descrições do Swagger atualizadas.
- [ ] **Step 3:** testes de `lessons` e `modules` passam.

### Task 3: API — `/sync` paga o XP da lição

**Files:** Modify `api/src/routes/sync/create.ts`; Test `api/test/routes/sync/create.test.ts`.

**Interfaces:** Consumes `lessons.xp_reward`.

- [ ] **Step 1 (RED):** `POST /sync pays the xpReward of an optional lesson` (lição com `xp_reward: 30` → `xp === 30`, `profile.xp === 30`); `POST /sync pays Bits for every level an optional lesson crosses` (XP prévio 100 + lição de 30 cruza o nível 3: `bits === 30`); `POST /sync falls back to 10 XP when xp_reward is null` (já coberto pelos testes existentes, conferir que seguem verdes).
- [ ] **Step 2:** em `applyLessonCompleted`, depois do insert em `user_lessons`, ler `xp_reward` da lição na mesma transação; `reward = xp_reward ?? LESSON_XP_REWARD`; usar `reward` no `increment` e em `bitsEarnedBetween(xp − reward, xp)`. Atualizar a descrição do Swagger.
- [ ] **Step 3:** testes do sync passam.

### Task 4: Ferramentas de seed

**Files:** Modify `api/prisma/seed.ts` (`LessonSeed` e `seedModuleLessons`), `api/prisma/generateSeed.ts`, `api/prisma/checkSeedDrift.ts`.

- [ ] **Step 1:** `LessonSeed` ganha `minLevel?: number` e `xpReward?: number`; `seedModuleLessons` grava `min_level`/`xp_reward` ao criar a lição.
- [ ] **Step 2:** `generateSeed.ts`: `LessonDump` ganha os dois campos (só quando não nulos) e `FIELD_ORDER_TABLE` troca `['name','activities']` por `['name','minLevel','xpReward','activities']`; `fetchLessons` os lê.
- [ ] **Step 3:** `checkSeedDrift.ts` compara `minLevel`/`xpReward` (nulo no banco vs ausente no seed é igual) e relata a diferença por lição.
- [ ] **Step 4:** `npx tsc --noEmit` (arquivo a arquivo, `prisma/` não está no tsconfig) e `pnpm seed:check` ainda em dia.

### Task 5: App — acesso, XP, bloqueio e estados visuais

**Files:** Create `app/src/utils/lessonAccess.ts`, `app/src/screens/classes/components/LessonLocked.tsx`; Modify `DatabaseClient.ts`, `SyncService.ts`, `AchievementService.ts`, `Lesson.tsx`, `AreaModules.tsx`, `ClassButton.tsx`, `pt.json`, `en.json`; harness descartável no scratchpad.

**Interfaces:** Produces `isOptionalLesson(lesson: { minLevel?: number | null }): boolean`, `isLessonUnlocked(lesson: { minLevel?: number | null }, level: number): boolean`, `lessonXpReward(lesson: { xpReward?: number | null }): number`; `completeLesson(userId, lessonId, xpReward = LESSON_XP_REWARD)` e `recordLessonCompletion(userId, lessonId, xpReward?)`.

- [ ] **Step 1 (RED, harness):** testes de `lessonAccess` (`minLevel` ausente/`null`/`undefined` = trilha, sempre desbloqueada; `minLevel: 8` bloqueia no nível 7 e libera no 8; `lessonXpReward` = 30 ou 10 se nulo/ausente) e de `completeLesson(U, id, 30)`: `xpAfter 30`, cruza nível 2 (`bitsGained 20`), e XP 100 + 30 cruza o nível 3 (`bitsGained 30`).
- [ ] **Step 2:** implementar `lessonAccess.ts` e o parâmetro de recompensa em `completeLesson`/`recordLessonCompletion`; harness verde.
- [ ] **Step 3:** `isAreaComplete` ignora aulas com `isOptionalLesson`; `Lesson.tsx` passa `lessonXpReward(lesson)` ao concluir e, se a lição está bloqueada para o nível atual, mostra `LessonLocked` (mensagem "Esta aula abre no nível N" e botão de fechar) em vez das atividades.
- [ ] **Step 4:** `ClassButton` ganha `deepening?: boolean` (borda roxa sutil `#8E7CC3`, ícone `rocket-outline`) e `lockedLevel?: number` (apagado, `borderStyle: "dashed"`, cadeado, "Nível N", sem `onPress`); `AreaModules` calcula o nível (`levelForXp(user?.xp ?? 0)`) e passa os props; chaves i18n `levels.requiredLevel`, `levels.lockedLesson.*`.
- [ ] **Step 5:** `npx tsc --noEmit` em `app/` limpo.

### Task 6: Dashboard

**Files:** Modify `dashboard/src/lib/mergeContent.ts`, `components/forms/LessonFormDialog.tsx`, `components/tree/LessonNode.tsx`, `scripts/verifyUi.mjs`, `dashboard/CLAUDE.md`.

- [ ] **Step 1:** `mergeContent` copia `minLevel`/`xpReward` da lição de qualquer idioma (primeiro que chegar).
- [ ] **Step 2:** `LessonFormDialog` ganha o interruptor "Aula de aprofundamento" e, ligado, "Nível mínimo" (2–50) e "XP ao concluir" (1–100, padrão 30); o zod valida só com o interruptor ligado; envia `minLevel`/`xpReward` (`null` quando desligado, para limpar).
- [ ] **Step 3:** `LessonNode` mostra o selo "Nv. N · +XP" nas lições opcionais (`data-testid="lesson-optional-badge"`).
- [ ] **Step 4:** passo novo no `verifyUi.mjs`, só leitura: abre "Editar lição", liga o interruptor, confere que os campos aparecem e que nível 1 é recusado, e fecha sem salvar. Rodar `pnpm dash:verify` com a API em dev e o dev server no ar: sem erro de console.

### Task 7: Conteúdo do piloto

**Files:** Modify `api/prisma/seed.ts` (via `seed:generate`); script avulso descartável.

- [ ] **Step 1:** autorar as 3 lições (HTML JSON-LD, CSS `@layer`, JS iteradores e geradores) em pt e en: 3 `theory`, 3 `option`, 1 `code_blank` cada; exemplos de JavaScript executados; o comportamento do `@layer` conferido no Chromium; `content` validado contra os schemas zod do dashboard (`lib/activitySchemas.ts`).
- [ ] **Step 2:** gravar no banco com um script avulso (módulo Avançado de cada área, `min_level` 8/15/22, `xp_reward` 30), sem publicar `content_version`; apagar o script.
- [ ] **Step 3:** `pnpm seed:generate`, `npx tsc --noEmit` do `seed.ts`, `pnpm seed:check` em dia.

### Task 8: Documentação e verificação

- [ ] **Step 1:** atualizar `CLAUDE.md` (raiz, `api`, `app`, `dashboard`).
- [ ] **Step 2:** `pnpm --filter codap-api test` em série (`--test-concurrency=1`), `npx tsc --noEmit` do app e do dashboard, harness do app, `pnpm dash:verify`. Revisão final por um revisor independente.
