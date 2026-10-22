import type { LocaleCode } from '@/types/api'

/**
 * Chaves de query centralizadas.
 *
 * Montar uma chave como string solta dentro de um componente é como uma
 * invalidação silenciosamente errada acontece — a mutation invalida
 * `['modules', 1]` e a query estava em `['modules', 1, 'pt']`, ninguém percebe,
 * e a tela fica desatualizada sem erro nenhum. Todas nascem aqui.
 */
export const queryKeys = {
  areas: () => ['areas'] as const,
  modules: (areaId: number, locale: LocaleCode) => ['modules', areaId, locale] as const,
  /** Prefixo que cobre as duas queries de idioma de uma mesma área. */
  modulesByArea: (areaId: number) => ['modules', areaId] as const,
  lessons: (moduleId: number) => ['lessons', moduleId] as const,
  contentVersions: () => ['content-version'] as const
}
