# CLAUDE.md — App

Este arquivo complementa o [CLAUDE.md](../CLAUDE.md) da raiz (que contém as regras globais do projeto, sempre válidas aqui) com o contexto específico do aplicativo. Leia os dois antes de trabalhar em `/app`.

## Stack e estado atual

- **Expo `~52.0.37`**, **React Native `0.76.7`**, **React `18.3.1`**, **TypeScript `^5.3.3`** (`tsconfig.json` estende `expo/tsconfig.base` com `strict: true`).
- Navegação: `@react-navigation` (`native`, `stack`, `bottom-tabs`).
- Estado global: `zustand`.
- UI: `react-native-paper` (o `App.tsx` envolve a árvore em `<Provider>`), `react-native-animatable`, `@expo/vector-icons`.
- Persistência local: `expo-sqlite` e `@react-native-async-storage/async-storage`. Tokens de sessão ficam em `expo-secure-store` (nunca em AsyncStorage).
- **Autenticação e sincronização integradas com a API** (`/api`) — login/registro via JWT (access + refresh token com rotação), sessão "lembrar-me", e uma fila de sincronização offline-first (SQLite) que envia lições concluídas/conquistas desbloqueadas em lote para `POST /sync` assim que há conexão. Ver seção "Autenticação e sincronização" abaixo.
- Cliente HTTP: `axios` (instância única em `src/services/ApiClient.ts`). Requisições/mutations via `@tanstack/react-query` (`PersistQueryClientProvider` em `App.tsx`, não o `QueryClientProvider` puro — ver "Cache persistente" abaixo). Devtools do React Query: `react-native-react-query-devtools` (`DevToolsBubble`, componente `src/components/dev/QueryDevTools.tsx`, renderizado só quando `__DEV__` — nunca em produção), usa `expo-clipboard` para copiar dados do cache.
- **Cache persistente de queries**: `src/services/queryPersister.ts` (`@tanstack/query-async-storage-persister`, sobre `AsyncStorage`) + `gcTime: Infinity` nas queries por padrão (`queryClient.ts`) — sobrevive a um kill do processo, ao contrário do cache padrão do React Query (só em memória). Hoje sem uso real: nenhuma tela faz `useQuery` ainda (só `useMutation`, que o persister não guarda por padrão). Pensado para quando o catálogo de aulas (`areas`/`modules`/`lessons`/`activities`, hoje só no MER da API) vier do servidor — cache indeterminado, revalidado sob demanda (ex.: comparando `content_version`), nunca por uma tabela SQLite local espelhando o conteúdo (isso ficaria redundante com o próprio cache do React Query).
- Detecção de conectividade: `@react-native-community/netinfo`.
- i18n: `i18next` + `react-i18next`, idiomas `en`/`pt`.
- Sem suíte de testes automatizados e sem script de lint configurados no `package.json` atualmente.

## Estrutura de diretórios

```
app/
  App.tsx / index.ts        # entry point (registra o root component do Expo)
  app.json, eas.json         # configuração do Expo/EAS
  android/                    # saída do prebuild nativo (gerada)
  assets/                     # imagens (mascote Cody, ícones, etc.)
  src/
    routes/                   # MainNavigation (stack: Login/Register/Home) e TabNavigation (bottom tabs)
    screens/                  # uma pasta por tela, com components/ próprios quando precisa
      auth/                   # Login, Register
      classes/                # tela principal de aulas + lessons/ (conteúdo de HTML/CSS/JS)
      configurations/, market/, user/
    components/
      themed/                 # componentes "Themed*" — ver seção de design system
      layout/                 # CenterView, RowView, ColumnView (primitivas de flex)
    hooks/                     # useCustomTheme, useFontSize, useLanguage, useLoggedUser, useNavigate, useAuthSession, useNetworkSync
      queries/                  # hooks de React Query: useLoginMutation, useRegisterMutation, useSyncQueueMutation
    stores/                    # zustand: ThemeStore, FontSizeStore, LanguageStore, UserStore, AlertStore, AuthStore
    services/                  # DatabaseClient.ts (wrapper de expo-sqlite), migrations.ts (PRAGMA user_version)
                                 # ApiClient.ts (axios + interceptor de renovação de token), AuthService.ts,
                                 # SecureTokenStore.ts (expo-secure-store), SyncService.ts, queryClient.ts
    theme/                     # LightMode.ts, DarkMode.ts
    translations/i18n/         # i18n.ts + locales/{en,pt}.json
    types/entities.d.ts         # tipos de domínio (User, Aula, Theory, Option, ClassContent...)
    utils/                      # isValidEmail, isValidUser, imageIndexer
```

