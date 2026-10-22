/**
 * Réplica da regra de destaque do app, usada para pré-visualizar o efeito de
 * cada termo de `highlight` antes de salvar.
 *
 * O padrão é copiado de `app/src/components/themed/ThemedHighlighter.tsx` e
 * precisa continuar idêntico a ele — se divergir, a prévia mente. O casamento é
 * **case-insensitive** (o `highlight-words-core`, por baixo do
 * `@sanar/react-native-highlight-text`, usa `caseSensitive: false` por padrão).
 *
 * A armadilha que sobra, e que esta prévia existe para expor: **o app injeta o
 * termo na expressão sem escapar.** Um termo com metacaractere de regex não é
 * tratado como texto literal — na melhor das hipóteses casa outra coisa, na pior
 * a expressão fica inválida. Por isso a prévia monta a regex do mesmo jeito e
 * sinaliza quando ela não compila.
 */

/**
 * Caracteres que contam como "letra" ao decidir onde um destaque começa e
 * termina — o mesmo conjunto do app.
 *
 * Substitui o `\b` do JavaScript, que é ASCII-only e por isso tratava letra
 * acentuada como fronteira: `\bp\b` casava o "p" de "página". Escapes `\u`
 * explícitos, e não `\p{L}`, porque a lib do app monta a `RegExp` sem a flag
 * `u`.
 */
const LETTER = 'A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF0-9_'

/** Um trecho do texto, marcado ou não. */
export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/** Um termo escrito como `<a>` ou `</a>` — ver `patternFor`. */
const TAG_TERM = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)>$/

/**
 * O padrão de um termo, como string — exatamente o que o app monta.
 *
 * Há duas formas:
 *
 * - **`<tag>`** — destaca o *nome* da tag, e só dentro dos colchetes: casa em
 *   `<a>` e `</a>`, pintando apenas o `a`. É o que permite destacar a tag `<a>`
 *   sem destacar o artigo "a" de "o que **a** pessoa vê", coisa impossível com
 *   o termo `a` solto.
 * - **qualquer outro termo** — palavra inteira, em qualquer lugar do texto.
 *
 * Os dois lookbehind separados (`<` e `</`) evitam depender de lookbehind de
 * tamanho variável, que é suportado por menos motores.
 */
function patternFor (term: string): string {
  const tag = term.match(TAG_TERM)
  if (tag) {
    const name = tag[1]
    return `(?<=<)${name}(?=>)|(?<=</)${name}(?=>)`
  }

  return `(?<![${LETTER}])${term}(?![${LETTER}])`
}

/**
 * Monta a expressão exatamente como o app monta — sem escapar o termo.
 * Devolve `null` quando o resultado não é uma regex válida.
 */
function buildPattern (term: string): RegExp | null {
  try {
    return new RegExp(patternFor(term), 'gi')
  } catch {
    return null
  }
}

/** Quantas vezes o termo casaria no texto, pela mesma regra que o app aplica. */
export function countHighlightMatches (text: string, term: string): number {
  const trimmed = term.trim()
  if (trimmed.length === 0) {
    return 0
  }

  const pattern = buildPattern(trimmed)
  if (!pattern) {
    return 0
  }

  return text.match(pattern)?.length ?? 0
}

/**
 * Divide o texto em trechos marcados e não marcados, para renderizar a prévia.
 *
 * Os termos são combinados numa expressão só, então trechos sobrepostos são
 * resolvidos pela primeira alternativa que casar — o mesmo que aconteceria no
 * app, que também passa todos os padrões de uma vez.
 */
export function splitHighlighted (text: string, terms: string[]): HighlightSegment[] {
  const patterns = terms
    .map((term) => term.trim())
    .filter((term) => term.length > 0 && buildPattern(term) !== null)
    .map(patternFor)

  if (patterns.length === 0 || text.length === 0) {
    return [{ text, highlighted: false }]
  }

  let combined: RegExp
  try {
    combined = new RegExp(patterns.join('|'), 'gi')
  } catch {
    return [{ text, highlighted: false }]
  }

  const segments: HighlightSegment[] = []
  let cursor = 0

  for (const match of text.matchAll(combined)) {
    const start = match.index
    // Uma alternativa que casa string vazia entraria em laço infinito no
    // `matchAll`; ignorar é mais seguro do que confiar no termo recebido.
    if (start === undefined || match[0].length === 0) {
      continue
    }
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlighted: false })
    }
    segments.push({ text: match[0], highlighted: true })
    cursor = start + match[0].length
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false })
  }

  return segments
}

export interface HighlightReport {
  term: string;
  matches: number;
  /** O termo não casa nada no texto atual — normalmente erro de digitação. */
  neverMatches: boolean;
  /** Termo curto casando demais — sinal de artigo/preposição no array. */
  suspicious: boolean;
  /** O termo não forma uma expressão válida: no app, o destaque quebraria. */
  invalidPattern: boolean;
}

/**
 * Contagem a partir da qual um termo **curto** vira suspeita de artigo ou
 * preposição. O limite só se aplica a termos curtos de propósito: uma
 * palavra-chave legítima como `HTML` aparecer quatro vezes numa atividade de
 * quatro parágrafos é o uso normal, não um defeito — alarmar nesse caso só
 * ensinaria a ignorar o aviso.
 */
const SUSPICIOUS_MATCH_THRESHOLD = 4
const SHORT_TERM_LENGTH = 3

/**
 * Avalia cada termo de `highlight` contra a prosa da atividade.
 *
 * `paragraphs` é o texto visível ao aluno — nunca o bloco de código, que tem
 * destaque de sintaxe próprio e não é afetado por este array.
 */
export function analyseHighlight (paragraphs: string[], terms: string[]): HighlightReport[] {
  const text = paragraphs.filter(Boolean).join('\n\n')

  return terms.map((term) => {
    const trimmed = term.trim()
    const invalidPattern = trimmed.length > 0 && buildPattern(trimmed) === null
    const matches = invalidPattern ? 0 : countHighlightMatches(text, trimmed)

    // Um termo `<tag>` é escopado aos colchetes por construção: não tem como
    // ser um artigo solto, então fica fora da heurística de termo curto (`<a>`
    // tem 3 caracteres e cairia nela sem esta exceção).
    const isTag = TAG_TERM.test(trimmed)

    return {
      term,
      matches,
      invalidPattern,
      neverMatches: !invalidPattern && matches === 0,
      suspicious:
        !isTag && trimmed.length <= SHORT_TERM_LENGTH && matches >= SUSPICIOUS_MATCH_THRESHOLD
    }
  })
}
