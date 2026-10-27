# Primeiros passos

Como colocar o Codap para rodar na sua máquina.

## Pré-requisitos

| Ferramenta | Para quê |
|---|---|
| [Node.js](https://nodejs.org/) (LTS) | Rodar API, dashboard e o Metro do Expo |
| [pnpm](https://pnpm.io/installation) | Gerenciador de pacotes do workspace |
| Um banco PostgreSQL | Em produção e desenvolvimento usamos o [Neon](https://neon.tech/) (serverless) |
| Expo Go **ou** emulador Android/simulador iOS | Para ver o app (Expo Go é o caminho mais curto) |
| Conta no [Resend](https://resend.com/) *(opcional)* | Só para enviar e-mails de verdade; sem ela o e-mail vai para o log da API |

## 1. Instalar as dependências

Sempre **a partir da raiz** — o workspace é unificado e há um único
`pnpm-lock.yaml`. Não rode `pnpm install` dentro de `api/`, `app/` ou `dashboard/`.

```bash
git clone https://github.com/GtsSim0es/Codap.git
cd Codap
pnpm install
```

## 2. Configurar as variáveis de ambiente

Cada pacote tem um `.env.example` com as variáveis esperadas. Copie para `.env` e
preencha. **Nunca versione o `.env`** (já está no `.gitignore`).

### API — `api/.env`

| Variável | Obrigatória | O que é |
|---|---|---|
| `DATABASE_URL` | sim | URL de conexão do PostgreSQL (Neon). Usada pelo Prisma e pela API. |
| `JWT_ACCESS_SECRET` | sim | Segredo que assina os access tokens. **Sem ela a API não sobe.** |
| `RESEND_API_KEY` | não | Chave da API do Resend. Sem ela, nenhum e-mail sai: em desenvolvimento o texto (com o link) vai para o log da API. |
| `MAIL_FROM` | não | Remetente dos e-mails. O domínio precisa estar verificado no Resend. |
| `PUBLIC_URL` | em produção | URL pública da API, sem barra no final; é a base dos links dos e-mails. Em desenvolvimento o padrão é `http://localhost:3000`. |

### App — `app/.env`

| Variável | O que é |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base da API. É embutida no app **na hora do build**. |

`localhost` **não funciona** a partir de um emulador ou celular (resolve para o
próprio aparelho). Use:

| Onde o app roda | Valor |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Simulador iOS | `http://localhost:3000` |
| Celular físico (mesma rede Wi-Fi) | `http://<IP-da-sua-máquina>:3000` |

### Dashboard — `dashboard/.env`

| Variável | O que é |
|---|---|
| `VITE_API_URL` | URL da API local. Padrão `http://localhost:3000`; só preencha se for outra. |

> Mudou o `.env` do app? **Reinicie o Metro** — variáveis `EXPO_PUBLIC_*` são lidas
> na partida.

## 3. Preparar o banco

O Prisma Client gerado **não é versionado**. Depois de clonar (e sempre que o
`schema.prisma` mudar), gere-o:

```bash
pnpm --filter codap-api exec prisma generate
```

Em um banco **novo e vazio**, aplique as migrations e popule o catálogo:

```bash
cd api
npx prisma migrate deploy   # aplica o histórico de prisma/migrations
cd ..
pnpm api:seed               # idiomas, áreas, módulos, lições, atividades, conquistas
```

O seed é idempotente: rodar de novo num banco que já tem dados não duplica nada.
Detalhes em [Autoria de conteúdo](guias/autoria-de-conteudo.md).

> `prisma migrate dev` exige terminal interativo. Em ambientes sem TTY, gere o SQL
> com `prisma migrate diff` e aplique com `migrate deploy` — o passo a passo está
> em [Modelo de dados](modelo-de-dados.md#migrations).

## 4. Rodar

Cada comando em um terminal.

```bash
pnpm api:dev      # API em http://localhost:3000 (com Swagger em /documentation)
pnpm app:start    # Metro/Expo — escaneie o QR code com o Expo Go
pnpm dash:dev     # Dashboard em http://localhost:5173 (opcional)
```

Atalhos do app: `pnpm app:android`, `pnpm app:ios`, `pnpm app:web`.

Para conferir que a API está de pé: <http://localhost:3000/> responde `{"root":true}`.
A documentação interativa das rotas fica em <http://localhost:3000/documentation>
(somente em modo dev).

### Conta de teste

Em desenvolvimento existe a conta **`teste@teste.com`**: ela se cadastra e entra
normalmente, já conta como e-mail confirmado e **nunca recebe e-mail de verdade** —
o link de redefinição de senha dela aparece no log da API. Em produção ela é
rejeitada.

## Comandos úteis

Todos a partir da raiz.

| Comando | O que faz |
|---|---|
| `pnpm api:dev` | API em modo desenvolvimento (build + watch + Swagger + rotas de escrita do catálogo) |
| `pnpm api:start` | API em modo produção (sem Swagger e sem rotas de escrita) |
| `pnpm api:build` | Compila a API (`tsc`) |
| `pnpm api:test` | Suíte da API: build, typecheck dos testes e `node:test` com cobertura |
| `pnpm api:seed` | Popula o catálogo de referência |
| `pnpm api:seed:check` | Compara `seed.ts` com o banco e acusa divergência (não escreve) |
| `pnpm api:seed:generate` | Reescreve os arrays de lições do `seed.ts` a partir do banco |
| `pnpm app:start` | Metro/Expo |
| `pnpm app:android` / `app:ios` / `app:web` | Abre direto na plataforma |
| `pnpm dash:dev` | Dashboard em modo dev |
| `pnpm dash:build` | Typecheck + build do dashboard |
| `pnpm dash:verify` | Validação de UI do dashboard por Playwright |
| `pnpm api:add <pkg>` / `app:add` / `dash:add` | Adiciona dependência ao pacote certo |

Verificação de tipos do app (não é um script do `package.json`):

```bash
cd app && npx tsc --noEmit
```

## Testando

- **API**: `pnpm api:test`. Os testes rodam **contra o banco Neon real** (não há
  banco de teste separado). Cada teste cria os próprios dados com identificadores
  únicos e os remove no fim. Em paralelo, alguns arquivos podem falhar de forma
  intermitente por timeout do banco remoto; para um resultado confiável rode em
  série: `cd api && node --import tsx --test --test-concurrency=1 "test/**/*.ts"`.
- **Dashboard**: `pnpm dash:verify` (com API e dev server no ar). É somente
  leitura.
- **App**: não há suíte automatizada; a verificação é `tsc --noEmit` mais
  conferência no emulador/aparelho.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| API não sobe, erro sobre `JWT_ACCESS_SECRET` | Variável ausente no `api/.env` |
| `Cannot find module …generated/prisma` | Faltou `prisma generate` depois do clone |
| App não alcança a API no emulador | `EXPO_PUBLIC_API_URL` com `localhost`; use `10.0.2.2` e reinicie o Metro |
| Dashboard recebe 404 ao salvar | API não está em modo dev; use `pnpm api:dev`, não `api:start` |
| `Cannot find module 'metro-runtime/package.json'` | O `publicHoistPattern` do `pnpm-workspace.yaml` foi removido; ele é necessário |
| Notificações não funcionam no Expo Go (Android) | Limitação do Expo Go; use um build de desenvolvimento ou o APK |
| Primeira chamada demora ou falha contra a API hospedada | O plano gratuito do Render dorme; ver [Servidor lento](fluxos/servidor-lento-e-nova-versao.md) |