## Navegação

`MainNavigation.tsx` (stack, header oculto) contém `Login` → `Register` → `Home`, onde `Home` é o `TabNavigation.tsx` (bottom tabs: `Class`, `Market`, `Account`, `Settings`, cada aba com ícone via componente `Icon` e animação própria em `TabButton`).

**Rotas tipadas** (`src/types/navigation.d.ts`): `RootStackParamList` (rotas do stack raiz — `Login: {email?: string} | undefined`, `Register: undefined`, `Home: undefined`) e `MainTabParamList` (as 4 abas, todas `undefined`), com uma augmentation global (`declare global { namespace ReactNavigation { interface RootParamList extends RootStackParamList {} } }`) que faz `useNavigation()`/`useRoute()` inferirem o tipo certo em qualquer lugar do app, sem passar o genérico manualmente em cada tela. `createStackNavigator<RootStackParamList>()` (`MainNavigation.tsx`) e `createBottomTabNavigator<MainTabParamList>()` (`TabNavigation.tsx`, com `TabItem.route: keyof MainTabParamList` em vez de `string`) usam esses tipos, então um nome de rota errado em `<Stack.Screen name="...">`/`<Tab.Screen name="...">` já não compila. `useNavigate` (`src/hooks/useNavigate.ts`) envolve `useNavigation<StackNavigationProp<RootStackParamList>>()` (do `@react-navigation/stack` — o pacote realmente instalado, não `native-stack`) — é usado uniformemente em telas de qualquer profundidade de aninhamento (ex.: `User.tsx`, dentro do tab navigator, navegando para `"Login"` no stack raiz); isso funciona porque uma `navigate()` para uma rota que o navigator mais próximo não conhece sobe (bubble) para o navigator pai até achar — comportamento documentado do React Navigation, não um hack. Ao adicionar uma nova tela/rota com parâmetros, adicione a entrada em `RootStackParamList`/`MainTabParamList` em vez de usar cast manual em `useRoute()`.

## Estado e persistência

