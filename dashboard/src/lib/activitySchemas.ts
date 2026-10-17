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
 * Os schemas espelham os `*ActivityContent` (theory, option, code_blank,
 * fill_blank, reorder, matching) de
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
  fixedOrder: z.boolean().optional(),
  /** Mostra cada alternativa como código ("ache o erro"). */
  optionsAsCode: z.boolean().optional()
}).refine(
  (content) => content.correctOption <= content.options.length,
  { message: 'A alternativa correta precisa apontar para uma das opções.', path: ['correctOption'] }
).superRefine((content, ctx) => {
  // Mesma regra do `code`: linha longa obriga a arrastar o bloco no celular.
  // Só vale com `optionsAsCode`; alternativa de texto quebra de linha sozinha.
  // Sem `.trim()` nas alternativas: ele apagaria a indentação do código.
  if (!content.optionsAsCode) return
  for (const [index, option] of content.options.entries()) {
    if (option.split('\n').some((line) => line.length > 30)) {
      ctx.addIssue({
        code: 'custom',
        path: ['options', index],
        message: 'Alguma linha passa de 30 caracteres; quebre-a para caber no celular.'
      })
    }
  }
})

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

/** Mesmo limite do `code`: linha mais longa obriga a arrastar no celular. */
const MAX_CODE_LINE = 30

/**
 * Resposta do `fill_blank`: só letras, números, hífen e sublinhado, até 20
 * caracteres. É o que dá para digitar no celular sem caçar símbolo no teclado
 * — respostas com `<`, `{` ou `;` ficam para o `code_blank`, por blocos.
 */
export const FILL_BLANK_ANSWER = /^[\p{L}\p{N}_-]{1,20}$/u

export const fillBlankContentSchema = z.object({
  question: z.string().min(1, 'A instrução é obrigatória.'),
  highlight: z.array(z.string().min(1)),
  codeLanguage: codeLanguageSchema,
  /** Trecho com exatamente uma lacuna ___. */
  code: z.string().min(1, 'O trecho de código é obrigatório.'),
  /** Respostas aceitas; a primeira é a principal. */
  answers: z.array(
    z.string().trim().regex(FILL_BLANK_ANSWER, 'Use só letras, números e hífen, até 20 caracteres — nada de <, { ou ;.')
  ).min(1, 'Informe a resposta.').max(3, 'Aceite no máximo 3 respostas.'),
  /** Aceita qualquer combinação de maiúsculas e minúsculas (HTML e CSS). */
  ignoreCase: z.boolean().optional(),
  tutorial: z.boolean().optional(),
  pool: z.string().optional(),
  draw: z.number().int().min(1, 'Sorteie ao menos uma.').optional()
}).superRefine((content, ctx) => {
  if (countBlanks(content.code) !== 1) {
    ctx.addIssue({ code: 'custom', path: ['code'], message: 'Marque exatamente uma lacuna com ___ no código.' })
    return
  }
  // Conta a linha com a resposta mais longa encaixada.
  const longest = content.answers.reduce((a, b) => (b.length > a.length ? b : a), '')
  const filled = content.code.replace(CODE_BLANK_MARKER, longest)
  for (const [index, line] of filled.split('\n').entries()) {
    if (line.length > MAX_CODE_LINE) {
      ctx.addIssue({ code: 'custom', path: ['code'], message: `A linha ${index + 1} passa de ${MAX_CODE_LINE} caracteres com a resposta encaixada; quebre-a para caber no celular.` })
      break
    }
  }
  const seen = new Set<string>()
  for (const [index, answer] of content.answers.entries()) {
    const key = content.ignoreCase ? answer.toLowerCase() : answer
    if (seen.has(key)) {
      ctx.addIssue({ code: 'custom', path: ['answers', index], message: 'Resposta repetida.' })
    }
    seen.add(key)
  }
})

