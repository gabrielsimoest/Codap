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
  /** Esconde o botão "Executar" do terminal numa tela de JS sem saída de console. */
  noTerminal: z.boolean().optional(),
  /** JS que o terminal executa no lugar de `code` (TS pré-transpilado ou JS simulado). */
  terminalCode: z.string().optional(),
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
  options: z.array(z.string().min(1, 'A alternativa não pode ficar vazia.')).min(2, 'São necessárias ao menos duas alternativas.'),
  /** Trecho de código mostrado entre o enunciado e as alternativas (só leitura). */
  code: z.string().optional(),
  codeLanguage: codeLanguageSchema.optional(),
  /** Banco de perguntas: práticas com o mesmo `pool` são sorteadas entre si. */
  pool: z.string().optional(),
  /** Quantas do pool sortear por sessão (lido da primeira do pool). */
  draw: z.number().int().min(1, 'Sorteie ao menos uma.').optional(),
  /** Não embaralha as alternativas (verdadeiro/falso). */
  fixedOrder: z.boolean().optional()
}).refine(
  (content) => content.correctOption <= content.options.length,
  { message: 'A alternativa correta precisa apontar para uma das opções.', path: ['correctOption'] }
)

/** Marca de lacuna no `code` de `code_blank` (mesma do app — ver o contrato). */
export const CODE_BLANK_MARKER = '___'

export function countBlanks (code: string): number {
  return code.split(CODE_BLANK_MARKER).length - 1
}

export const codeBlankContentSchema = z.object({
  question: z.string().min(1, 'A instrução é obrigatória.'),
  highlight: z.array(z.string().min(1)),
  codeLanguage: codeLanguageSchema,
  /** Trecho com cada lacuna marcada por ___ (de 1 a 3). */
  code: z.string().min(1, 'O trecho de código é obrigatório.'),
  /** Resposta de cada lacuna, na ordem em que aparecem no código. */
  answers: z.array(z.string().trim().min(1, 'A resposta não pode ficar vazia.')),
  /** Blocos errados, embaralhados junto com as respostas. */
  distractors: z.array(z.string().trim().min(1, 'O distrator não pode ficar vazio.')).min(1, 'Inclua ao menos um bloco errado.'),
  tutorial: z.boolean().optional(),
  pool: z.string().optional(),
  draw: z.number().int().min(1, 'Sorteie ao menos uma.').optional()
}).superRefine((content, ctx) => {
  const blanks = countBlanks(content.code)
  if (blanks < 1 || blanks > 3) {
    ctx.addIssue({ code: 'custom', path: ['code'], message: 'Marque de 1 a 3 lacunas com ___ no código.' })
  } else if (blanks !== content.answers.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['answers'],
      message: `O código tem ${blanks} lacuna(s), mas há ${content.answers.length} resposta(s).`
    })
  }
  // Mesma regra do `code` da `option`: linha longa obriga a arrastar o bloco
  // para o lado no celular. Conta a linha com a resposta já encaixada.
  const filled = content.answers.reduce((code, answer) => code.replace(CODE_BLANK_MARKER, answer), content.code)
  for (const [index, line] of filled.split('\n').entries()) {
    if (line.length > 30) {
      ctx.addIssue({
        code: 'custom',
        path: ['code'],
        message: `A linha ${index + 1} passa de 30 caracteres com a resposta encaixada; quebre-a para caber no celular.`
      })
      break
    }
  }
})

export type TheoryContentForm = z.infer<typeof theoryContentSchema>
export type OptionContentForm = z.infer<typeof optionContentSchema>
export type CodeBlankContentForm = z.infer<typeof codeBlankContentSchema>

/** Tipos com formulário dedicado. Qualquer outro cai no editor de JSON cru. */
export const TYPED_ACTIVITY_TYPES = ['theory', 'option', 'code_blank'] as const

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

export function emptyCodeBlankContent (): CodeBlankContentForm {
  return {
    question: '',
    highlight: [],
    codeLanguage: 'JavaScript',
    code: '',
    answers: [''],
    distractors: ['', '']
  }
}