- **zustand**: cada store em `src/stores` é um `create()` simples, sem middleware de persistência. Exemplos: `UserStore` guarda o perfil do usuário logado em memória, `AuthStore` guarda só `isLoggedIn` (sessão — deliberadamente separado de `UserStore`, que é perfil/exibição), `ThemeStore`/`FontSizeStore`/`LanguageStore` guardam a preferência atual em memória, `AlertStore` controla um alerta global (`ThemedAlert`, renderizado uma vez em `App.tsx`).
- **Persistência real** é feita diretamente via `AsyncStorage` nos hooks/telas que precisam, usando chaves fixas já estabelecidas: `"User"` (legado, ainda escrito por `EditProfile.tsx`), `"CachedProfile"` (perfil retornado pela API, JSON de `User`, escrito por `AuthService` após login/registro, lido por `useAuthSession` no boot), `"Classes"`, `"CurrentTheme"`, `"CurrentLanguage"`, `"CurrentFontSize"`. Os hooks `useCustomTheme`, `useLanguage`, `useFontSize` e `useAuthSession` leem essas chaves na montagem e são usados em `App.tsx` para popular as stores antes de esconder a splash screen. Ao adicionar uma nova preferência persistida, siga esse mesmo padrão (chave fixa em `AsyncStorage` + hook de leitura + store zustand) em vez de introduzir uma nova abordagem de persistência.
- **Tokens de sessão** (`refreshToken`, `accessToken`, `accessTokenExpiresAt`) ficam em `expo-secure-store` (`src/services/SecureTokenStore.ts`), nunca em AsyncStorage — "logado" é definido só pela presença do refresh token ali, nunca por uma chamada de rede ter sucesso (ver seção "Autenticação e sincronização").
- **`DatabaseClient`** (`src/services/DatabaseClient.ts`) encapsula o SQLite local (`expo-sqlite`, banco `Users.db`) com tabelas `Users`, `UserLessons`, `SyncQueue` e `UserAchievements`; é instanciado diretamente nas telas/serviços que precisam (ex.: `AuthService`), não é injetado via store/contexto. `initDefaultTables()` cria as tabelas base e chama `runMigrations()` (`src/services/migrations.ts`, guiado por `PRAGMA user_version`) para aplicar alterações de schema que `CREATE TABLE IF NOT EXISTS` não cobre (novas colunas/tabelas). Ao precisar de uma nova alteração de schema local, adicione um novo `if (version < N)` em `migrations.ts` em vez de editar o SQL de uma versão já aplicada — **exceto** enquanto o app não tiver sido rodado/distribuído com aquela versão em nenhum dispositivo real (nosso caso até agora): nesse cenário é seguro e preferível editar a migração já numerada em vez de acumular versões que nunca chegaram a aplicar de fato. Assim que o app rodar de verdade com uma versão aplicada, essa versão passa a ser imutável.
- **Sem autenticação local**: como o registro de conta exige internet (sempre via `/auth/register`), o modelo antigo de login 100% local (senha em texto puro em `Users.password`, comparada com `===`) foi removido — `DatabaseClient` não tem mais `registerUser`/`validateUser`/`updateUserPassword`. `ChangePassword.tsx` não tem mais lógica própria: o botão "alterar senha" abre o mesmo componente `ComingSoon` já usado no botão "achievements" de `User.tsx`, até que um endpoint de troca de senha exista na API (não implementado especulativamente).
- **`Users.remoteId` é a própria chave primária local** (`TEXT PRIMARY KEY`, o `users.id`/UUID retornado pela API) — não existe mais um `id INTEGER` autoincrement separado. Isso só foi possível porque `remoteId` deixou de ser opcional: toda linha nasce de `DatabaseClient.upsertLocalProfile()`, que sempre recebe o `remoteId` vindo da API, então não há mais motivo para uma chave substituta local. `UserLessons.userId` é `TEXT`, referenciando `Users.remoteId` diretamente (antes era `INTEGER` → `Users.id`; `UserLessons.id` continua um `INTEGER AUTOINCREMENT` normal — é só a PK da própria linha de conclusão, igual `user_lessons.id` no Postgres, nunca o ID da lição em si, que já é `lessonId`).
- **`Aulas`/`TipoAula` viraram `UserLessons`/`lessonId`** (tabela e coluna) — nome antigo era a única tabela em português no schema local (todo o resto já era inglês) e não deixava claro que se trata do relacionamento N:N usuário↔lição, igual `UserAchievements`; o novo nome bate com o model equivalente da API (`user_lessons`). **Cuidado para não confundir com a chave AsyncStorage `"Aulas"`** (usada por `Html.tsx`/`Css.tsx`/`Js.tsx` em `screens/classes/lessons/`) — é um mecanismo completamente separado, não relacionado ao SQLite, e não foi tocado por esse rename.
- **Todas as colunas locais são camelCase** (`id`, `userId`, `remoteId`, `lessonId`, `achievementId`, `clientEventId`...) — segue o mesmo critério que a própria API já usa em `api/src/types/contracts.ts`: `snake_case` só onde o tipo é derivado direto de uma linha do Prisma/Postgres (`UserResponse = Omit<users, 'password'>`, ex. `created_at`), `camelCase` em tudo que é um formato só de TypeScript (`SyncEventInput.payload.lessonId`/`achievementId`, `accessToken`, etc.). O SQLite local não é um espelho do Postgres — tem seu próprio formato —, então segue a mesma regra dos DTOs, não a das tabelas do Postgres. Nomes de tabela continuam PascalCase (`Users`, `UserLessons`, `SyncQueue`, `UserAchievements`) — é só convenção de identificador, sem relação com essa regra de coluna.
- **O dispositivo pode ter mais de uma conta ao longo do tempo** (logout/login de outro usuário no mesmo aparelho) — por isso `UserAchievements` e `SyncQueue` também carregam `userId` (`TEXT`, FK para `Users.remoteId`), não só `UserLessons`. Sem isso, uma conquista ou um evento pendente de um usuário podia vazar ou ser sincronizado sob a sessão de outro. `UserAchievements.UNIQUE` passou de "achievementId global" para `(userId, achievementId)` — cada usuário pode desbloquear a mesma conquista independentemente.
  Esquema local hoje (`Users.db`, versão 4 — `migrations.ts`):
  - `Users(remoteId TEXT PK, name, email, dependaBots, xp, doubleXp, doubleTime, lastProfileSyncAt)`
  - `UserLessons(id INTEGER PK AUTOINCREMENT, userId TEXT FK→Users.remoteId, lessonId)`
  - `SyncQueue(id INTEGER PK AUTOINCREMENT, userId TEXT FK→Users.remoteId, clientEventId TEXT UNIQUE, type, payload, occurredAt, status, attempts, lastError, createdAt, updatedAt)`
  - `UserAchievements(id INTEGER PK AUTOINCREMENT, userId TEXT FK→Users.remoteId, achievementId, unlockedAt, UNIQUE(userId, achievementId))`
  A migração de versão 3 reconstrói `Users`/`UserLessons` (SQLite não permite trocar a PK de uma tabela existente via `ALTER TABLE`) e descarta, nesse processo, qualquer linha local sem `remoteId` (resíduo do cadastro 100% local antigo, hoje impossível de recriar) e as aulas associadas a ela. A versão 4 reconstrói `UserAchievements` (pela troca da constraint única) e adiciona `userId` em `SyncQueue`; em ambos os casos, linhas pré-existentes sem forma confiável de atribuir um usuário são descartadas/marcadas `failed` — na prática não há dado real perdido, já que nenhuma tela ainda chama os métodos que escrevem nessas tabelas.

