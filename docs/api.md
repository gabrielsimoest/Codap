# Referência da API

Servidor em **Fastify 5 + TypeScript** (ESM), com **Prisma 7** sobre PostgreSQL.
Esta página é um mapa das rotas e das convenções. A fonte da verdade de cada rota
(corpo, parâmetros, respostas, códigos de erro) é o **Swagger**, gerado do `schema`
de cada rota e disponível **em modo dev** em
<http://localhost:3000/documentation> (JSON em `/documentation/json`).

Os tipos de request/response estão em
[`api/src/types/contracts.ts`](../api/src/types/contracts.ts).

## Convenções

- **Base URL**: `http://localhost:3000` em dev; `https://codap.onrender.com` em produção.
- **Autenticação**: `Authorization: Bearer <accessToken>` nas rotas marcadas 🔒.
- **Erros**: corpo no formato do `@fastify/sensible` (`statusCode`, `error`, `message`).
  Alguns erros de conta trazem também `code` (e `suggestion`) para o app montar a
  mensagem no idioma da pessoa — ex.: `email_typo`.
- **Idioma**: rotas de conteúdo recebem `?locale=pt|en` (validado por `enum`).
- **Ambiente**: 🛠 = só existe com `NODE_ENV=development`; em produção responde 404.
- **Limites**: global de 100 requisições/min por IP; rotas sensíveis têm limite próprio
  (coluna *Limite*).
- **Respostas de lote** (`/sync`) são `200` mesmo quando eventos individuais falham —
  o resultado de cada um vem no corpo.

## Saúde

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | `{ "root": true }`. A rota mais leve (sem banco); usada pelo app e pelo monitor para "acordar" o servidor. |

## Autenticação e conta — `/auth`

| Método | Rota | Auth | Limite | Descrição |
|---|---|---|---|---|
| POST | `/auth/register` | — | 5/min | Cria a conta e envia o e-mail de confirmação. Recusa domínios com erro de digitação (só em produção). |
| POST | `/auth/login` | — | 5/min | Devolve `accessToken`, `refreshToken` e o usuário. Envia as boas-vindas no primeiro login. |
| POST | `/auth/refresh` | — | 20/min | Rotaciona o refresh token (com janela de tolerância de 5 min). |
| POST | `/auth/logout` | — | global | Revoga o refresh token deste dispositivo. Idempotente (204). |
| GET | `/auth/me` | 🔒 | global | A conta, com `email_verified_at`. |
| POST | `/auth/verify-email` | — | 10/min | Consome o token do link e confirma o e-mail. |
| GET | `/auth/verify-email` | — | 10/min | **Página HTML** aberta pelo link; não consome o token. |
| POST | `/auth/resend-verification` | 🔒 | 3/10 min | Reenvia a confirmação. 409 se já confirmado. |
| POST | `/auth/change-email` | 🔒 | 5/10 min | Corrige o e-mail **enquanto não confirmado**. |
| POST | `/auth/forgot-password` | — | 3/min | Pede o link de nova senha. Sempre 200 com a mesma mensagem. |
| POST | `/auth/request-password-change` | 🔒 | 3/10 min | A conta logada pede o link de troca, enviado ao próprio e-mail. |
| POST | `/auth/reset-password` | — | 5/min | Define a nova senha com o token e revoga todas as sessões. |
| GET | `/auth/reset-password` | — | 5/min | **Página HTML** com o formulário de nova senha. |

Fluxos completos: [Autenticação e sessão](fluxos/autenticacao-e-sessao.md) e
[Contas e e-mails](fluxos/contas-e-emails.md).

## Sincronização — `/sync`

| Método | Rota | Auth | Limite | Descrição |
|---|---|---|---|---|
| POST | `/sync` | 🔒 | 30/min | Recebe até 100 eventos (`lesson_completed`, `achievement_unlocked`), aplica cada um de forma idempotente, credita XP/Bits e devolve `results` + `profile { xp, bits }`. |
| GET | `/sync/progress` | 🔒 | 30/min | Devolve todas as lições concluídas e conquistas da conta (o caminho de volta). |

Resultado por evento: `applied`, `duplicate` ou `error` (com o motivo, ex.:
`lesson_locked`, `lesson_not_found`, `achievement_not_found`). Ver
[Sincronização e progresso](fluxos/sincronizacao-e-progresso.md).

## Catálogo de conteúdo

| Método | Rota | Auth | Ambiente | Descrição |
|---|---|---|---|---|
| GET | `/areas` | — | todos | Áreas (`{ id, name }`), por `id`. Sem `locale`. |
| GET | `/modules?areaId=&locale=` | — | todos | Módulos da área **com lições e atividades aninhadas**, já traduzidos. Não inclui aulas do baú. |
| GET | `/collection?locale=` | 🔒 | todos | Aulas do baú que a conta já revelou, com atividades. Limite 60/min. |

Escrita do catálogo (consumida pelo dashboard) — **🛠 só em desenvolvimento**:

| Recurso | Rotas |
|---|---|
| Áreas | `POST /areas`, `PATCH /areas/:id`, `DELETE /areas/:id` |
| Módulos | `POST /modules`, `PATCH /modules/:id`, `DELETE /modules/:id`, `PATCH /modules/reorder` |
| Lições | `GET /lessons?moduleId=`, `POST /lessons`, `PATCH /lessons/:id`, `DELETE /lessons/:id`, `PATCH /lessons/reorder` |
| Atividades | `POST /activities`, `PATCH /activities/:id`, `DELETE /activities/:id`, `PATCH /activities/reorder` |

