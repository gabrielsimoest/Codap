# CLAUDE.md — App

Este arquivo complementa o [CLAUDE.md](../CLAUDE.md) da raiz (que contém as regras globais do projeto, sempre válidas aqui) com o contexto específico do aplicativo. Leia os dois antes de trabalhar em `/app`.

## Stack e estado atual

- **Expo `~52.0.37`**, **React Native `0.76.7`**, **React `18.3.1`**, **TypeScript `^5.3.3`** (`tsconfig.json` estende `expo/tsconfig.base` com `strict: true`).
- Navegação: `@react-navigation` (`native`, `stack`, `bottom-tabs`).
- Estado global: `zustand`.
- UI: `react-native-paper` (o `App.tsx` envolve a árvore em `<Provider>`), `react-native-animatable`, `@expo/vector-icons`.
- Persistência local: `expo-sqlite` e `@react-native-async-storage/async-storage`. **Não há nenhum cliente HTTP/API configurado** — o app ainda não se comunica com a API em `/api`; autenticação e progresso do usuário são inteiramente locais hoje (SQLite + AsyncStorage).
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
    hooks/                     # useCustomTheme, useFontSize, useLanguage, useLoggedUser, useNavigate
    stores/                    # zustand: ThemeStore, FontSizeStore, LanguageStore, UserStore, AlertStore
    services/                  # DatabaseClient.ts (wrapper de expo-sqlite)
    theme/                     # LightMode.ts, DarkMode.ts
    translations/i18n/         # i18n.ts + locales/{en,pt}.json
    types/entities.d.ts         # tipos de domínio (User, Aula, Theory, Option, ClassContent...)
    utils/                      # isValidEmail, isValidUser, imageIndexer
```

## Navegação

`MainNavigation.tsx` (stack, header oculto) contém `Login` → `Register` → `Home`, onde `Home` é o `TabNavigation.tsx` (bottom tabs: `Class`, `Market`, `Account`, `Settings`, cada aba com ícone via componente `Icon` e animação própria em `TabButton`). Navegação tipada via o hook `useNavigate` (`src/hooks/useNavigate.ts`), que envolve `useNavigation` com um tipo `NavigationProps` simples (`navigate(routeName)`).

## Estado e persistência

- **zustand**: cada store em `src/stores` é um `create()` simples, sem middleware de persistência. Exemplos: `UserStore` guarda o usuário logado em memória, `ThemeStore`/`FontSizeStore`/`LanguageStore` guardam a preferência atual em memória, `AlertStore` controla um alerta global (`ThemedAlert`, renderizado uma vez em `App.tsx`).
- **Persistência real** é feita diretamente via `AsyncStorage` nos hooks/telas que precisam, usando chaves fixas já estabelecidas: `"User"`, `"Classes"`, `"CurrentTheme"`, `"CurrentLanguage"`, `"CurrentFontSize"`. Os hooks `useCustomTheme`, `useLanguage` e `useFontSize` leem essas chaves na montagem e são usados em `App.tsx` para popular as stores antes de esconder a splash screen. Ao adicionar uma nova preferência persistida, siga esse mesmo padrão (chave fixa em `AsyncStorage` + hook de leitura + store zustand) em vez de introduzir uma nova abordagem de persistência.
- **`DatabaseClient`** (`src/services/DatabaseClient.ts`) encapsula o SQLite local (`expo-sqlite`, banco `Users.db`) com tabelas `Users` e `Aulas`; é instanciado diretamente nas telas que precisam (ex.: `Login.tsx`), não é injetado via store/contexto.

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
- **Não há scripts de teste, lint ou typecheck definidos no `package.json`.** Para checar tipos manualmente é possível rodar `npx tsc --noEmit`, mas isso não é um script do projeto — confirme com o desenvolvedor antes de adotar isso como verificação padrão. Ao rodar essa checagem manual após a migração para o workspace, ela apontou 2 erros pré-existentes no código do app (`index.ts` sem export default e uma prop `theme` incompatível em `Register.tsx`), não relacionados ao workspace — não foram corrigidos por não terem sido solicitados.