## Autenticação e sincronização

- **Fluxo de login**: `Login.tsx` chama `useLoginMutation` (React Query, `src/hooks/queries/`), que chama `AuthService.login` (`src/services/AuthService.ts`). Sucesso: `SecureTokenStore.saveSession` (tokens) + `DatabaseClient.upsertLocalProfile` (cache local do perfil, por `remoteId`) + `AsyncStorage["CachedProfile"]`, retornando um `User` (formato local) já pronto para `setUser()`.
- **Fluxo de registro — deliberadamente NÃO faz login automático**: `AuthService.register` chama `/auth/register` (que emite uma sessão, útil para outros clientes), mas revoga esse refresh token em seguida via `/auth/logout` (best effort) em vez de persistir sessão — o app quer que o usuário passe pela tela de Login para escolher "lembrar-me" explicitamente. `Register.tsx` mostra o alerta de sucesso e, ao ser dispensado, navega para `"Login"` passando `{ email }` como route param; `Login.tsx` lê isso via `useRoute()` num `useEffect` (não como valor inicial do `useState`, porque a tela de Login normalmente já está montada na pilha por baixo de Register, então o valor inicial não seria reavaliado) e pré-preenche o campo de e-mail.
- **"Logado" nunca depende de rede**: `useAuthSession` (`src/hooks/useAuthSession.ts`) só verifica se existe um refresh token no `SecureTokenStore` — é isso que `App.tsx` usa para decidir `isLoggedIn` antes de esconder a splash screen, e `MainNavigation.tsx` usa para escolher `initialRouteName` ("Home" ou "Login") sem nunca montar a tela de Login para quem já está logado.
- **`MainNavigation` recebe `isLoggedIn` como prop, não lê da `AuthStore`** — de propósito. `App.tsx` só monta `<NavigationContainer>`/`<MainNavigation>` depois que `useAuthSession()` já resolveu (`isReady`, ver `App.tsx`); antes disso retorna `null` (a splash nativa cobre essa espera). Isso existe porque `Stack.Navigator` só lê `initialRouteName` uma vez, no primeiro mount, e não reage a mudanças depois — se `MainNavigation` montasse cedo demais lendo `AuthStore.isLoggedIn` (cujo valor inicial é `false`), a rota inicial travaria em `"Login"` mesmo com uma sessão válida no `SecureStore`, e só apareceria de novo depois de um logout/login manual. Não reverta para `MainNavigation` ler direto da store sem resolver essa ordenação.
- **Renovação de access token**: `ApiClient.ts` (axios) intercepta toda requisição fora de `/auth/*` e chama `ensureFreshAccessToken()` antes de anexar o `Authorization: Bearer`; se o token está perto de expirar, renova via `/auth/refresh` (essa chamada em si é pulada pelo interceptor, evitando recursão). Falha de rede aqui nunca lança — segue com o token em cache (mesmo vencido) para a chamada falhar naturalmente offline, em vez de bloquear o app.
- **Fila de sincronização offline-first**: `DatabaseClient.completeLesson(userId, lessonId)` e `.unlockAchievement(userId, achievementId)` gravam o dado de domínio (`UserLessons`/`UserAchievements`) e um evento em `SyncQueue` (com o mesmo `userId`) na **mesma transação** (`withTransactionSync`) — é essa atomicidade que garante que progresso e pendência de sync nunca divirjam. `SyncService.flushQueue()` (`src/services/SyncService.ts`) resolve o usuário atual via `AuthService.getCachedProfile()` e só lê/envia os eventos `pending` **daquele usuário** (`getPendingSyncEvents(userId)`) — pendências de uma conta que não está logada no momento ficam intocadas, nunca enviadas sob a sessão errada. Marca `syncing`, envia em lote para `POST /sync`, atualiza para `synced`/`failed` conforme a resposta por evento; falha de rede/transporte devolve tudo para `pending` (nunca marca `failed`) para tentar de novo depois. Protegido por um lock em memória (`isFlushing`) contra chamadas concorrentes. Se não há perfil em cache (ninguém logado), o flush não faz nada.
- **Gatilhos de sync**: `useNetworkSync` (chamado uma vez em `App.tsx`) dispara no boot e na transição offline→online (`@react-native-community/netinfo`); `useLoginMutation` dispara logo após um login bem-sucedido (drena qualquer fila que já existisse localmente para aquela conta, já que `useNetworkSync` não roda de novo a cada login dentro do app já aberto); `SyncService.recordLessonCompletion(userId, lessonId)`/`recordAchievementUnlock(userId, achievementId)` gravam localmente e já chamam `flushQueue()` em seguida (fire-and-forget) — use essas duas funções em vez de `DatabaseClient.completeLesson`/`unlockAchievement` diretamente quando for plugar isso numa tela, para não perder esse gatilho. **Nenhuma tela de aula chama essas funções ainda** — elas existem e estão prontas, mas conectá-las ao fluxo real de conclusão de lição (`ClassView.tsx` e afins) é um follow-up que não fazia parte deste trabalho; não adivinhe onde plugar isso sem confirmar com o desenvolvedor.
- **Tipos compartilhados**: `AuthResponse`, `LoginBody`, `RegisterBody`, `SyncEventInput`, etc. vêm de `codap-api/src/types/contracts` (`import type` — apagado no build, sem custo no bundle). Reaproveite esses tipos em vez de redeclarar os formatos de request/response da API.
- **Variável de ambiente**: `EXPO_PUBLIC_API_URL` (ver `.env`/`.env.example`) define a base URL da API consumida por `ApiClient.ts`. **`localhost` não funciona a partir de um emulador/dispositivo** (resolve para o próprio emulador/dispositivo, não para a máquina rodando a API) — use `http://10.0.2.2:3000` no emulador Android (alias especial para o `127.0.0.1` do host), `http://localhost:3000` no simulador iOS (compartilha a rede do host), ou o IP da máquina na LAN para um dispositivo físico.

