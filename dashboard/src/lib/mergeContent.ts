import type { ContentModule, LocaleCode, ModuleResponse, TranslationMap } from '@/types/api'

/**
 * `GET /modules` resolve as traduções num idioma só e usa `?? ''` / `?? {}`
 * quando não há linha para aquele idioma. Quer dizer: **do lado do cliente,
 * "sem tradução" e "tradução vazia" chegam idênticos**.
 *
 * Estas duas funções são a convenção de leitura adotada aqui: um nome vazio ou
 * um `content` sem nenhuma chave contam como ausência. Não é uma inferência
 * arriscada — `minLength: 1` no schema de escrita impede um nome vazio de ser
 * gravado de propósito, e um `content` `{}` não renderiza nada no app.
 */
function hasName (name: string): boolean {
  return name.trim().length > 0
}

function hasContent (content: unknown): boolean {
  return typeof content === 'object' && content !== null && Object.keys(content).length > 0
}

/**
 * Junta as árvores de cada idioma numa só, indexando por `id`.
 *
 * Recebe um mapa por idioma em vez de dois parâmetros posicionais para que
 * acrescentar um terceiro idioma no futuro não mude a assinatura.
 */
export function mergeModulesByLocale (
  byLocale: Partial<Record<LocaleCode, ModuleResponse[]>>
): ContentModule[] {
  const modules = new Map<number, ContentModule>()
  const entries = Object.entries(byLocale) as [LocaleCode, ModuleResponse[] | undefined][]

  for (const [locale, localeModules] of entries) {
    for (const module of localeModules ?? []) {
      const merged = modules.get(module.id) ?? {
        id: module.id,
        areaId: module.areaId,
        index: module.index,
        translations: {} as TranslationMap<{ name: string; subtitle?: string | null }>,
        lessons: []
      }

      if (hasName(module.name)) {
        merged.translations[locale] = {
          name: module.name,
          subtitle: hasName(module.subtitle) ? module.subtitle : null
        }
      }

      for (const lesson of module.lessons) {
        let mergedLesson = merged.lessons.find((candidate) => candidate.id === lesson.id)
        if (!mergedLesson) {
          mergedLesson = {
            id: lesson.id,
            moduleId: module.id,
            index: lesson.index,
            translations: {},
            activities: []
          }
          merged.lessons.push(mergedLesson)
        }

        if (hasName(lesson.name)) {
          mergedLesson.translations[locale] = { name: lesson.name }
        }

        for (const activity of lesson.activities) {
          let mergedActivity = mergedLesson.activities.find(
            (candidate) => candidate.id === activity.id
          )
          if (!mergedActivity) {
            mergedActivity = {
              id: activity.id,
              lessonId: lesson.id,
              index: activity.index,
              type: activity.type,
              content: {}
            }
            mergedLesson.activities.push(mergedActivity)
          }

          if (hasContent(activity.content)) {
            mergedActivity.content[locale] = activity.content
          }
        }
      }

      modules.set(module.id, merged)
    }
  }

  // A API já devolve tudo ordenado por `index`, mas a junção de dois idiomas
  // pode intercalar entidades que só existem num deles — reordenar aqui mantém
  // a árvore estável independentemente da ordem de chegada das duas respostas.
  const merged = [...modules.values()].sort((a, b) => a.index - b.index)
  for (const module of merged) {
    module.lessons.sort((a, b) => a.index - b.index)
    for (const lesson of module.lessons) {
      lesson.activities.sort((a, b) => a.index - b.index)
    }
  }

  return merged
}

/** Idiomas em que a entidade ainda não tem tradução. */
export function missingLocales (
  translations: TranslationMap<unknown>,
  locales: LocaleCode[]
): LocaleCode[] {
  return locales.filter((locale) => translations[locale] === undefined)
}
