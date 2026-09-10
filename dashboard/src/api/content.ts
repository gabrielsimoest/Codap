import { request } from './client'
import type {
  AdminActivityResponse,
  AdminAreaResponse,
  AdminLessonResponse,
  AdminModuleResponse,
  AreaResponse,
  ContentVersionResponse,
  CreateActivityBody,
  CreateAreaBody,
  CreateLessonBody,
  CreateModuleBody,
  LocaleCode,
  ModuleResponse,
  PublishContentVersionBody,
  UpdateActivityBody,
  UpdateAreaBody,
  UpdateLessonBody,
  UpdateModuleBody
} from '@/types/api'

// Uma função por operação da API, sem nenhuma lógica de cache — quem cuida
// disso são os hooks em `src/hooks/`. Aqui só mora o formato da requisição.

export const areasApi = {
  list: () => request<AreaResponse[]>('/areas'),
  create: (body: CreateAreaBody) =>
    request<AdminAreaResponse>('/areas', { method: 'POST', body }),
  update: (id: number, body: UpdateAreaBody) =>
    request<AdminAreaResponse>(`/areas/${id}`, { method: 'PATCH', body }),
  remove: (id: number) => request<void>(`/areas/${id}`, { method: 'DELETE' })
}

export const modulesApi = {
  list: (areaId: number, locale: LocaleCode) =>
    request<ModuleResponse[]>(`/modules?areaId=${areaId}&locale=${locale}`),
  create: (body: CreateModuleBody) =>
    request<AdminModuleResponse>('/modules', { method: 'POST', body }),
  update: (id: number, body: UpdateModuleBody) =>
    request<AdminModuleResponse>(`/modules/${id}`, { method: 'PATCH', body }),
  remove: (id: number) => request<void>(`/modules/${id}`, { method: 'DELETE' }),
  reorder: (areaId: number, orderedIds: number[]) =>
    request<void>('/modules/reorder', { method: 'PATCH', body: { areaId, orderedIds } })
}

export const lessonsApi = {
  list: (moduleId: number) => request<AdminLessonResponse[]>(`/lessons?moduleId=${moduleId}`),
  create: (body: CreateLessonBody) =>
    request<AdminLessonResponse>('/lessons', { method: 'POST', body }),
  update: (id: number, body: UpdateLessonBody) =>
    request<AdminLessonResponse>(`/lessons/${id}`, { method: 'PATCH', body }),
  remove: (id: number) => request<void>(`/lessons/${id}`, { method: 'DELETE' }),
  reorder: (moduleId: number, orderedIds: number[]) =>
    request<void>('/lessons/reorder', { method: 'PATCH', body: { moduleId, orderedIds } })
}

export const activitiesApi = {
  create: (body: CreateActivityBody) =>
    request<AdminActivityResponse>('/activities', { method: 'POST', body }),
  update: (id: number, body: UpdateActivityBody) =>
    request<AdminActivityResponse>(`/activities/${id}`, { method: 'PATCH', body }),
  remove: (id: number) => request<void>(`/activities/${id}`, { method: 'DELETE' }),
  reorder: (lessonId: number, orderedIds: number[]) =>
    request<void>('/activities/reorder', { method: 'PATCH', body: { lessonId, orderedIds } })
}

export const contentVersionApi = {
  /** Versão vigente de cada idioma. Sem filtro: o dashboard mostra todas. */
  list: () => request<ContentVersionResponse[]>('/content-version'),
  publish: (body: PublishContentVersionBody) =>
    request<ContentVersionResponse>('/content-version', { method: 'POST', body })
}
