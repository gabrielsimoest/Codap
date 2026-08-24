# CODAP, App de Aprendizado - HTML, CSS e JavaScript

Codap é um aplicativo de aprendizado gamificado de HTML, CSS e JavaScript. O repositório é um monorepo com workspace pnpm unificado, dividido em dois pacotes:

- **`/app`** — aplicativo mobile em Expo + React Native + TypeScript, com persistência local offline-first e autenticação/sincronização de progresso integradas com a API.
- **`/api`** — API em Fastify + TypeScript, conectada a Prisma/PostgreSQL (NeonDB), com autenticação JWT (access + refresh token) e um endpoint de sincronização em lote.

Para detalhes de arquitetura e convenções de cada pacote, veja [app/CLAUDE.md](app/CLAUDE.md) e [api/CLAUDE.md](api/CLAUDE.md).

## Visite nosso site
[codap.gabrielsimoesdeveloper.com.br](https://codap.gabrielsimoesdeveloper.com.br)

## Funcionalidades Principais

- *Lições Interativas:* Módulos de aprendizado divididos por tópicos para HTML, CSS e JavaScript.
- *Exercícios Práticos:* Desafios interativos para aplicar os conceitos aprendidos.
- *Quiz e Avaliações:* Testes para avaliar o conhecimento adquirido.
- *Progresso do Usuário:* Acompanhamento do progresso de aprendizado com sistemas de pontuação e comércio.

## Tecnologias Utilizadas

**App (`/app`)**
- Expo + React Native + TypeScript
- Zustand (estado global)
- SQLite + AsyncStorage (persistência local) + `expo-secure-store` (tokens de sessão)
- Axios + `@tanstack/react-query` (requisições à API)

**API (`/api`)**
- Fastify + TypeScript
- Prisma + PostgreSQL/NeonDB
- `@fastify/jwt` + `@fastify/rate-limit` (autenticação e proteção contra abuso)

## Instalação

Pré-requisitos: [Node.js](https://nodejs.org/) (LTS) e [pnpm](https://pnpm.io/installation).

1. Clone o repositório:
    ```bash
    git clone https://github.com/GtsSim0es/Codap.git
    cd Codap
    ```

2. Instale as dependências **a partir da raiz** (o workspace é unificado — não rode `pnpm install` dentro de `api/` ou `app/`):
    ```bash
    pnpm install
    ```

3. Rodar o app (Expo):
    ```bash
    pnpm app:start     # abre o Metro/Expo; escaneie o QR code com o app Expo Go
    pnpm app:android   # abre direto em um emulador/dispositivo Android
    pnpm app:ios       # abre direto em um simulador/dispositivo iOS
    pnpm app:web       # abre no navegador
    ```
    Para rodar em um emulador/dispositivo físico sem o Expo Go, é necessário configurar o ambiente nativo (Android Studio/Xcode) — veja o [guia oficial do Expo](https://docs.expo.dev/get-started/set-up-your-environment/).

4. Rodar a API (Fastify):
    ```bash
    pnpm api:dev
    ```

Mais comandos (build, testes, etc.) estão documentados em [api/CLAUDE.md](api/CLAUDE.md) e [app/CLAUDE.md](app/CLAUDE.md).

## Contribuição

### Issues
Se você identificar problemas, bugs ou tiver sugestões para melhorias, sinta-se à vontade para abrir uma issue. Isso nos ajuda a manter um registro claro das questões encontradas ou das ideias propostas. Ao criar uma issue, tente ser o mais descritivo e detalhado possível, incluindo passos reproduzíveis, se aplicável.

### Propondo Melhorias
Se você tem ideias para melhorar o aplicativo, adicionar novos recursos ou aprimorar os existentes, adoraríamos ouvir suas sugestões! Abra uma issue descrevendo detalhadamente sua proposta de melhoria. Podemos discutir a viabilidade e os próximos passos juntos.

### Enviando Pull Requests
Contribuições são bem-vindas! Se você deseja implementar alguma melhoria ou corrigir um problema existente, siga estes passos:

1. Fork o repositório para sua conta pessoal.
2. Crie uma branch com um nome descritivo para a alteração que você está fazendo.
3. Faça as alterações necessárias no código, mantendo um estilo consistente com o projeto.
4. Teste suas mudanças para garantir que tudo funcione conforme o esperado.
5. Envie um Pull Request (PR) explicando suas alterações. Inclua informações detalhadas sobre o que foi modificado e porquê.
6. Participe da discussão. Esteja aberto para responder perguntas ou fazer ajustes conforme necessário.
7. Lembre-se de seguir as diretrizes de código e estilo do projeto, se existirem, para garantir que as contribuições se encaixem adequadamente no projeto.

Agradecemos antecipadamente por suas contribuições e pelo interesse em melhorar este projeto!

## Autores

- [Gabriel Simões](https://gabrielsimoesdeveloper.com.br/)

  > _Desenvolvedor_

- [Gabriel Reverso](https://github.com/GabrielReverso)

  > _Desenvolvedor_

- [Thainá Cristina Covas](mailto:thainacristina.covas@gmail.com)

  > _Criação de artes e do mascote Cody_

## Licença

[GNU General Public License](https://choosealicense.com/licenses/gpl-3.0/)
