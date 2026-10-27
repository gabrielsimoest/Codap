# Limitações conhecidas e próximos passos

Este documento reúne, em um só lugar, o que o sistema **ainda não faz** e o que foi
considerado e deixado para depois. Nada aqui é compromisso de entrega. O que foi
decidido *não* fazer, e por quê, está registrado junto da funcionalidade correspondente.

## Limitações conhecidas

### Servidor e dados

| Limitação | Por que existe / o que mitiga |
|---|---|
| O `/sync` **não confere `min_level`** de aulas de aprofundamento | Conferir reprovaria eventos de um mesmo lote que dependem uns dos outros (rodam em paralelo). Um cliente adulterado só ganha o XP da aula. |
| **Não há log de compras** da loja | Só o saldo e os estoques. Se importar um dia, o cálculo teria de partir de um log que hoje não existe. |
| O Dobro de XP confia no `occurredAt` do cliente | Mitigado pelo teto de 5 lições dobradas por janela. |
| A restauração de progresso **só soma** | Um evento recusado pelo servidor (`lesson_locked`) segue marcado só no aparelho. |
| Um evento malformado bloqueia o lote do `/sync` | O lote é validado por inteiro (400). A causa conhecida (id não UUID) foi eliminada. |
| Templates de e-mail são provisórios e só em pt-BR | A conta (`users`) não guarda idioma. |
| `GET /modules` valida `locale` por `enum: ['pt','en']` | É o que impede suportar um terceiro idioma sem mexer na API. |
| Não há endpoint para **remover uma tradução** | Limpar o campo no dashboard só deixa de alterá-la. |
| Testes da API rodam no banco real e, em paralelo, falham de forma intermitente | Não há banco de teste separado; rode em série para um resultado confiável. |
| Plano gratuito do Render dorme | Mitigado no app (aquecimento, esperas, repetição) e por um monitor externo. |

### Aplicativo

| Limitação | Detalhe |
|---|---|
| Sem suíte de testes nem lint | A verificação é `tsc --noEmit` e conferência manual. |
| `expo-notifications` não funciona no Expo Go do Android | Só em build de desenvolvimento ou no APK. |
| Lembretes: sem push remoto, sem horário preferido, sem abrir tela específica, sem ícone monocromático | Escolhas deliberadas. |
| Splash, ícone e barra de navegação só têm efeito em build nativo | No Expo Go quem aparece é a tela do próprio Expo Go. |
| React/JSX, Tailwind, Node/Express e TypeScript **não executam** no app | Sem transpilador embarcado (peso de bundle em todo aparelho por conteúdo fixo). O código é exibido; o terminal usa `terminalCode`. |
| Exercícios que dependem de rede ou de timer não cabem no playground | A correção roda no `DOMContentLoaded`, e a CSP bloqueia a rede. |
| O terminal captura uma única vez (após o script síncrono) | `console.log` dentro de `setTimeout` não é capturado. |
| O Tailwind exibido é um **subconjunto** (`tailwindSubset.ts`) | Não há motor JIT nem CDN (inviável offline). Classe fora do mapa não gera regra. |
| Aba "Web" de várias lições antigas de JavaScript segue `onlyCode: true` | Ligar a aba é revisão de conteúdo, lição a lição. |
| Sem mostrar nível/XP dentro das trilhas | Decisão de produto; pode mudar. |
| Realce de sintaxe **dentro** do editor livre do desafio | Analisado e adiado; o caminho seria `<Text>` aninhados no `TextInput`, testado em aparelho. |
| Código de realce: o `highlight` tem a classe de letras restrita ao português | Outro alfabeto exigiria estender (`À-ÿ` hoje). |

### Dashboard

- Sem autenticação nem multiusuário (ferramenta local, uma pessoa por vez).
- Escreve no banco compartilhado com a produção; não há ambiente de homologação.

## Ideias consideradas e não construídas

### Produto

- **Revisão espaçada** (spaced repetition): reaproveitar atividades de lições já concluídas
  em sessões de revisão. Não é um tipo novo — muda como as atividades são selecionadas e
  agendadas. Exigiria mexer em progresso e agendamento.
- **Cosméticos** (molduras, temas do Cody), **cronômetro de aula** e **desafios com tempo**.
- **Conquistas de completude** (por exemplo, "todas as aulas opcionais de HTML").
- **Indicação do nível mínimo acima da área** nas trilhas.
- **Mais aulas de aprofundamento e do baú** (a trilha completa fecha no nível ~30; os níveis
  31 a 50 dependem de conteúdo opcional — faltam ~1 700 XP além da trilha).
- **Mais idiomas.**
- **Validação pedagógica** por profissional de educação: a sequência
  teoria → reconhecimento → recall → produção é uma hipótese de trabalho, não currículo
  validado. O export em PDF/Markdown do dashboard existe para esse fim.

### Técnico

- **Prática de código para as lições de React** (hoje só há perguntas conceituais nas nove
  lições conceituais) e uma atividade de código de Node/Express. Dependem de spikes:
  - transpilador de React em WebView,
  - verificador de TypeScript em WebView,
  - bundle estático de Tailwind/Bootstrap.

  Cada um deve ser avaliado por **peso real em dispositivo** antes de entrar em qualquer
  planejamento.
- **Marcar eventos malformados como `failed`** em vez de `pending`, se o bloqueio da fila
  voltar a ocorrer.
- **Conferir `min_level` no servidor**, resolvendo a dependência entre eventos do mesmo lote.
- **Alternativa de hospedagem da API** com camada gratuita de inicialização mais rápida
  (Cloud Run foi a opção estudada).
- **Automatizar publicação** (CI/CD) e testes do app.
- **Migrar as 8 lições que ainda usam CSS resolvido à mão** (`additionalCode`) para o
  `tailwindSubset.ts`.
- **Padronizar o destaque `<tag>`** no conteúdo que ainda tem termos soltos (`a`, `p`, `q`).

## Como este documento é mantido

Quando uma limitação for resolvida, remova-a daqui e descreva o comportamento novo no
documento da funcionalidade. Quando uma nova limitação for **aceita de propósito**,
registre-a aqui (e junto da funcionalidade, com o motivo).
