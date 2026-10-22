import type { AdminActivityResponse, LocaleCode } from '@/types/api'
import { LOCALES } from '@/types/api'

/**
 * Regra editorial das teorias, vista do dashboard: **a primeira atividade
 * teórica de cada lição usa a persona Cody**; as seguintes escolhem. É a
 * pré-checagem do que o backend também garante
 * (`api/src/utils/theoryRules.ts`) — aqui serve para desabilitar o botão e
 * explicar o motivo, em vez de deixar o autor descobrir por um erro da API.
 *
 * "Primeira" é a de menor posição entre as atividades `theory` **da própria
 * lição**; atividades de outros tipos não contam, e só as teorias entram na
 * regra: mover, criar ou remover uma atividade prática nunca é bloqueado.
 */

export const CODY_RULE_MESSAGE =
  'A primeira atividade teórica da lição precisa usar a persona Cody. Mude a persona da outra teoria antes.'

/** `true` quando o conteúdo de algum idioma declara uma introdução que não é Cody. */
export function declaresNonCody (activity: Pick<AdminActivityResponse, 'content'>): boolean {
  return LOCALES.some((locale: LocaleCode) => {
    const content = activity.content[locale] as { introduction?: { persona?: unknown } } | undefined
    const introduction = content?.introduction
    return typeof introduction === 'object' && introduction !== null && introduction.persona !== 'cody'
  })
}

/** A primeira teoria de uma lista de atividades já na ordem da lição. */
export function firstTheory<T extends Pick<AdminActivityResponse, 'type'>> (activities: T[]): T | undefined {
  return activities.find((activity) => activity.type === 'theory')
}

/** A nova ordem (`orderedIds`) deixaria uma teoria não-Cody como a primeira? */
export function reorderBreaksRule (activities: AdminActivityResponse[], orderedIds: number[]): boolean {
  const byId = new Map(activities.map((activity) => [activity.id, activity]))
  const ordered = orderedIds.map((id) => byId.get(id)).filter((activity): activity is AdminActivityResponse => activity !== undefined)
  const first = firstTheory(ordered)
  return first !== undefined && declaresNonCody(first)
}

/** Remover esta atividade deixaria uma teoria não-Cody como a primeira? */
export function removalBreaksRule (activities: AdminActivityResponse[], id: number): boolean {
  const first = firstTheory(activities.filter((activity) => activity.id !== id))
  return first !== undefined && declaresNonCody(first)
}
