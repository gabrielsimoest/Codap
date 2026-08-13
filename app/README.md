# Codap App

Aplicativo mobile do Codap — Expo + React Native + TypeScript. Ambiente de aprendizado gamificado de HTML, CSS e JavaScript, com persistência local (SQLite + AsyncStorage) e ainda sem integração com a API (`/api`).

Para detalhes de arquitetura, convenções e regras de contribuição específicas do app, veja [CLAUDE.md](CLAUDE.md) (e o [CLAUDE.md](../CLAUDE.md) da raiz do monorepo).

## Stack

- Expo `~52` + React Native `0.76` + TypeScript
- Navegação: `@react-navigation` (stack + bottom tabs)
- Estado global: `zustand`
- UI: `react-native-paper`
- Persistência local: `expo-sqlite` + `@react-native-async-storage/async-storage`
- i18n: `i18next` (`pt`/`en`)

## Instalação

Este pacote faz parte de um workspace pnpm unificado — instale as dependências a partir da raiz do repositório, não aqui:
```bash
cd ..
pnpm install
```

## Comandos

Rode a partir de `/app`, ou a partir da raiz com `pnpm --filter codap <script>` (há atalhos prontos: `pnpm app:start`, `pnpm app:android`, `pnpm app:ios`, `pnpm app:web`).

| Comando | Descrição |
| --- | --- |
| `pnpm start` | inicia o Metro/Expo (escaneie o QR code com o app Expo Go) |
| `pnpm android` | abre direto em emulador/dispositivo Android |
| `pnpm ios` | abre direto em simulador/dispositivo iOS |
| `pnpm web` | abre no navegador |

Não há scripts de teste ou lint configurados atualmente neste pacote.

## Saiba mais

- [Documentação do Expo](https://docs.expo.dev/)
