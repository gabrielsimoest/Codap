/**
 * Ponto único de entrada dos tipos da API.
 *
 * Nada aqui é redeclarado: tudo vem de `codap-api/src/types/contracts`, o mesmo
 * arquivo que o app consome via `codap-api: workspace:*`. Se falta um tipo, ele
 * nasce lá, não aqui — é o que garante que dashboard, app e API não divirjam.
 */
export type {
  ActivityResponse,
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
  LessonResponse,
  LessonTranslationInput,
  LocaleCode,
  ModuleResponse,
  ModuleTranslationInput,
  OptionActivityContent,
  PublishContentVersionBody,
  ReorderBody,
  TheoryActivityContent,
  TranslationMap,
  UpdateActivityBody,
  UpdateAreaBody,
  UpdateLessonBody,
  UpdateModuleBody
} from 'codap-api/src/types/contracts'

import type { AdminLessonResponse, AdminModuleResponse, LocaleCode } from 'codap-api/src/types/contracts'

/**
 * Um módulo com todas as suas lições e atividades, em todos os idiomas — a
 * forma que o dashboard usa na árvore de navegação.
 *
 * É montada no cliente juntando `GET /modules?locale=pt` e `?locale=en` (ver
 * `src/lib/mergeContent.ts`), e sai com exatamente a mesma forma que as rotas
 * de escrita devolvem. Isso é proposital: um formulário pode ser alimentado
 * tanto pela árvore quanto pela resposta de uma mutation, sem adaptação.
 */
export interface ContentModule extends AdminModuleResponse {
  lessons: AdminLessonResponse[];
}

/** Idiomas do catálogo, na ordem em que aparecem na interface. */
export const LOCALES: LocaleCode[] = ['pt', 'en']

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  pt: 'Português',
  en: 'Inglês'
}
