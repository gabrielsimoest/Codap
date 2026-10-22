# Aulas de aprofundamento por nível (Fase 3a) — design

Data: 2026-10-18. Continuação de [2026-10-18-xp-niveis-bits-design.md](2026-10-18-xp-niveis-bits-design.md)
(seção "Fase 3 — conteúdo opcional"). O desenvolvedor mandou seguir com "as
aulas" logo depois da Fase 1; este documento fecha o desenho desta parte. O baú
e a loja continuam fora (dependem de saldo validado no servidor).

## Intenção

Dar ao nível um efeito que a pessoa queira buscar: ao chegar em certos níveis,
abrem aulas opcionais, mais difíceis, que aprofundam um assunto da trilha. Elas
rendem mais XP que uma lição comum e contam para o nível. **Nada da trilha
principal fica bloqueado nem depende delas.**

## Objetivos, não objetivos e anti-objetivos

**Objetivos:** marcar uma lição como de aprofundamento (nível mínimo + XP próprio);
mostrar no app o estado "bloqueada pelo nível" e "liberada"; pagar o XP da lição
no app e no servidor; editar esses campos no dashboard; entregar um piloto de 3
lições (uma por área).

**Não objetivos:** baú, aulas exclusivas escondidas, caveira, loja, moedas por
aula opcional, conquista de completude, o indicador de nível nas trilhas
(adiado pelo desenvolvedor), filtros de lista.

**Anti-objetivos:** uma aula opcional impedir uma conquista de área; o servidor
descontar XP por causa de uma aula bloqueada; o app antigo tratar o piloto como
trilha sem aviso (ver "Publicação").

## Decisões do desenvolvedor (conversa)

- Aulas opcionais apagadas com **borda tracejada** e o **nível exigido** no
  cartão, enquanto bloqueadas; ao liberar, **borda roxa sutil**, menos chamativa
  que o troféu dourado do desafio do módulo.
- O XP delas conta para o nível; a trilha principal é o que fecha em nível 30 e
  o aprofundamento é o que leva até o 50.
- Poucas aulas na primeira instância.

## Escolhas minhas (revise)

1. **Modelo:** duas colunas anuláveis em `lessons`: `min_level Int?` (nulo = lição
   da trilha principal; preenchido = aula de aprofundamento, aberta a partir
   desse nível, de 2 a 50) e `xp_reward Int?` (nulo = 10, o valor de sempre; de 1
   a 100). Não há coluna "tipo": o nível mínimo é o que define a aula opcional.
2. **O nível que vale é o geral** (`levelForXp(xp)`), não o da área.
3. **A aula fica no módulo a que pertence**, depois das lições comuns (pelo
   `index`). O piloto vai no módulo Avançado (`index === 2`) de cada área.
4. **Conquistas ignoram aulas opcionais:** `isAreaComplete` exige só as lições
   sem `min_level`. Uma aula opcional nunca impede um emblema.
5. **O servidor paga `lessons.xp_reward ?? 10` e não confere o nível mínimo.** Um
   cliente que abra uma aula bloqueada só ganha o que ganharia numa lição; além
   disso, conferir o nível no servidor reprovaria eventos de um mesmo lote que
   dependem uns dos outros (rodam em paralelo). Fica como endurecimento para a
   Fase 2, junto com a validação de saldo.
6. **Aula bloqueada aberta à força** (deep link) mostra "esta aula abre no nível
   N" com o botão de fechar, em vez de rodar.
7. **Cache antigo do catálogo:** o `persistOptions.buster` não é bumpado. A mudança
   do contrato é aditiva e o app trata `minLevel` ausente como "lição da trilha";
   é o resultado certo até a `content_version` seguinte recarregar o catálogo.
8. **Piloto:** HTML "Dados estruturados com JSON-LD" (nível 8), CSS "Camadas da
   cascata com @layer" (nível 15), JavaScript "Iteradores e geradores" (nível 22),
   30 XP cada, no módulo Avançado. Cada uma: 3 telas de teoria, 3 perguntas de
   múltipla escolha e 1 exercício de completar código, em pt e en.

## Contrato

- `LessonResponse` (`GET /modules`) e `AdminLessonResponse` ganham
  `minLevel: number | null` e `xpReward: number | null`.
- `CreateLessonBody`/`UpdateLessonBody` aceitam `minLevel?: number | null` e
  `xpReward?: number | null` (`null` limpa o campo; ausente não mexe). No
  `PATCH`, `translations` deixa de ser obrigatório: o corpo precisa de ao menos
  uma propriedade.
- `POST /sync`: o XP de `lesson_completed` é `lessons.xp_reward ?? 10`, e os Bits
  dos níveis cruzados saem desse valor.

## App

- Funções puras em `utils/lessonAccess.ts`: `isOptionalLesson`, `isLessonUnlocked`,
  `lessonXpReward`.
- `completeLesson` e `recordLessonCompletion` recebem o XP da lição (padrão 10); o
  app o lê do catálogo em cache.
- Lista de lições: `ClassButton` ganha os estados "aprofundamento liberado" (roxo
  sutil, ícone de foguete) e "bloqueado" (apagado, tracejado, cadeado e "Nível
  N", sem navegação).
- `Lesson.tsx` barra a lição bloqueada e passa o XP da lição ao concluir.

## Dashboard

O formulário de lição ganha o interruptor "Aula de aprofundamento", e, ligado, os
campos "Nível mínimo" e "XP ao concluir". A árvore marca a lição com "Nv. N ·
+XP". A validação de UI por Playwright ganha um passo (só leitura).

## Seed

`LessonSeed` ganha `minLevel?` e `xpReward?`; o seeder grava, o
`generateSeed.ts` lê do banco e o `checkSeedDrift.ts` compara.

## Publicação

Criar as lições não publica `content_version`, mas **isso protege só quem já tem
o catálogo em cache**. As lições estão no banco compartilhado, e `GET /modules`
as devolve a qualquer build da API: uma instalação nova do app antigo, quem abre
um idioma pela primeira vez e quem limpou os dados as recebem **como lições da
trilha** (sem bloqueio por nível e obrigatórias para o emblema da área). O custo
é pequeno (uma lição a mais para o emblema; o servidor paga 30 XP e a adoção
corrige o XP local para cima), mas não é nulo.

- **Não publique nenhuma `content_version` — nem a de um conserto sem relação —
  até a versão nova do app estar com os alunos.** Uma publicação qualquer faz
  todo mundo, inclusive quem tem o app antigo, recarregar o catálogo e receber o
  piloto.
- Ordem de publicação: **migration → API → app → `content_version`**.
- Se houver builds antigos em uso real, a alternativa é manter o piloto fora do
  banco compartilhado até a versão nova sair.

## Deixado ao builder

Tons exatos de roxo e cinza, tamanho dos ícones, textos dos rótulos, ordem das
perguntas dentro do piloto.
