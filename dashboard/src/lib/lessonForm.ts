import { z } from 'zod'
import {
  LOCALES,
  type AdminLessonResponse,
  type LessonTranslationInput,
  type TranslationMap
} from '@/types/api'

/** Mesmos limites da API (`minLevel` 2 a 50, `xpReward` 1 a 100) e da curva de níveis do app. */
const MIN_LEVEL_RANGE = { min: 2, max: 50 }
const XP_REWARD_RANGE = { min: 1, max: 100 }

/** Valor sugerido ao ligar "Aula de aprofundamento" com o campo vazio: três vezes o XP de uma lição comum. */
export const DEFAULT_XP_REWARD = '30'
/** Valor sugerido ao ligar "Aula do baú" com o campo vazio: é a mais difícil, então paga mais. */
export const DEFAULT_CHEST_XP_REWARD = '50'

function isIntegerInRange (value: string, { min, max }: { min: number; max: number }): boolean {
  const number = Number(value)
  return value.trim().length > 0 && Number.isInteger(number) && number >= min && number <= max
}

/**
 * Mesma regra do formulário de módulo: nome vazio = idioma não enviado. Os
 * campos de aprofundamento só são validados com o interruptor ligado, e o do baú
 * não pede nível. O XP pode ficar **vazio** nos dois: é "o padrão" (10) — a API
 * guarda `null`. Aprofundamento e baú se excluem.
 */
export const lessonFormSchema = z.object({
  pt: z.object({ name: z.string() }),
  en: z.object({ name: z.string() }),
  optional: z.boolean(),
  chest: z.boolean(),
  minLevel: z.string(),
  xpReward: z.string()
}).superRefine((values, ctx) => {
  if (!LOCALES.some((locale) => values[locale].name.trim().length > 0)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Preencha o nome em ao menos um idioma.',
      path: ['pt', 'name']
    })
  }

  if (values.optional && values.chest) {
    ctx.addIssue({
      code: 'custom',
      message: 'Escolha só um: aula de aprofundamento ou aula do baú.',
      path: ['chest']
    })
  }

  if (values.optional && !isIntegerInRange(values.minLevel, MIN_LEVEL_RANGE)) {
    ctx.addIssue({
      code: 'custom',
      message: `O nível mínimo vai de ${MIN_LEVEL_RANGE.min} a ${MIN_LEVEL_RANGE.max}.`,
      path: ['minLevel']
    })
  }

  if ((values.optional || values.chest) && values.xpReward.trim().length > 0 && !isIntegerInRange(values.xpReward, XP_REWARD_RANGE)) {
    ctx.addIssue({
      code: 'custom',
      message: `O XP vai de ${XP_REWARD_RANGE.min} a ${XP_REWARD_RANGE.max}, ou deixe vazio para o padrão (10).`,
      path: ['xpReward']
    })
  }
})

export type LessonFormValues = z.infer<typeof lessonFormSchema>

/**
 * Os números mostram o que está gravado, sem inventar: um `xpReward` nulo
 * aparece vazio ("padrão"), nunca como 30 — senão salvar só uma renomeação
 * trocaria 10 XP por 30 sem ninguém ver.
 */
export function toFormValues (lesson?: AdminLessonResponse): LessonFormValues {
  return {
    pt: { name: lesson?.translations.pt?.name ?? '' },
    en: { name: lesson?.translations.en?.name ?? '' },
    optional: lesson?.minLevel != null,
    chest: lesson?.chest === true,
    minLevel: lesson?.minLevel?.toString() ?? '',
    xpReward: lesson?.xpReward?.toString() ?? ''
  }
}

export function toTranslations (values: LessonFormValues): TranslationMap<LessonTranslationInput> {
  const translations: TranslationMap<LessonTranslationInput> = {}

  for (const locale of LOCALES) {
    const name = values[locale].name.trim()
    if (name.length > 0) {
      translations[locale] = { name }
    }
  }

  return translations
}

/** XP vazio = "padrão" (10) = `null` na API. */
function parseXpReward (value: string): number | null {
  const xp = value.trim()
  return xp === '' ? null : Number(xp)
}

/**
 * O que enviar de `minLevel`/`xpReward`/`chest` ao salvar. Só mexe no que o
 * usuário mexeu: na API, ausente não toca na coluna e `null` a limpa.
 *
 * - Baú ligado: envia o XP (e `chest: true` se a lição ainda não era do baú — a
 *   API zera o nível sozinha).
 * - Aprofundamento ligado: envia o nível e o XP (e `chest: false` se era do baú).
 * - Era aula de aprofundamento ou do baú e foi desligada: volta à trilha
 *   principal, com `null` em tudo que ela tinha.
 * - Lição da trilha, interruptores desligados o tempo todo: não envia nada. Zerar
 *   o `xpReward` de uma lição da trilha num "Salvar" qualquer seria uma
 *   alteração que ninguém pediu.
 */
export function toDeepeningFields (
  values: LessonFormValues,
  lesson?: AdminLessonResponse
): { minLevel?: number | null; xpReward?: number | null; chest?: boolean } {
  if (values.chest) {
    const xpReward = parseXpReward(values.xpReward)
    return lesson?.chest ? { xpReward } : { chest: true, xpReward }
  }

  if (values.optional) {
    const fields = { minLevel: Number(values.minLevel), xpReward: parseXpReward(values.xpReward) }
    return lesson?.chest ? { ...fields, chest: false } : fields
  }

  if (lesson?.chest) {
    return { chest: false, minLevel: null, xpReward: null }
  }

  if (lesson?.minLevel != null) {
    return { minLevel: null, xpReward: null }
  }

  return {}
}
