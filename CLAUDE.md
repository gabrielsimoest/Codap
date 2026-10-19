# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral do projeto

Codap é um aplicativo de aprendizado gamificado de HTML, CSS e JavaScript. O repositório é um **monorepo com workspace pnpm unificado** (`pnpm-workspace.yaml` na raiz), contendo três pacotes:

- **`/app`** — aplicativo mobile em Expo + React Native + TypeScript. Estado atual: funcional, com persistência local (SQLite + AsyncStorage), autenticação e sincronização de progresso integradas com a API — login/registro via JWT (access + refresh token com rotação), sessão "lembrar-me" guardada em `expo-secure-store`, e uma fila de sincronização offline-first em SQLite que envia em lote para `/sync` assim que há conexão. O catálogo de conteúdo (áreas, módulos, lições e as atividades de cada lição) também já vem da API, numa chamada só por área e com cache infinito via React Query; cada lição abre numa rota dedicada, com o conteúdo renderizado dinamicamente conforme o tipo de cada atividade. Conquistas (um emblema por área concluída + a Tríade Web) são decididas offline, guardadas no SQLite e enviadas pela mesma fila de sync, sem nenhuma requisição para ler o status. XP e Bits também são calculados offline: o nível (de 1 a 50) deriva do XP, Bits (a moeda, antes "Dependabots") são creditados ao subir de nível, e a tela de conclusão de lição mostra o ganho e o aviso de subida; o servidor é a autoridade e o app adota o valor dele quando a fila de sync esvazia. **Aulas de aprofundamento** (lições com nível mínimo e XP próprio) são opcionais e abrem por nível: ficam apagadas e tracejadas na lista enquanto bloqueadas e nunca impedem um emblema de área. **A loja gasta Bits de verdade, mas só online**: a compra é validada pelo servidor (Dobro de XP por 5 minutos, Dica Instantânea para o desafio de código e o Baú Surpresa, que revela uma aula exclusiva para a coleção da pessoa — magenta, com uma caveira, ao fim do módulo dela). Veja [app/CLAUDE.md](app/CLAUDE.md).
- **`/api`** — API em Fastify + TypeScript. Estado atual: conectada a um banco NeonDB/PostgreSQL real via Prisma, com Swagger/OpenAPI configurado (somente em desenvolvimento), um recurso CRUD completo (`users`), autenticação via JWT (`@fastify/jwt`, access + refresh token com rotação e detecção de reuso), um endpoint de sincronização em lote (`/sync`, que também credita XP e Bits e devolve o perfil atualizado) consumido pelo app, endpoints de leitura do catálogo pedagógico (`GET /areas`, `GET /modules`, este último trazendo lições e atividades aninhadas) com um seeder de referência (`prisma/seed.ts`), e um contrato de **escrita** desse catálogo (criar/editar/remover/reordenar áreas, módulos, lições e atividades) que só existe em `NODE_ENV=development` e serve o dashboard. Também a **loja** (`/shop`: estado, compra e uso de dica) e a **coleção** do Baú Surpresa (`GET /collection`), com Bits gastos numa transação com trava de linha. Veja [api/CLAUDE.md](api/CLAUDE.md).
- **`/dashboard`** — dashboard web de gerenciamento de conteúdo, em Vite + React + TypeScript. Estado atual: ferramenta **local**, sem autenticação, que lê e escreve o catálogo pedagógico (áreas, módulos, lições e atividades) nos dois idiomas via a API em `localhost` — substituindo a edição manual de `api/prisma/seed.ts` e o uso de Swagger/Postman. SPA de uma tela, tema escuro, com Tailwind v4 + shadcn/ui, React Query e react-hook-form + zod. Também exporta qualquer recorte do currículo em Markdown ou PDF, para revisão por um professor ou por uma IA. Marca lições como aula de aprofundamento ou aula do baú. **Depende de a API rodar em `NODE_ENV=development`**: as rotas de escrita do catálogo só existem nesse modo. Veja [dashboard/CLAUDE.md](dashboard/CLAUDE.md).

