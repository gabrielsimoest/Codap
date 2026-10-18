// Tipos de contrato compartilhados entre a API e o app (via `codap-api: workspace:*`).
// Nada aqui gera código em runtime — só tipos, apagados na compilação.

import type { users } from '../generated/prisma/client.js'

// Tudo que representa uma entidade persistida e "vem" da API é derivado do
// Prisma Client gerado, nunca reescrito à mão — mudanças no schema.prisma se
// propagam automaticamente para quem consome este tipo.
export type UserResponse = Omit<users, 'password'>

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginBody {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface RefreshBody {
  refreshToken: string;
}

export type RefreshResponse = Omit<AuthResponse, 'user'>

export interface LogoutBody {
  refreshToken: string;
}

export type SyncEventType = 'lesson_completed' | 'achievement_unlocked'

export interface SyncEventInput {
  clientEventId: string;
  type: SyncEventType;
  occurredAt: string;
  payload: { lessonId: number } | { achievementId: number };
}

export interface SyncRequestBody {
  events: SyncEventInput[];
}

export type SyncEventStatus = 'applied' | 'duplicate' | 'error'

export interface SyncEventResult {
  clientEventId: string;
  status: SyncEventStatus;
  error?: string;
}

export interface SyncResponseBody {
  results: SyncEventResult[];
}

export interface AreaResponse {
  id: number;
  name: string;
}

// Formato do `content` de uma atividade `theory`. Idêntico ao que o app já
// usa em `Theory["lesson"]` — é isso que permite despachar o `content` direto
// para os componentes de renderização, sem camada de adaptação.
export interface TheoryActivityContent {
  firstParagraph: string;
  secondParagraph?: string;
  thirdParagraph?: string;
  endParagraph?: string;
  highlight: string[];
  codeLanguage: 'HTML' | 'CSS' | 'JavaScript' | 'TypeScript';
  code: string;
  /**
   * Blocos de código extras no mesmo trecho (ex.: HTML + CSS juntos), cada um
   * com sua própria aba em `CodeSection` além da aba principal (`codeLanguage`
   * / `code`). Usado sobretudo em CSS, onde a aba "Web" precisa do HTML e do
   * CSS juntos para renderizar a demonstração.
   */
  additionalCode?: { codeLanguage: 'HTML' | 'CSS' | 'JavaScript' | 'TypeScript'; code: string }[];
  onlyCode?: boolean;
  /**
   * Opt-out do terminal (botão "Executar" abaixo do CodeSection, ver
   * app/CLAUDE.md) para uma atividade que mecanicamente seria elegível
   * (`codeLanguage: 'JavaScript'`, sem bloco HTML) mas cujo código não
   * produz nenhuma saída de console — ex.: só declarações/atribuições
   * (destructuring, spread) ou um `export`/`fetch` que erraria ou não
   * mostraria nada de útil dentro da sandbox. Sem isso, "Executar" mostraria
   * sempre "Nenhuma saída de console.", o que não ensina nada.
   */
  noTerminal?: boolean;
  /**
   * JavaScript executável a rodar no terminal no lugar de `code`/
   * `additionalCode`, para quando o que é ensinado não é diretamente
   * executável na sandbox. Dois casos:
   *  - `codeLanguage: 'TypeScript'`: JS pré-transpilado (`ts.transpileModule`,
   *    sem type-check — só apaga tipos), gerado via
   *    `api/prisma/generateTerminalCode.ts`. Sem transpiler embarcado no
   *    app, `code` em TS nunca roda sozinho.
   *  - `codeLanguage: 'JavaScript'`: uma versão adaptada à mão — ex. a mesma
   *    função sem a palavra `export` (que é `SyntaxError` fora de um módulo
   *    ES), ou um `fetch`/API simulada localmente (`setTimeout` no lugar de
   *    uma chamada de rede de verdade, que falharia ou ficaria pendurada na
   *    sandbox). O código **exibido** ao aluno nunca muda — só o que
   *    executa por trás do botão "Executar" é diferente.
   * Em ambos os casos, gerado uma vez na autoria, nunca em runtime: o
   * conteúdo é fixo, nunca editado pelo aluno, então o resultado não muda
   * depois de revisado. Ausente = a atividade não é elegível ao terminal
   * (mesmo efeito de `noTerminal`, mas é o padrão natural aqui — a maioria
   * das lições nesta situação não produz nenhuma saída de console mesmo
   * adaptada, então só as que genuinamente valem a pena rodar ganham este
   * campo).
   */
  terminalCode?: string;
  tutorial?: boolean;
}

export interface OptionActivityContent {
  question: string;
  aditionalParagraph?: string;
  highlight: string[];
  tutorial?: boolean;
  /** 1-based: a primeira opção é `1`, não `0`. */
  correctOption: number;
  options: string[];
  /**
   * Trecho de código mostrado entre o enunciado e as alternativas, com destaque
   * de sintaxe e só leitura (sem aba "Web" nem "Executar", que entregariam a
   * resposta num "qual a saída?"). Ausente = pergunta só de texto, como antes.
   */
  code?: string;
  /** Linguagem do `code`; default `'JavaScript'`. */
  codeLanguage?: 'HTML' | 'CSS' | 'JavaScript' | 'TypeScript';
  /**
   * Banco de perguntas dentro da lição: atividades práticas com o mesmo `pool`
   * são alternativas entre si, e o app sorteia `draw` delas por sessão.
   * Ausente = pool de uma atividade só (sempre aparece).
   */
  pool?: string;
  /** Quantas atividades do pool sortear por sessão. Lido da primeira do pool; default 1. */
  draw?: number;
  /**
   * Não embaralha as alternativas. Usado no verdadeiro/falso, que é uma
   * `option` com duas alternativas ("Verdadeiro" sempre antes de "Falso").
   */
  fixedOrder?: boolean;
  /**
   * Mostra cada alternativa como código (monoespaçado, com destaque de sintaxe
   * em `codeLanguage`) em vez de texto. Usado no "ache o erro"/"qual está
   * certo?". Alternativas podem ter várias linhas (`\n`), com a mesma regra do
   * `code`: no máximo 30 caracteres por linha.
   */
  optionsAsCode?: boolean;
}

/**
 * `type: 'fill_blank'` — completar código **digitando**: o aluno vê o trecho
 * com uma lacuna e escreve a palavra que falta num campo logo abaixo; o código
 * mostra o que está sendo digitado no lugar da lacuna. Diferente do
 * `code_blank`, exige lembrar a resposta, não reconhecê-la entre blocos.
 */
export interface FillBlankActivityContent {
  /** Instrução explícita, ex.: 'Digite a tag de parágrafo que fecha o texto "Oi".' */
  question: string;
  highlight: string[];
  codeLanguage: 'HTML' | 'CSS' | 'JavaScript' | 'TypeScript';
  /**
   * Trecho com **exatamente uma** lacuna marcada por `___` (a mesma marca do
   * `code_blank`). No máximo 30 caracteres por linha com a resposta encaixada.
   */
  code: string;
  /**
   * Respostas aceitas (1 a 3); a primeira é a principal. Só letras, números e
   * hífen, até 20 caracteres — digitar `<`, `{` ou `;` no celular é justamente
   * o que este formato evita. A correção ignora espaços nas pontas.
   */
  answers: string[];
  /**
   * Aceita a resposta com qualquer combinação de maiúsculas e minúsculas. Use em
   * HTML e CSS (`H1` vale como `h1`); deixe ausente em JavaScript e TypeScript,
   * onde `push` e `Push` são coisas diferentes.
   */
  ignoreCase?: boolean;
  tutorial?: boolean;
  /** Mesmo sorteio da `option` (ver `OptionActivityContent.pool`). */
  pool?: string;
  draw?: number;
}

/**
 * `type: 'code_playground'` — playground guiado (Fase 3a do roadmap): o aluno
 * completa de 1 a 3 lacunas tocando em blocos, como no `code_blank`, e o código
 * **roda de verdade** numa WebView (prévia de HTML/CSS + console). A correção é
 * pelo **comportamento**: o `checkScript` roda depois do código do aluno e
 * chama `__codap_report(passed, message?)` — qualquer combinação de blocos que
 * funcione é aceita, não só a prevista.
 */
export interface CodePlaygroundActivityContent {
  /** Instrução explícita: o que o código precisa fazer ao rodar. */
  question: string;
  highlight: string[];
  /** Linguagem do trecho que o aluno completa. */
  codeLanguage: 'HTML' | 'CSS' | 'JavaScript';
  /**
   * O trecho do aluno, com 1 a 3 lacunas `___` (mesma marca do `code_blank`).
   * No máximo 30 caracteres por linha com a solução encaixada.
   */
  code: string;
  /** Blocos oferecidos para as lacunas (soluções e distratores juntos), embaralhados. */
  blocks: string[];
  /**
   * Um preenchimento que passa no `checkScript`, na ordem das lacunas. Serve à
   * autoria (o dashboard e os scripts de conteúdo rodam o exercício com ela);
   * o app **não** corrige comparando com ela.
   */
  solution: string[];
  /**
   * Arquivos de apoio fixos, que o aluno não edita: o documento roda com eles
   * mais o `code` no lugar da linguagem `codeLanguage`. Ex.: um exercício de CSS
   * leva o `html` em que o estilo se aplica.
   */
  html?: string;
  css?: string;
  js?: string;
  /**
   * JavaScript autorado (nunca do aluno) que roda depois do código e chama
   * `__codap_report(passed, message?)`. Pode ler o DOM, `getComputedStyle` e o
   * console capturado em `window.__codapConsoleEntries`. Sem chamar o report, o
   * resultado conta como erro.
   */
  checkScript: string;
  tutorial?: boolean;
  /** Mesmo sorteio da `option` (ver `OptionActivityContent.pool`). */
  pool?: string;
  draw?: number;
}

/**
 * `type: 'code_editor'` — desafio final de módulo (Fase 3b do roadmap): o aluno
 * **digita** o código livremente, executa numa WebView (prévia + console) e a
 * correção é pelo comportamento, como no `code_playground`. Vive sozinho numa
 * lição "Testando seus conhecimentos" no fim dos módulos 2 e 3 de cada área, e
 * a lista de lições do app marca como desafio toda lição que tem um.
 *
 * Para não travar quem empaca, as dicas e por fim a solução são liberadas aos
 * poucos — por tempo ou por execuções que não passaram, o que vier primeiro.
 * Concluir a lição continua exigindo passar.
 */
export interface CodeEditorActivityContent {
  /** O desafio: o que o código precisa fazer ao rodar, com os valores exatos. */
  question: string;
  highlight: string[];
  /** Linguagem que o aluno escreve. */
  codeLanguage: 'HTML' | 'CSS' | 'JavaScript';
  /** Código com que o editor começa (pode ser vazio). O aluno pode voltar a ele. */
  starterCode: string;
  /** Arquivos de apoio fixos, como no `code_playground`. */
  html?: string;
  css?: string;
  js?: string;
  /**
   * JavaScript autorado que roda depois do código do aluno. Num desafio, chame
   * `__codap_check(rotulo, passou)` uma vez por requisito: o aluno vê a lista
   * marcada e passa quando todos passam. `__codap_report(passed, message?)`
   * continua valendo e tem a palavra final se for chamado.
   */
  checkScript: string;
  /** De 1 a 3 dicas, da mais leve à mais direta, liberadas em sequência. */
  hints: string[];
  /** Código completo que passa: liberado por último ao aluno, e usado pelo "Testar" do dashboard. */
  solution: string;
}

/**
 * `type: 'reorder'` — montar o código tocando nas linhas na ordem certa
 * (Parsons problem; o "monte a frase" do Duolingo aplicado a código). O aluno
 * vê as linhas embaralhadas e toca nelas para montar o trecho de cima para
 * baixo; tocar numa linha já posta a devolve.
 */
export interface ReorderActivityContent {
  /** Instrução curta, ex.: "Monte um parágrafo dentro do body." */
  question: string;
  highlight: string[];
  codeLanguage: 'HTML' | 'CSS' | 'JavaScript' | 'TypeScript';
  /**
   * As linhas na ordem correta, de 3 a 6, cada uma com a indentação que terá
   * no código montado (espaços à esquerda). No máximo 30 caracteres por linha.
   * A correção compara o texto da sequência montada com esta, então duas
   * linhas iguais (dois `}`) podem trocar de lugar sem erro. Autoria: só
   * trechos com uma única ordem válida.
   */
  lines: string[];
  /** Linhas que não entram no código (0 a 2), embaralhadas junto. */
  distractors?: string[];
  tutorial?: boolean;
  /** Mesmo sorteio da `option` (ver `OptionActivityContent.pool`). */
  pool?: string;
  draw?: number;
}

/**
 * `type: 'matching'` — ligar pares: duas colunas embaralhadas, o aluno toca um
 * item de cada lado para formar um par.
 */
export interface MatchingActivityContent {
  /** Instrução curta, ex.: "Ligue cada tag à sua função." */
  question: string;
  highlight: string[];
  /** De 3 a 4 pares; `left` até 20 caracteres, `right` até 40. Lados únicos. */
  pairs: { left: string; right: string }[];
  /** Mostra a coluna da esquerda como código (monoespaçado), ex.: tags e propriedades. */
  leftAsCode?: boolean;
  tutorial?: boolean;
  /** Mesmo sorteio da `option` (ver `OptionActivityContent.pool`). */
  pool?: string;
  draw?: number;
}

/**
 * `type: 'code_blank'` — completar código tocando em blocos (estilo
 * Grasshopper), sem teclado: o aluno vê o trecho com 1 a 3 lacunas e toca nos
 * blocos para preenchê-las, na ordem em que aparecem no código.
 */
export interface CodeBlankActivityContent {
  /** Instrução curta, ex.: "Complete para centralizar o texto." */
  question: string;
  highlight: string[];
  codeLanguage: 'HTML' | 'CSS' | 'JavaScript' | 'TypeScript';
  /**
   * Trecho com cada lacuna marcada por `___` (três sublinhados), de 1 a 3.
   * Este arquivo é importado só como tipo pelo app e pelo dashboard, então a
   * marca não é uma constante exportada daqui: cada lado declara a sua.
   * Mesma regra de formatação do `code` da `option`: no máximo 30 caracteres
   * por linha, contando a resposta já encaixada.
   */
  code: string;
  /** Resposta de cada lacuna, na ordem em que aparecem no código. */
  answers: string[];
  /** Blocos errados que aparecem junto com as respostas, embaralhados. */
  distractors: string[];
  tutorial?: boolean;
  /** Mesmo sorteio da `option` (ver `OptionActivityContent.pool`). */
  pool?: string;
  draw?: number;
}

export interface ActivityResponse {
  id: number;
  index: number;
  /** String livre — `activities.type` é `VarChar(25)`, sem enum no banco. */
  type: string;
  /**
   * `activity_translations.content` (JSONB) já resolvido no idioma pedido.
   * `unknown` de propósito: o banco não valida esse blob, então quem renderiza
   * é que precisa estreitar por `type` (ver Theory/OptionActivityContent).
   */
  content: unknown;
}

export interface LessonResponse {
  id: number;
  index: number;
  name: string;
  activities: ActivityResponse[];
}

export interface ModuleResponse {
  id: number;
  areaId: number;
  index: number;
  name: string;
  /** Nome descritivo do módulo (`module_translations.subtitle`) — ex.: "Além do JavaScript". `name` continua o genérico "Módulo N". */
  subtitle: string;
  lessons: LessonResponse[];
}

// ---------------------------------------------------------------------------
// Escrita de conteúdo (dashboard) — só existe com NODE_ENV=development
// ---------------------------------------------------------------------------

/** Idiomas do catálogo. Bate com o `enum` da querystring de `GET /modules`. */
export type LocaleCode = 'pt' | 'en'

/**
 * Traduções de uma entidade, por código de idioma.
 *
 * É **parcial de propósito**: na prática o conteúdo é escrito em português e
 * traduzido depois, então exigir todos os idiomas para salvar tornaria o
 * dashboard inútil no meio do fluxo real de autoria. A consequência a assumir é
 * que uma entidade sem tradução num idioma chega ao app com o campo vazio
 * (`GET /modules` faz `?? ''`) — por isso o dashboard sinaliza o que falta.
 */
export type TranslationMap<T> = Partial<Record<LocaleCode, T>>

export interface ModuleTranslationInput {
  name: string;
  subtitle?: string | null;
}

export interface LessonTranslationInput {
  name: string;
}

export interface CreateAreaBody {
  name: string;
}

export interface UpdateAreaBody {
  name?: string;
}

export interface CreateModuleBody {
  areaId: number;
  /** Omitido = append no fim (`max(index) + 1`). */
  index?: number;
  translations: TranslationMap<ModuleTranslationInput>;
}

export interface UpdateModuleBody {
  translations?: TranslationMap<ModuleTranslationInput>;
}

export interface CreateLessonBody {
  moduleId: number;
  index?: number;
  translations: TranslationMap<LessonTranslationInput>;
}

export interface UpdateLessonBody {
  translations?: TranslationMap<LessonTranslationInput>;
}

export interface CreateActivityBody {
  lessonId: number;
  index?: number;
  /** `activities.type` é `VarChar(25)` livre — ver `ActivityResponse.type`. */
  type: string;
  content: TranslationMap<unknown>;
}

export interface UpdateActivityBody {
  type?: string;
  content?: TranslationMap<unknown>;
}

/**
 * Reordenação: `orderedIds` precisa ser exatamente o conjunto de filhos do pai,
 * na ordem desejada. O servidor renumera `index` de `0..n-1` numa transação —
 * não há constraint única em `(pai, index)` no banco, então deixar o cliente
 * escrever `index` avulso permitiria duplicatas e ordem não-determinística.
 */
export interface ReorderBody {
  orderedIds: number[];
}

// Formas "admin": a mesma entidade com TODAS as traduções, ao contrário de
// `ModuleResponse`/`LessonResponse`, que já vêm resolvidas num idioma só. São o
// retorno das rotas de escrita — o dashboard edita os dois idiomas lado a lado.

export interface AdminAreaResponse {
  id: number;
  name: string;
}

export interface AdminModuleResponse {
  id: number;
  areaId: number;
  index: number;
  translations: TranslationMap<ModuleTranslationInput>;
}

export interface AdminActivityResponse {
  id: number;
  lessonId: number;
  index: number;
  type: string;
  content: TranslationMap<unknown>;
}

export interface AdminLessonResponse {
  id: number;
  moduleId: number;
  index: number;
  translations: TranslationMap<LessonTranslationInput>;
  activities: AdminActivityResponse[];
}

// ---------------------------------------------------------------------------
// Versionamento de conteúdo
// ---------------------------------------------------------------------------

/**
 * Versão publicada do conteúdo de um idioma.
 *
 * O app guarda a versão que já baixou e rebusca o catálogo quando ela **difere**
 * da remota — não quando é menor. Isso cobre rollback e evita comparação semver
 * no cliente (`'0.0.10' > '0.0.9'` é falso como string).
 */
export interface ContentVersionResponse {
  /**
   * Autoincrement, estritamente crescente — é o que ordena as publicações.
   *
   * O app compara por `id`, não pela string de versão: "tudo o que saiu desde a
   * versão do usuário" vira `id > guardado`, sem comparar semver no cliente, e
   * continua correto depois de um rollback (que é uma linha **nova**, com `id`
   * maior, mesmo que o número de versão seja menor).
   */
  id: number;
  /** Código do idioma (`locales.locale`), ex.: `pt`. */
  locale: string;
  /** Três segmentos numéricos, ex.: `0.1.4`. */
  version: string;
  /** Escrito para o aluno: é o texto que aparece no aviso do app. */
  changelog: string;
  /** `YYYY-MM-DD` — a coluna é `@db.Date`, sem hora. */
  releasedAt: string;
  /** Se esta publicação aparece no aviso de "conteúdo atualizado" do app. */
  announce: boolean;
}

export interface PublishContentVersionBody {
  locale: string;
  version: string;
  changelog: string;
  /** Omitido = `false`: a publicação atualiza o conteúdo em silêncio. */
  announce?: boolean;
}
