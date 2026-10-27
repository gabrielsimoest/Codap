# Aplicativo (`app/`)

Aplicativo mobile em **Expo SDK 57 + React Native 0.86 + React 19 + TypeScript
estrito**, no **fluxo gerenciado** (Expo Go em desenvolvimento; o EAS gera o código
nativo a partir do `app.json`). A New Architecture é obrigatória.

> **Nunca faça *eject* do Expo.** As pastas `android/` e `ios/` não fazem parte do
> repositório. Um *prebuild* descartável para testar algo que o Expo Go não suporta é
> aceitável apenas se a pessoa responsável pedir, com as pastas no `.gitignore` e
> apagadas depois.

## Stack

| Área | Tecnologia |
|---|---|
| Navegação | React Navigation (stack + bottom tabs), rotas tipadas |
| Estado global | Zustand (stores simples, em memória) |
| Dados remotos | Axios (`ApiClient`) + TanStack Query com cache persistido em AsyncStorage |
| Persistência | `expo-sqlite` (progresso), AsyncStorage (cache/preferências), `expo-secure-store` (tokens) |
| UI | `react-native-paper`, componentes `Themed*` próprios, `react-native-svg`, `expo-linear-gradient`, `react-native-animatable` |
| Código | `react-native-webview` (sandbox de execução), `highlight.js` (realce) |
| i18n | `i18next` + `react-i18next` (pt / en) |
| Outros | `expo-notifications` (lembretes locais), `@react-native-community/netinfo`, `expo-navigation-bar`, `expo-linking` (deep links `codap://`) |

## Estrutura

```
app/
  App.tsx / index.ts          # entrada: providers, hooks de boot, navegação
  app.json / eas.json         # configuração Expo / perfis de build EAS
  assets/                     # mascote Cody, ícones, emblemas
  src/
    routes/                   # MainNavigation (stack) e TabNavigation (abas)
    screens/
      auth/                   # Login, Register
      classes/                # Aulas: Classes.tsx, Lesson.tsx e components/ (player, exercícios)
      market/                 # Mercado (loja e baú)
      user/                   # Perfil, conquistas, e-mail e senha
      configurations/         # Configurações, sobre, versão, galeria escondida
    components/
      themed/                 # ThemedView/Text/Icon/Alert/Skeleton… (reagem ao tema)
      layout/                 # CenterView/RowView/ColumnView, ScreenHeader, EdgeFade, tabBarMetrics
    hooks/                    # useAuthSession, useNetworkSync, useContentVersionSync, …
      queries/                # hooks do React Query
    stores/                   # Zustand
    services/                 # ApiClient, AuthService, SyncService, DatabaseClient, ShopService…
    theme/                    # LightMode, DarkMode, appColors, theoryTheme
    translations/i18n/        # i18n.ts e locales/{pt,en}.json
    types/                    # entities.d.ts, navigation.d.ts
    utils/                    # levels, semver, lessonAccess, buildLessonSession, codeSandboxDocument…
```

## Inicialização (boot)

`App.tsx` só monta a navegação **depois** de resolver a sessão (a splash nativa cobre
a espera), para o `initialRouteName` ser correto na primeira vez:

1. Hooks de preferência hidratam tema, idioma e tamanho de fonte.
2. `useAuthSession` verifica se há refresh token no SecureStore → define `isLoggedIn`
   (nunca depende de rede) e alimenta a `AuthStore`.
3. `PersistQueryClientProvider` restaura o cache do catálogo; só **depois** disso o
   prefetch das áreas é disparado (nunca durante a restauração).
4. Em paralelo, hooks de fundo: `useServerWarmup` (acorda a API), `useNetworkSync`
   (envia a fila), `useProgressSync` (restaura progresso), `useContentVersionSync`
   (atualiza o catálogo), `useAppVersionSync` (avisa de versão nova do app) e
   `useInactivityReminder` (lembretes).

## Navegação

`MainNavigation` (stack, sem cabeçalho): `Login` → `Register` → `Home` (as abas) e
`Lesson` (cada lição abre numa **rota dedicada**, não num modal). As quatro abas:
**Aulas** (`Class`), **Mercado** (`Market`), **Perfil** (`Account`) e
**Configurações** (`Settings`).

- Parâmetros em `types/navigation.d.ts` (`RootStackParamList`, `MainTabParamList`),
  com augmentation global para `useNavigation()` inferir os tipos. **Rota nova com
  parâmetros ⇒ adicione a entrada lá.**
- `Lesson` recebe **só ids** (`areaId`, `moduleId`, `lessonId`) e redescobre a lição no
  cache — funciona por deep link e acompanha a troca de idioma.
- **Deep links**: `scheme: "codap"`, ex.: `codap://lesson/:areaId/:moduleId/:lessonId`.
  Só em builds de desenvolvimento/produção (no Expo Go, não). A configuração de
  `linking` só inclui as telas protegidas quando logado.

## Estado