O workspace foi unificado para que tipos/contratos sejam compartilhados entre `api`, `app` e `dashboard` sem duplicação — `api/src/types/contracts.ts` já é consumido pelo app e pelo dashboard via `codap-api: workspace:*` (import `type`-only), incluindo tipos derivados diretamente do Prisma Client gerado. Há um único `pnpm-lock.yaml`/`node_modules` na raiz — **instale as dependências sempre a partir da raiz** (`pnpm install`), não dentro de `api/`, `app/` ou `dashboard/` individualmente. O `package.json` da raiz expõe scripts de conveniência (`api:dev`, `api:test`, `app:start`, `dash:dev`, `dash:verify`, etc.) que usam `pnpm --filter <pacote>`; os comandos nativos de cada pacote (documentados em cada `CLAUDE.md` específico) continuam funcionando via `pnpm --filter <nome-do-pacote> <script>` a partir da raiz, ou executando `cd api`/`cd app`/`cd dashboard` normalmente.

Ao trabalhar em `/app`, `/api` ou `/dashboard`, leia este arquivo em conjunto com o `CLAUDE.md` específico da respectiva subpasta — as regras abaixo se aplicam ao repositório inteiro, e as regras dos arquivos específicos as complementam.

## 1. Alterações no código

**NUNCA altere código sem um pedido explícito do desenvolvedor.**

Pedidos como "analise", "pense sobre isso", "investigue", "verifique", "explique", "sugira", "o que você faria?", "qual seria a melhor abordagem?" ou "encontre o problema" devem ser interpretados literalmente como solicitações de análise, investigação ou sugestão — não como autorização para modificar arquivos. Nesses casos, não altere nenhum arquivo.

Só faça alterações quando o desenvolvedor pedir explicitamente que algo seja implementado, corrigido, refatorado, criado, removido ou alterado.

## 2. Commits

**JAMAIS faça commits por conta própria.** Um commit só deve ser realizado quando o desenvolvedor solicitar explicitamente.

Quando o desenvolvedor pedir um commit:
1. Analise todas as alterações realizadas.
2. Verifique se elas estão completas e coerentes.
3. Sugira um título e uma descrição de commit.
4. Aguarde a aprovação do desenvolvedor.
5. Só então execute o commit.

Nunca inclua autoria, assinatura ou referência a IA, Claude ou qualquer ferramenta de IA na mensagem de commit (nada de `Co-authored-by: Claude`, `Generated by Claude`, `AI-generated` ou equivalentes). O commit deve representar o trabalho do desenvolvedor/projeto.

## 3. Documentação

O `README.md` e os arquivos `CLAUDE.md` (raiz, `api/` e `app/`) fazem parte da documentação oficial do projeto. Sempre que uma alteração solicitada modificar comportamento, arquitetura, estrutura, configuração, comandos ou dependências documentadas, atualize a documentação correspondente como parte da mesma tarefa. Não deixe a documentação descrevendo um estado que já não corresponde ao código.

## 4. Verificação antes de finalizar

Nunca declare uma tarefa como concluída sem antes verificar o resultado. Ao finalizar uma alteração:
- Revise os arquivos modificados.
- Verifique se a implementação realmente atende ao pedido.
- Procure inconsistências ou efeitos colaterais óbvios.
- Execute os testes, lint, typecheck, build ou outras verificações relevantes disponíveis no projeto (ver comandos em [api/CLAUDE.md](api/CLAUDE.md), [app/CLAUDE.md](app/CLAUDE.md) e [dashboard/CLAUDE.md](dashboard/CLAUDE.md)).
- **Alterou a interface do dashboard? Valide com Playwright** (`pnpm dash:verify`, com a API e o dev server no ar) — é regra do pacote, não opcional. Ver [dashboard/CLAUDE.md](dashboard/CLAUDE.md).
- **Editou conteúdo pedagógico (pelo dashboard ou pela API)? Atualize `api/prisma/seed.ts` na mesma tarefa** e confirme com `pnpm api:seed:check`. O conteúdo vive no banco, então o seeder diverge em silêncio: tudo continua funcionando, e o preço só aparece quando alguém seeda um banco novo e recebe o currículo antigo. Ver [api/CLAUDE.md](api/CLAUDE.md).
- Confirme que a documentação continua coerente.
- Informe claramente o que foi alterado e quais verificações foram executadas.

Se alguma verificação não puder ser executada, informe explicitamente o motivo. Não afirme que algo está funcionando sem ter feito uma verificação compatível com essa afirmação.

## 5. Segurança de variáveis de ambiente

**É PROIBIDO ler o conteúdo de arquivos `.env` e `.env.production`** (não abrir, imprimir, inspecionar, copiar valores ou tentar inferir/recuperar secrets deles, nem usar comandos que exponham seu conteúdo). Você pode verificar se esses arquivos existem e seus nomes, mas nunca seu conteúdo.

