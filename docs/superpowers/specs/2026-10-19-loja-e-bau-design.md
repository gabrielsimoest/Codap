# Loja funcional e baú surpresa (Fases 2 e 3b) — design

Data: 2026-10-19. Continuação de [2026-10-18-xp-niveis-bits-design.md](2026-10-18-xp-niveis-bits-design.md)
("Fase 2 — loja funcional" e "Baú Surpresa") e de
[2026-10-18-aulas-aprofundamento-design.md](2026-10-18-aulas-aprofundamento-design.md).
O desenvolvedor mandou seguir na implementação depois da Fase 3a; este documento
fecha o desenho do que a spec anterior deixou decidido, mas não construído.

## Intenção

Hoje a loja é vitrine: toda compra abre o "em breve" e os Bits só se acumulam.
Esta fase faz os Bits **servirem para algo**: gastar numa dica na hora, num dobro
de XP temporário e num baú que revela uma aula exclusiva e difícil — que fica
para sempre numa coleção. Nada da trilha principal passa a depender disso.

## Objetivos, não objetivos e anti-objetivos

**Objetivos:** gastar Bits com saldo validado no servidor; três itens funcionando
(Dica instantânea, Dobro de XP, Baú Surpresa); a coleção de aulas do baú, escondida
até ser revelada e com a contagem por área no modal da loja; dashboard capaz de
criar aulas do baú; um acervo inicial de 6 aulas exclusivas.

**Não objetivos:** cosméticos, conquista de completude ("todas as aulas do HTML"),
cronômetro de aula, desafio com tempo, troca/venda de itens, histórico de compras.

**Anti-objetivos:** gastar Bits que a pessoa não tem; cobrar sem entregar; um item
da loja bloquear qualquer coisa da trilha; mostrar quais aulas do baú existem.

## Decisões do desenvolvedor (conversa)

- XP é progresso e nunca se gasta; **Bits** são a moeda (10 × nível ao subir).
- O **Dobro de Tempo** vira "reduz ou libera a dica na hora" (**Dica instantânea**);
  o Dobro de XP continua. Preços exibidos na loja: Dobro de XP 200, Baú 500, o item
  de dica 300.
- O baú entrega aulas **exclusivas e muito difíceis**, que **ficam para sempre**
  (coleção), **ocultas** até serem rereveladas; o modal do baú, na loja, mostra a
  contagem por área ("HTML: 3 de 8"). Garantia contra azar: a cada X baús, sai ao
  menos uma aula nova. Pool inicial pequeno. Aula do baú com borda **magenta** e
  uma **caveira cibernética**.
- Moedas e baú não podem bloquear a trilha.

## Escolhas minhas (revise)

1. **Toda operação da loja exige internet e é validada no servidor.** O app é
   offline-first para XP, mas gastar saldo offline obrigaria a desfazer compras
   quando o servidor discordasse. Comprar, usar a dica e abrir o baú são requisições
   que só têm efeito se o servidor responder com sucesso. Antes de comprar, o app
   envia a fila de sync (os Bits de lições feitas offline só existem para o
   servidor depois disso) e recusa a compra se ainda sobrar evento pendente.
2. **Preços moram no servidor** (`GET /shop` os devolve), para não duplicar a
   constante: Dobro de XP 200, Dica instantânea 300, Baú 500.
3. **Dobro de XP = janela de 5 minutos, por horário do evento.** O servidor guarda
   cada janela (`xp_boosts`: início e fim) e dobra o XP de toda `lesson_completed`
   cujo `occurredAt` cai dentro de alguma janela — assim funciona também para lições
   feitas offline e sincronizadas depois, e não depende da ordem dos eventos do
   lote. Comprar de novo com uma janela ativa é recusado (409). O app calcula o
   mesmo localmente a partir do fim da janela (`Users.doubleXpEndsAt`); se o relógio
   do aparelho destoar do servidor, a adoção do `profile` corrige o XP.
4. **Dica instantânea = estoque.** Comprar soma 1 em `users.instant_hints`; usar
   (`POST /shop/use-hint`, online) subtrai 1, e o app libera a próxima dica do
   desafio na hora. Sem consumo offline, para não precisar de um log de consumo com
   idempotência por evento.
5. **Baú: sorteio no servidor, com garantia.** Resultados: aula exclusiva ainda não
   revelada (peso 40), Dica instantânea (25), Dobro de XP (20) ou 250 Bits (15). Se
   o baú anterior não deu aula 2 vezes seguidas (`users.chest_misses`), o próximo é
   aula; sem aulas restantes, o peso dela sai do sorteio. Um dobro de XP sorteado com
   janela ativa entra logo depois do fim dela. O sorteio é uma função pura que
   recebe o gerador de números aleatórios (testável com sequência fixa).