**Cuidado com `TouchableWithoutFeedback` do `react-native-gesture-handler`**: `Login.tsx` usa o `TouchableWithoutFeedback` de `"react-native"` (não o de `"react-native-gesture-handler"`) para dispensar o teclado, porque a versão do gesture-handler tem um bug conhecido no Android onde toques não chegam a um `Switch` nativo aninhado dentro dela (usado no toggle "lembrar-me"). Não troque essa importação de volta sem verificar se ainda há um `Switch`/componente nativo similar dentro da árvore.

## Design system (componentes `Themed*`)

`src/components/themed/*` (`ThemedView`, `ThemedText`, `ThemedTouchableOpacity`, `ThemedIcon`, `ThemedLine`, `ThemedAlert`, `ThemedHighlighter`) são wrappers finos sobre os componentes nativos/`react-native-paper` que recebem uma prop `theme` (`"primary" | "background" | "card" | "text" | "border" | "notification"`, com default sensato) e resolvem a cor via `useTheme().colors` do `@react-navigation/native`, aplicada sobre `LightMode`/`DarkMode` (`src/theme/*.ts`). **Prefira sempre esses componentes a `View`/`Text`/`TouchableOpacity` nativos quando a cor deve reagir ao tema** — várias telas mais antigas (ex. `Login.tsx`) ainda usam cores hardcoded e componentes nativos diretamente; isso é dívida existente, não o padrão a seguir em código novo.

