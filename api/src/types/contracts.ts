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

export interface LessonSummary {
  id: number;
  index: number;
  name: string;
}

export interface ModuleResponse {
  id: number;
  areaId: number;
  index: number;
  name: string;
  lessons: LessonSummary[];
}