`.env.example`, quando existir, pode ser lido normalmente e deve ser usado para entender quais variáveis de ambiente o projeto espera.

Se um problema parecer relacionado a uma variável de ambiente ou secret, não investigue o conteúdo do `.env`. Informe ao desenvolvedor que a verificação precisa ser feita manualmente por ele.

## 6. Navegador do Playwright (MCP)

Há **dois** servidores Playwright MCP disponíveis, e a diferença importa:

- **`playwright-isolated`** — declarado em `.mcp.json` na raiz deste
  repositório, com a flag `--isolated`. O perfil do navegador vive em memória e
  a pasta temporária é apagada ao fechar. Cada sessão abre o **próprio**
  navegador, então duas instâncias do Claude não se atrapalham. **Use este.**
- **`playwright` (do plugin)** — sem `--isolated`. Usa um diretório de perfil
  **determinístico** (`%LOCALAPPDATA%\ms-playwright-mcp\mcp-chrome-<hash>`),
  o mesmo para qualquer instância na máquina, e o Chromium tranca esse perfil.
  Duas sessões tentando usá-lo ao mesmo tempo brigam pelo lock: a segunda morre.
  Esse perfil também nunca é limpo — já passou de 50 MB.

Regras, valendo para qualquer um dos dois:

- **Sempre abra um navegador novo**; não reaproveite um que já esteja aberto.
- **Feche o que você abriu** (`browser_close`) ao terminar a tarefa. Além de
  liberar o recurso, é o que garante que a pasta temporária do modo isolado seja
  de fato apagada — um navegador **morto** em vez de fechado deixa resíduo.
- **Nunca derrube à força um navegador que você encontrou aberto.** Ele pode
  estar em uso por outra instância do Claude no meio de um teste. Matar o
  processo estraga o trabalho dela sem aviso.
- **Encontrou um em uso e não dá para abrir outro?** Espere, **avise o
  desenvolvedor** e só rode o teste quando liberar. Não fique tentando em laço.

**Validação de rotina não precisa do MCP.** `pnpm dash:verify` usa o Chromium
próprio do pacote (`chromium.launch()`, perfil efêmero) e **nunca** toca no
perfil do MCP — pode rodar a qualquer momento, mesmo com outra sessão navegando.
Prefira-o; deixe o navegador do MCP para inspeção interativa.

## 7. Expo: NUNCA fazer eject

**NUNCA, em hipótese alguma, faça eject do Expo no `/app`. JAMAIS.**

O app vive no fluxo gerenciado (Expo Go no desenvolvimento; o EAS gera o código nativo a partir do `app.json`). Eject é tornar as pastas `android/` ou `ios/` parte do repositório, ou abandonar a geração nativa contínua — e isso também faz o EAS Build deixar de rodar o prebuild e ignorar os plugins do `app.json`. Não faça, nem "temporariamente", nem como atalho, e não o sugira como solução.

Exceção única, só com pedido explícito do desenvolvedor naquele momento: um **build nativo descartável** para testar algo que o Expo Go não suporta (ex.: `expo-notifications` no Android). Nesse caso, `android/` e `ios/` ficam no `.gitignore`, nada nativo é versionado e a pasta gerada é apagada depois do teste. Isso é prebuild descartável, não eject. Na dúvida se algo conta como eject, não faça e pergunte.

## Processo obrigatório antes de qualquer implementação

Antes de implementar uma tarefa: entenda o pedido, analise a estrutura relacionada, leia o código relevante, procure implementações existentes que possam ser reutilizadas, verifique os padrões já adotados pelo projeto, identifique possíveis impactos em outras partes do sistema, implemente somente o que foi solicitado, atualize testes/Swagger/documentação quando necessário, execute as verificações apropriadas, revise as alterações finais e só então informe que a tarefa foi concluída.

Não faça alterações especulativas. Se durante a análise você identificar melhorias fora do escopo do pedido, não as implemente — apenas apresente-as como sugestões separadas.

## Regra fundamental

Quando houver dúvida entre alterar algo automaticamente ou perguntar/analisar e aguardar autorização, **não altere**. A autonomia do Claude deve ser usada para entender, analisar, verificar e executar exatamente o que foi solicitado — não para tomar decisões de escopo por conta própria. O objetivo é preservar a arquitetura existente, minimizar alterações desnecessárias, evitar regressões e manter código, testes e documentação sempre coerentes.