6. **Aula do baú é uma lição com `is_chest = true`**, sem `min_level`. Fica **fora de
   `GET /modules`** (o catálogo é igual para todos e cacheado para sempre; ela é
   por usuário) e chega por `GET /collection`, que só devolve as reveladas. O
   dashboard as enxerga por um parâmetro de `GET /modules` que só vale em
   desenvolvimento.
7. **O servidor recusa `lesson_completed` de aula do baú não revelada**
   (`lesson_locked`) — ao contrário do nível mínimo, isto não depende da ordem dos
   eventos do lote, porque revelar é uma compra online anterior.
8. **Acervo inicial: 6 aulas, 2 por área, 50 XP cada**, no módulo Avançado:
   HTML "Custom Elements" e "Validação nativa de formulários"; CSS "@property" e
   "Subgrid"; JavaScript "Proxy e Reflect" e "Tagged templates". Cada uma com 6
   atividades (2 teoria, 3 múltipla escolha, 1 completar código), em pt e en.
9. **A loja não compra nada se o saldo não cobre** (402 com o saldo atual) e todo
   efeito acontece na **mesma transação** da cobrança, com o usuário travado
   (`FOR UPDATE`) para duas compras simultâneas não passarem pelo mesmo saldo.

## Contrato (API)

- `GET /shop` → `{ prices, bits, instantHints, doubleXpEndsAt, chest: { missesInARow,
  areas: [{ areaId, total, revealed }] } }` (autenticado).
- `POST /shop/purchase` `{ item: 'double_xp' | 'instant_hint' | 'chest' }` → `{ item,
  bits, instantHints, doubleXpEndsAt, chest? }`, com `chest` = o resultado do
  sorteio. Erros: `402 insufficient_bits`, `409 boost_active`.
- `POST /shop/use-hint` → `{ instantHints }`; `409 no_hints` sem estoque.
- `GET /collection?locale=` → `{ lessons }`: as aulas reveladas, no formato de
  `LessonResponse` mais `moduleId` e `areaId`.
- `POST /sync`: XP dobrado dentro de janela de boost; `lesson_locked` para aula do
  baú não revelada.
- Lições: `lessons.is_chest`; `chest` nos corpos de escrita (ligar `chest` zera o
  `minLevel`; os dois no mesmo corpo é 400) e nas respostas.
- Novas tabelas: `xp_boosts`, `user_chest_lessons` (única por usuário e lição);
  novas colunas: `users.instant_hints`, `users.chest_misses`, `lessons.is_chest`.

## App

- `ShopService` (as 4 chamadas) e `ShopStore` (o estado da loja em memória);
  uma ação de compra que envia a fila, confere pendências, compra e atualiza o saldo
  local (SQLite e store).
- Tela da loja de verdade: três cartões iguais num componente só, com o estado
  (janela ativa, estoque) e as mensagens de erro; o modal do baú lista as contagens
  por área e o resultado do sorteio aparece num aviso.
- Coleção: consulta React Query por usuário e idioma, persistida e invalidada ao
  revelar uma aula e a cada `content_version`; a lista de lições mescla as aulas
  reveladas ao fim do módulo delas, com a borda magenta e a caveira; a tela de lição
  também acha a aula na coleção.
- Desafio (`code_editor`): botão "Liberar agora" na ajuda progressiva quando há
  estoque; o relógio de uma dica por vez continua valendo.
- `Users.doubleXpEndsAt` (SQLite, migração v6): `completeLesson` dobra o XP e marca
  `boosted` no resultado.
- Os textos do "Dobro de Tempo" viram "Dica instantânea".

## Dashboard

O formulário de lição ganha o interruptor "Aula do baú", exclusivo com o de
aprofundamento (ligar um desliga o outro); aula do baú só tem XP. A árvore marca
com "Baú · +XP". `GET /modules` ganha o parâmetro `includeChest` (só em
desenvolvimento) para a árvore enxergá-las.

## Seed

`LessonSeed` ganha `chest?`; seeder, `generateSeed` e `checkSeedDrift` o conhecem.

## Publicação

As aulas do baú não entram no catálogo (`GET /modules`), então **não exigem uma
`content_version`** para existir, mas o app antigo não tem a loja nova: a compra
real só funciona na versão nova do app. A migration precisa ir antes da API, e a
API antes do app.

## Deixado ao builder

Textos e imagens dos cartões e avisos, tons exatos do magenta, a animação (se
houver) da revelação do baú, a ordem das atividades dentro de cada aula do baú.
