import { z } from 'zod'

/**
 * Validação do `content` de uma atividade.
 *
 * **Este é o único ponto do sistema onde esse conteúdo é validado.**
 * `activity_translations.content` é um JSONB sem forma no Postgres, e a API o
 * transporta fielmente de propósito — sem `oneOf`, sem `properties` — para que
 * um `type` novo atravesse sem mudança de schema (ver api/CLAUDE.md). Tudo que
 * impede um `content` malformado de virar dado está aqui.
 *
 * Os schemas espelham `TheoryActivityContent`/`OptionActivityContent` de
 * `codap-api/src/types/contracts.ts`. Os tipos continuam vindo de lá; estes
 * schemas descrevem a mesma forma para efeito de validação — ao mudar um dos
 * contratos, mude os dois.
 */

export const CODE_LANGUAGES = ['HTML', 'CSS', 'JavaScript', 'TypeScript'] as const

const codeLanguageSchema = z.enum(CODE_LANGUAGES)

const additionalCodeSchema = z.object({
  codeLanguage: codeLanguageSchema,
  code: z.string().min(1, 'O bloco de código não pode ficar vazio.')
})

export const theoryContentSchema = z.object({
  firstParagraph: z.string().min(1, 'O primeiro parágrafo é obrigatório.'),
  secondParagraph: z.string().optional(),
  thirdParagraph: z.string().optional(),
  endParagraph: z.string().optional(),
  highlight: z.array(z.string().min(1)),
  codeLanguage: codeLanguageSchema,
  code: z.string().min(1, 'O bloco de código é obrigatório.'),
  additionalCode: z.array(additionalCodeSchema).optional(),
  onlyCode: z.boolean().optional(),
  tutorial: z.boolean().optional()
})

export const optionContentSchema = z.object({
  question: z.string().min(1, 'A pergunta é obrigatória.'),
  // O nome com esse erro de digitação é o que está gravado no banco e o que o
  // app lê (`OptionActivityContent.aditionalParagraph`). Corrigir aqui
  // quebraria todo o conteúdo já semeado.
  aditionalParagraph: z.string().optional(),
  highlight: z.array(z.string().min(1)),
  tutorial: z.boolean().optional(),
  /** 1-based: a primeira opção é `1`, não `0`. */
  correctOption: z.number().int().min(1),
  options: z.array(z.string().min(1, 'A alternativa não pode ficar vazia.')).min(2, 'São necessárias ao menos duas alternativas.')
}).refine(
  (content) => content.correctOption <= content.options.length,
  { message: 'A alternativa correta precisa apontar para uma das opções.', path: ['correctOption'] }
)

export type TheoryContentForm = z.infer<typeof theoryContentSchema>
export type OptionContentForm = z.infer<typeof optionContentSchema>

/** Tipos com formulário dedicado. Qualquer outro cai no editor de JSON cru. */
export const TYPED_ACTIVITY_TYPES = ['theory', 'option'] as const

export type TypedActivityType = (typeof TYPED_ACTIVITY_TYPES)[number]

export function isTypedActivity (type: string): type is TypedActivityType {
  return (TYPED_ACTIVITY_TYPES as readonly string[]).includes(type)
}

export function emptyTheoryContent (): TheoryContentForm {
  return {
    firstParagraph: '',
    highlight: [],
    codeLanguage: 'HTML',
    code: '',
    onlyCode: false
  }
}

export function emptyOptionContent (): OptionContentForm {
  return {
    question: '',
    highlight: [],
    correctOption: 1,
    options: ['', '']
  }
}