Layout: `CenterView`, `RowView`, `ColumnView` (`src/components/layout`) são primitivas de flex reutilizáveis — prefira-as a recriar `View` com `style={{ flexDirection: ... }}` ad-hoc.

## Conteúdo de aulas (`screens/classes`)

- `Classes.tsx` seleciona a "jornada" (Html/Css/Javascript) e renderiza `ScreenJourney`, que despacha para `lessons/html/Html.tsx`, `lessons/css/Css.tsx` ou `lessons/js/JavaScript.tsx` por nome de string.
- O conteúdo de cada aula é dado tipado (`ClassContent`/`Content`/`Classes` em `types/entities.d.ts`), organizado por nível em `lessons/html/content/{basic,inter,advanced,master}-html.ts` e agregado em `content/index.ts`. Cada `Content` tem um `title` e uma lista de `classes`, onde cada item é discriminado por `type`: `"theory"` (parágrafos + bloco de código) ou `"option"` (pergunta de múltipla escolha). Ao adicionar conteúdo de aula, siga essa mesma estrutura de dados em vez de criar um novo formato.
- `ClassView.tsx` é quem consome essa lista e despacha por `type` (`switch`) para os componentes `TheoryLesson`/`OptionExercise`, controlando progresso (`progressWidth`), navegação entre itens e o modal (`react-native-paper` `Portal`/`Modal`).

## Reutilização de componentes

Antes de criar qualquer componente novo em `/app`:
1. Procure primeiro por um componente existente que atenda à necessidade (em `components/themed`, `components/layout`, ou nos `components/` da própria tela em `screens/*/components`).
2. **Sempre reutilize** um componente existente quando ele atender à necessidade. Não duplique, não recrie um componente equivalente, não reimplemente uma funcionalidade já coberta por um componente ou utilitário existente.
3. Se um componente existente precisar de uma nova variação, avalie primeiro evoluí-lo de forma limpa (ex.: nova prop opcional) antes de criar um novo.
4. Evite duas armadilhas opostas:
   - Criar várias cópias quase idênticas de um mesmo componente (`ComponentType1`, `ComponentType2`, ...) só variando um detalhe.
   - Transformar um componente único em um monólito cheio de condicionais para acumular responsabilidades claramente diferentes só para evitar criar um segundo componente.
5. Priorize, nessa ordem de julgamento: reutilização, clareza, manutenibilidade, consistência com os padrões já existentes no projeto (ex.: convenção `Themed*`, layout primitives, discriminação por `type` no conteúdo de aulas), baixo acoplamento e ausência de duplicação desnecessária.

## Comandos

O repositório é um workspace pnpm unificado (ver [CLAUDE.md](../CLAUDE.md) da raiz) — **instale as dependências uma única vez a partir da raiz** (`pnpm install`), nunca dentro de `/app` isoladamente. Os scripts abaixo podem ser rodados de duas formas equivalentes: com `cd app` e o comando direto, ou a partir da raiz com `pnpm --filter codap <script>` (há atalhos prontos em `package.json` da raiz: `app:start`, `app:android`, `app:ios`, `app:web`).

- Iniciar o Metro/Expo (escolher plataforma no menu do CLI): `pnpm start`
- Rodar direto no Android: `pnpm android`
- Rodar direto no iOS: `pnpm ios`
- Rodar na Web: `pnpm web`
- **`.env` precisa de `EXPO_PUBLIC_API_URL`** apontando para a API local/remota (ver `.env.example`); variáveis `EXPO_PUBLIC_*` são inlined pelo Expo em build time.
- **Não há scripts de teste, lint ou typecheck definidos no `package.json`.** Para checar tipos manualmente é possível rodar `npx tsc --noEmit`, mas isso não é um script do projeto — confirme com o desenvolvedor antes de adotar isso como verificação padrão.