export const reorderContentSchema = z.object({
  question: z.string().min(1, 'A instrução é obrigatória.'),
  highlight: z.array(z.string().min(1)),
  codeLanguage: codeLanguageSchema,
  /**
   * Linhas na ordem correta, com a indentação do código montado. Sem `.trim()`
   * aqui: ele transforma o valor e apagaria a indentação ao salvar.
   */
  lines: z.array(z.string().refine((line) => line.trim().length > 0, 'A linha não pode ficar vazia.'))
    .min(3, 'Use ao menos 3 linhas.')
    .max(6, 'Use no máximo 6 linhas.'),
  /** Linhas que não entram no código, embaralhadas junto. Sem `.trim()` pelo mesmo motivo. */
  distractors: z.array(z.string().refine((line) => line.trim().length > 0, 'O distrator não pode ficar vazio.')).max(2, 'Use no máximo 2 distratores.').optional(),
  tutorial: z.boolean().optional(),
  pool: z.string().optional(),
  draw: z.number().int().min(1, 'Sorteie ao menos uma.').optional()
}).superRefine((content, ctx) => {
  for (const [index, line] of content.lines.entries()) {
    if (line.length > MAX_CODE_LINE) {
      ctx.addIssue({ code: 'custom', path: ['lines', index], message: `Passa de ${MAX_CODE_LINE} caracteres; quebre a linha para caber no celular.` })
    }
  }
  // Um distrator igual a uma linha da resposta seria indistinguível dela.
  const answer = new Set(content.lines.map((line) => line.trim()))
  for (const [index, distractor] of (content.distractors ?? []).entries()) {
    // O distrator também pode ir para a área de resposta, então vale o mesmo limite.
    if (distractor.length > MAX_CODE_LINE) {
      ctx.addIssue({ code: 'custom', path: ['distractors', index], message: `Passa de ${MAX_CODE_LINE} caracteres; quebre a linha para caber no celular.` })
    }
    if (answer.has(distractor.trim())) {
      ctx.addIssue({ code: 'custom', path: ['distractors', index], message: 'O distrator é igual a uma linha da resposta.' })
    }
  }
})

export const matchingContentSchema = z.object({
  question: z.string().min(1, 'A instrução é obrigatória.'),
  highlight: z.array(z.string().min(1)),
  pairs: z.array(z.object({
    left: z.string().trim().min(1, 'O item da esquerda não pode ficar vazio.').max(20, 'Use no máximo 20 caracteres.'),
    right: z.string().trim().min(1, 'O item da direita não pode ficar vazio.').max(40, 'Use no máximo 40 caracteres.')
  })).min(3, 'Use ao menos 3 pares.').max(4, 'Use no máximo 4 pares.'),
  /** Coluna da esquerda em monoespaçado. */
  leftAsCode: z.boolean().optional(),
  tutorial: z.boolean().optional(),
  pool: z.string().optional(),
  draw: z.number().int().min(1, 'Sorteie ao menos uma.').optional()
}).superRefine((content, ctx) => {
  // Item repetido num lado deixaria dois pares indistinguíveis.
  for (const side of ['left', 'right'] as const) {
    const seen = new Set<string>()
    for (const [index, pair] of content.pairs.entries()) {
      const value = pair[side].trim()
      if (seen.has(value)) {
        ctx.addIssue({ code: 'custom', path: ['pairs', index, side], message: 'Item repetido nesta coluna.' })
      }
      seen.add(value)
    }
  }
})

export type TheoryContentForm = z.infer<typeof theoryContentSchema>
export type OptionContentForm = z.infer<typeof optionContentSchema>
export type CodeBlankContentForm = z.infer<typeof codeBlankContentSchema>
export type FillBlankContentForm = z.infer<typeof fillBlankContentSchema>
export type ReorderContentForm = z.infer<typeof reorderContentSchema>
export type MatchingContentForm = z.infer<typeof matchingContentSchema>

/** Tipos com formulário dedicado. Qualquer outro cai no editor de JSON cru. */
export const TYPED_ACTIVITY_TYPES = ['theory', 'option', 'code_blank', 'fill_blank', 'reorder', 'matching'] as const

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

export function emptyFillBlankContent (): FillBlankContentForm {
  return {
    question: '',
    highlight: [],
    codeLanguage: 'JavaScript',
    code: '',
    answers: ['']
  }
}

export function emptyReorderContent (): ReorderContentForm {
  return {
    question: '',
    highlight: [],
    codeLanguage: 'HTML',
    lines: ['', '', '']
  }
}

export function emptyMatchingContent (): MatchingContentForm {
  return {
    question: '',
    highlight: [],
    pairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }]
  }
}