Regras comuns da escrita:

- **Traduções vão embutidas no corpo da entidade** (`translations: { pt?, en? }`;
  `content` no caso de atividade). O mapa é **parcial** de propósito — `PATCH` com só
  `pt` não apaga o `en`. Não há endpoint para remover uma tradução.
- **A ordem só muda por `.../reorder`**, que recebe o conjunto **completo** de filhos
  (`orderedIds`); conjunto parcial ou com repetição é 400. `POST` sem `index` faz append.
- **`DELETE` cascateia** o conteúdo, mas responde **409** (sem apagar nada) se houver
  progresso de alunos nas lições envolvidas.
- **`content` é `object` com `additionalProperties: true`**: a API não o valida.
- `GET /modules?includeChest=true` mostra também as aulas do baú, **só em dev** (o
  dashboard usa).
- Primeira teoria da lição: as rotas de atividades respondem **422** se a escrita
  deixaria a primeira teoria de uma lição sem a persona `cody`.

## Versionamento

| Método | Rota | Auth | Ambiente | Descrição |
|---|---|---|---|---|
| GET | `/content-version` | — | todos | Versão vigente de cada idioma; `?locale=` para um; `?locale=&sinceId=` para as publicações depois de um `id`. |
| POST | `/content-version` | — | 🛠 | Publica `{ locale, version, changelog, announce? }`. 409 se igual à vigente. |
| GET | `/app-version` | — | todos | Versão mais recente do **app** por idioma; `?locale=&limit=` devolve o histórico (com reserva em inglês por versão). |
| POST | `/app-version` | — | 🛠 | Publica `{ version, needUpdate?, changelogs: [{ locale, changelog }] }` numa transação. 409 se repetida. |

Ver [Conteúdo e versionamento](fluxos/conteudo-e-versionamento.md) e
[Servidor lento e nova versão](fluxos/servidor-lento-e-nova-versao.md).

## Loja — `/shop`

Todas 🔒.

| Método | Rota | Limite | Descrição |
|---|---|---|---|
| GET | `/shop` | 60/min | Preços e estado: Bits, dicas, janela do Dobro de XP, contagem de aulas do baú por área. |
| POST | `/shop/purchase` | 20/min | `{ item: 'double_xp' \| 'instant_hint' \| 'chest', locale? }`. Transação com usuário travado. 402 saldo insuficiente, 409 `boost_active`. |
| POST | `/shop/use-hint` | 20/min | Gasta uma Dica Instantânea. 409 `no_hints`. |

Ver [Loja e baú](fluxos/loja-e-bau.md).

## Usuários — 🛠

`POST/GET /users`, `GET/PATCH/DELETE /users/:id`: CRUD **sem autenticação**, existe só
em desenvolvimento (em produção qualquer pessoa conseguiria listar e-mails, trocar
senhas e escrever XP e Bits). O app nunca o usa — ele usa `/auth`.

## Estrutura do código

```
api/src/
  app.ts            # registra plugins e rotas via @fastify/autoload
  plugins/          # prisma, jwt, rateLimit, mailer, sensible, swagger, cors
  routes/<recurso>/ # um arquivo por operação + <recurso>.schema.ts + index.ts
  utils/            # regras de negócio e helpers (levels, shop, appVersion, authToken…)
  types/contracts.ts
api/prisma/         # schema.prisma, migrations/, seed.ts e utilitários do seed
api/test/           # espelha src/ (helper.ts, fixtures)
```

### Convenções do código

- **ESM puro.** Todo import relativo precisa da extensão **`.js`** (mesmo o arquivo
  sendo `.ts`); não existem `__dirname`/`require` (use `import.meta.dirname`).
- **Autoload**: `plugins/` carrega primeiro (não encapsulado); `routes/` depois
  (encapsulado). O autoload só enxerga o `index.ts` de cada pasta; os demais arquivos
  são registrados à mão por ele. Não edite as linhas marcadas "Do not touch" do `app.ts`.
- **Um arquivo por operação** em pastas de recurso, com os schemas JSON reutilizados
  num `<recurso>.schema.ts`.
- **Toda rota tem `schema`** (`description`, `tags`, `body`/`params`/`response` com
  todos os códigos relevantes). É isso que gera o Swagger; não escreva documentação
  paralela.
- **Rotas protegidas** usam `preHandler: fastify.authenticate` e leem o dono de
  `request.user.id`, nunca do corpo.
- **Prisma**: `select` explícito para nunca vazar `password`; client via `fastify.prisma`.
- **Erros** via `fastify.httpErrors.*`.

## Testes da API

Runner nativo `node:test` + `c8` + `tsx`. Os arquivos espelham `src/`. Testes de rotas
de escrita de conteúdo chamam `useDevelopmentEnv(t)` **antes** de `build(t)` (sem isso a
rota nem é registrada e o teste recebe 404). Rodam contra o banco real e se limpam;
detalhes em [Primeiros passos](primeiros-passos.md#testando).

Regra do repositório: **endpoint criado, editado ou removido ⇒ Swagger e testes
atualizados na mesma tarefa**.