| Store | Guarda |
|---|---|
| `AuthStore` | `isLoggedIn`, `sessionExpired` (a única fonte que reage a login/logout depois do boot) |
| `UserStore` | Perfil exibido (nome, e-mail, XP, Bits) |
| `ThemeStore` / `FontSizeStore` / `LanguageStore` | Preferências |
| `AlertStore` | Alerta global (`ThemedAlert`) |
| `AchievementStore` | Conquistas do usuário (carregadas uma vez por usuário e sessão) |
| `ProgressStore` | `revision`, incrementado quando o progresso é restaurado da nuvem |
| `ShopStore` | Estado da loja, junto do `userId` dono |
| `EmailStatusStore` | Se o e-mail está confirmado (`null` = ainda não se sabe) |
| `NotificationStore` | Preferência de lembretes |
| `AppUpdateStore` | Histórico de versões do app e a última vista |
| `useServerStatusStore` | `unknown` \| `waking` \| `awake` |

Preferência nova persistida ⇒ siga o padrão: chave fixa no AsyncStorage + hook de
leitura + store.

## Temas e design system

Dois temas desenhados à parte (o claro **não** é o escuro invertido): azul-marinho
escuro e azul-gelo claro, com a mesma marca índigo `#5469D3`. As cores vêm de
`useTheme().colors` (papéis do React Navigation) mais `useAppColors()` (tokens que não
cabem nos papéis: `action`, `onBrand`, `brandText`, `muted`…). O valor de cada token no
escuro é exatamente o literal histórico — qualquer ajuste de componente é um ramo
`!app.isDark`.

- **Prefira os componentes `Themed*`** a `View`/`Text`/`TouchableOpacity` nativos
  sempre que a cor deve reagir ao tema.
- Peças compartilhadas: `ListRow`, `AppModal` (casca de todo modal, com rolagem,
  esmaecimento e teclado), `AppButton`, `TextField` (com o olho de senha), `Flag`,
  `ScreenHeader`, `EdgeFade`, `AreaSelector`.
- **Cabeçalho e degradês**: as abas usam `ScreenHeader` + `EdgeFade` (em vez de linhas
  e bordas) e a rolagem reserva espaço para a barra de abas com `TAB_BAR_CLEARANCE`.
  O degradê usa a cor do fundo com alfa `00` — nunca `"transparent"`, que no Android
  interpola por preto.
- **Teclado**: no Android a janela não redimensiona; `useKeyboardHeight` +
  `useFocusScroll` reservam o espaço e levam o campo focado para a área visível.
- **Fonte**: `ResizableText` soma o tamanho escolhido nas Configurações (escala
  aditiva de 0 a 5) ao tamanho-base.
- **Antes de criar um componente**, procure um existente e reutilize; evolua-o com uma
  prop opcional antes de duplicá-lo — e evite também o monólito de condicionais.

## Telas principais

| Aba / tela | O que faz |
|---|---|
| **Aulas** | Seletor de área (HTML/CSS/JavaScript), módulos em cartões, lista de lições com estados (concluída, bloqueada por nível, desafio, aula do baú). |
| **Lição** | Percorre as atividades num player; ao final mostra a tela de conclusão (XP, barra de nível, Bits). |
| **Mercado** | Saldo de Bits e três itens: Dobro de XP, Dica Instantânea, Baú Surpresa. |
| **Perfil** | Cartão de identidade, nível e barra de XP, Editar perfil, Confirmar e-mail, Alterar senha, Conquistas, Sair. |
| **Configurações** | Tema, idioma (com bandeiras), tamanho da fonte, lembretes, Sobre (com créditos) e Versão do aplicativo (histórico real). |

**Galeria escondida**: segurar "Sobre" por 5 s em Configurações abre um exemplar
funcional de cada tipo de atividade e dos estados de botão de lição — útil para revisar
visual sem depender de conteúdo no banco. Ao mudar o contrato de um tipo ou criar um
tipo novo, atualize a galeria (`screens/configurations/activityGallery.ts`).

## Lembretes de inatividade

Notificações **locais e agendadas** (não push), desde que o recurso esteja ligado em
Configurações. Três lembretes por ausência — 7, 14 e 30 dias — com mensagens sorteadas;
depois do dia 30, silêncio. O app **re-arma** os três a cada abertura e mudança de
estado do app (cancela e agenda de novo a partir de agora), então não precisa guardar
"última atividade". Logout e sessão expirada cancelam tudo.

Limitação de ambiente: `expo-notifications` **não funciona no Expo Go do Android**;
o `NotificationService` carrega o pacote sob demanda e o recurso fica inativo lá. Para
testar de verdade, use um build de desenvolvimento ou o APK.

## Builds

Perfis em `app/eas.json`:

| Perfil | Uso |
|---|---|
| `preview` | **APK** para distribuição direta (`buildType: apk`) — o usado nos testes e na página de download |
| `preview2` | Build de release via Gradle |
| `preview3` | *Development client* (lê o `.env` local) |
| `preview4` | Distribuição interna |
| `production` | Produção |

Os perfis `preview`, `preview2`, `preview4` e `production` já trazem
`EXPO_PUBLIC_API_URL` apontando para a API publicada, porque **o EAS não lê o `.env`**
(ele não sobe para a nuvem). Trocou a API publicada? Mude a URL nesses quatro perfis.
Ver [Publicação](guias/publicacao.md).

## Verificação

Não há suíte de testes nem lint configurados. Verifique tipos com
`cd app && npx tsc --noEmit` e confira o comportamento no emulador/aparelho. Para lógica
sem interface (SQLite, sync, loja), use harnesses descartáveis — não os deixe no repositório.
