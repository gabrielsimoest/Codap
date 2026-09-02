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
