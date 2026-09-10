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
  /** Código do idioma (`locales.locale`), ex.: `pt`. */
  locale: string;
  /** Três segmentos numéricos, ex.: `0.1.4`. */
  version: string;
  changelog: string;
  /** `YYYY-MM-DD` — a coluna é `@db.Date`, sem hora. */
  releasedAt: string;
}

export interface PublishContentVersionBody {
  locale: string;
  version: string;
  changelog: string;
}
