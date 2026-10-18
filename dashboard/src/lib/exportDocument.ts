import type {
  AdminLessonResponse,
  CodeBlankActivityContent,
  CodePlaygroundActivityContent,
  CodeEditorActivityContent,
  ContentModule,
  FillBlankActivityContent,
  LocaleCode,
  MatchingActivityContent,
  OptionActivityContent,
  ReorderActivityContent,
  TheoryActivityContent
} from '@/types/api'
import { LOCALE_LABELS } from '@/types/api'
import { isTypedActivity } from './activitySchemas'

/**
 * Modelo intermediário da exportação.
 *
 * Existe para que Markdown e a view de impressão (de onde sai o PDF) partam da
 * mesma travessia e dos mesmos rótulos. Sem ele, os dois formatos divergiriam
 * na primeira vez que alguém ajustasse um só — e o conteúdo que vai para um
 * professor deixaria de bater com o que vai para uma IA.
 */

export interface ExportCodeBlock {
  language: string;
  code: string;
}

export interface ExportOption {
  text: string;
  correct: boolean;
}

export interface ExportActivity {
  index: number;
  type: string;
  /** Prosa visível ao aluno, na ordem em que aparece na tela. */
  paragraphs: string[];
  question?: string;
  options: ExportOption[];
  highlight: string[];
  codeBlocks: ExportCodeBlock[];
  /** Observações sobre a atividade (ex.: sem WebView, é tutorial). */
  notes: string[];
  /** Preenchido só quando o tipo não tem formatação dedicada. */
  rawContent?: string;
}

export interface ExportLesson {
  index: number;
  title: string;
  activities: ExportActivity[];
}

export interface ExportModule {
  index: number;
  title: string;
  subtitle: string | null;
  lessons: ExportLesson[];
}

export interface ExportDocument {
  areaName: string;
  locale: LocaleCode;
  localeLabel: string;
  scopeLabel: string;
  generatedAt: Date;
  moduleCount: number;
  lessonCount: number;
  activityCount: number;
  modules: ExportModule[];
}

const MISSING_TRANSLATION = '(sem tradução neste idioma)'

function fenceLanguage (codeLanguage: string): string {
  switch (codeLanguage) {
    case 'HTML': return 'html'
    case 'CSS': return 'css'
    case 'JavaScript': return 'javascript'
    case 'TypeScript': return 'typescript'
    default: return ''
  }
}

function buildTheory (content: TheoryActivityContent): Partial<ExportActivity> {
  const codeBlocks: ExportCodeBlock[] = []
  if (content.code) {
    codeBlocks.push({ language: fenceLanguage(content.codeLanguage), code: content.code })
  }
  for (const extra of content.additionalCode ?? []) {
    codeBlocks.push({ language: fenceLanguage(extra.codeLanguage), code: extra.code })
  }

  const notes: string[] = []
  if (content.onlyCode) {
    notes.push('Sem pré-visualização web (onlyCode)')
  }
  if (content.tutorial) {
    notes.push('Marcada como tutorial')
  }

  return {
    paragraphs: [
      content.firstParagraph,
      content.secondParagraph,
      content.thirdParagraph,
      content.endParagraph
    ].filter((paragraph): paragraph is string => Boolean(paragraph)),
    highlight: content.highlight ?? [],
    codeBlocks,
    notes
  }
}

function buildOption (content: OptionActivityContent): Partial<ExportActivity> {
  const notes: string[] = []
  if (content.optionsAsCode) {
    notes.push('Alternativas mostradas como código')
  }
  if (content.tutorial) {
    notes.push('Marcada como tutorial')
  }

  return {
    question: content.question,
    paragraphs: content.aditionalParagraph ? [content.aditionalParagraph] : [],
    // `correctOption` é 1-based no contrato — a primeira opção é `1`, não `0`.
    options: (content.options ?? []).map((text, position) => ({
      text,
      correct: position + 1 === content.correctOption
    })),
    highlight: content.highlight ?? [],
    // No app o trecho aparece entre o enunciado e as alternativas; aqui vai
    // junto dos demais blocos de código, que é onde os dois formatos já os põem.
    codeBlocks: content.code
      ? [{ language: fenceLanguage(content.codeLanguage ?? 'JavaScript'), code: content.code }]
      : [],
    notes
  }
}

function buildCodeBlank (content: CodeBlankActivityContent): Partial<ExportActivity> {
  const notes: string[] = ['Completar código: cada ___ é uma lacuna, preenchida tocando nos blocos']
  if (content.tutorial) {
    notes.push('Marcada como tutorial')
  }

  return {
    question: content.question,
    paragraphs: [],
    // Respostas e blocos errados viram "alternativas" — o que um revisor
    // precisa ver é quais blocos o aluno recebe e quais são os certos.
    options: [
      ...(content.answers ?? []).map((text, position) => ({ text: `Lacuna ${position + 1}: ${text}`, correct: true })),
      ...(content.distractors ?? []).map((text) => ({ text, correct: false }))
    ],
    highlight: content.highlight ?? [],
    codeBlocks: content.code
      ? [{ language: fenceLanguage(content.codeLanguage ?? 'JavaScript'), code: content.code }]
      : [],
    notes
  }
}

function buildFillBlank (content: FillBlankActivityContent): Partial<ExportActivity> {
  const notes: string[] = ['Digitar a resposta: o aluno escreve a palavra que falta no lugar de ___']
  notes.push(content.ignoreCase ? 'Aceita maiúsculas e minúsculas' : 'Maiúsculas e minúsculas contam')
  if (content.tutorial) {
    notes.push('Marcada como tutorial')
  }

  return {
    question: content.question,
    paragraphs: [],
    options: (content.answers ?? []).map((text) => ({ text: `Resposta aceita: ${text}`, correct: true })),
    highlight: content.highlight ?? [],
    codeBlocks: content.code
      ? [{ language: fenceLanguage(content.codeLanguage ?? 'JavaScript'), code: content.code }]
      : [],
    notes
  }
}

function buildCodePlayground (content: CodePlaygroundActivityContent): Partial<ExportActivity> {
  const notes: string[] = [
    'Playground: o aluno completa as lacunas tocando em blocos e executa o código; a correção é pelo comportamento (checkScript)',
    `Solução de referência: ${(content.solution ?? []).join(' | ')}`
  ]
  if (content.tutorial) {
    notes.push('Marcada como tutorial')
  }
  const support = (['html', 'css', 'js'] as const)
    .filter((key) => content[key])
    .map((key) => ({ language: fenceLanguage(key === 'js' ? 'JavaScript' : key.toUpperCase()), code: content[key] as string }))

  return {
    question: content.question,
    paragraphs: [],
    options: (content.blocks ?? []).map((text) => ({ text: `Bloco: ${text}`, correct: (content.solution ?? []).includes(text) })),
    highlight: content.highlight ?? [],
    codeBlocks: [
      ...(content.code ? [{ language: fenceLanguage(content.codeLanguage ?? 'JavaScript'), code: content.code }] : []),
      ...support,
      { language: 'js', code: `// checkScript\n${content.checkScript ?? ''}` }
    ],
    notes
  }
}

function buildCodeEditor (content: CodeEditorActivityContent): Partial<ExportActivity> {
  const notes: string[] = [
    'Desafio do módulo: o aluno digita o código e executa; a correção é pelo comportamento (checkScript), requisito por requisito',
    ...(content.hints ?? []).map((hint, index) => `Dica ${index + 1}: ${hint}`)
  ]
  const support = (['html', 'css', 'js'] as const)
    .filter((key) => content[key])
    .map((key) => ({ language: fenceLanguage(key === 'js' ? 'JavaScript' : key.toUpperCase()), code: content[key] as string }))
  const language = fenceLanguage(content.codeLanguage ?? 'JavaScript')

  return {
    question: content.question,
    paragraphs: [],
    options: [],
    highlight: content.highlight ?? [],
    codeBlocks: [
      ...(content.starterCode ? [{ language, code: `${content.codeLanguage === 'HTML' ? '<!-- código inicial -->' : '/* código inicial */'}\n${content.starterCode}` }] : []),
      ...support,
      { language, code: `${content.codeLanguage === 'HTML' ? '<!-- solução -->' : '/* solução */'}\n${content.solution ?? ''}` },
      { language: 'js', code: `// checkScript\n${content.checkScript ?? ''}` }
    ],
    notes
  }
}

function buildReorder (content: ReorderActivityContent): Partial<ExportActivity> {
  const notes: string[] = ['Montar o código: o aluno toca nas linhas, embaralhadas, na ordem certa']
  if (content.tutorial) {
    notes.push('Marcada como tutorial')
  }

  return {
    question: content.question,
    paragraphs: [],
    // A resposta é o próprio código montado; os distratores, as linhas que
    // aparecem no banco e não entram nele.
    options: (content.distractors ?? []).map((text) => ({ text: `Linha distratora: ${text}`, correct: false })),
    highlight: content.highlight ?? [],
    codeBlocks: [{ language: fenceLanguage(content.codeLanguage ?? 'JavaScript'), code: (content.lines ?? []).join('\n') }],
    notes
  }
}

function buildMatching (content: MatchingActivityContent): Partial<ExportActivity> {
  const notes: string[] = ['Ligar pares: as duas colunas aparecem embaralhadas']
  if (content.leftAsCode) {
    notes.push('Coluna da esquerda mostrada como código')
  }
  if (content.tutorial) {
    notes.push('Marcada como tutorial')
  }

  return {
    question: content.question,
    paragraphs: [],
    options: (content.pairs ?? []).map((pair) => ({ text: `${pair.left} → ${pair.right}`, correct: true })),
    highlight: content.highlight ?? [],
    codeBlocks: [],
    notes
  }
}

function buildActivity (
  index: number,
  type: string,
  content: unknown
): ExportActivity {
  const base: ExportActivity = {
    index,
    type,
    paragraphs: [],
    options: [],
    highlight: [],
    codeBlocks: [],
    notes: []
  }

  if (content === undefined || content === null) {
    return { ...base, notes: [MISSING_TRANSLATION] }
  }

  if (type === 'theory') {
    return { ...base, ...buildTheory(content as TheoryActivityContent) }
  }

  if (type === 'option') {
    return { ...base, ...buildOption(content as OptionActivityContent) }
  }

  if (type === 'code_blank') {
    return { ...base, ...buildCodeBlank(content as CodeBlankActivityContent) }
  }

  if (type === 'fill_blank') {
    return { ...base, ...buildFillBlank(content as FillBlankActivityContent) }
  }

  if (type === 'code_playground') {
    return { ...base, ...buildCodePlayground(content as CodePlaygroundActivityContent) }
  }

  if (type === 'code_editor') {
    return { ...base, ...buildCodeEditor(content as CodeEditorActivityContent) }
  }

  if (type === 'reorder') {
    return { ...base, ...buildReorder(content as ReorderActivityContent) }
  }

  if (type === 'matching') {
    return { ...base, ...buildMatching(content as MatchingActivityContent) }
  }

  // Tipo sem formatação dedicada: o conteúdo cru vai junto, para o documento
  // continuar completo. É a mesma postura da API — transportar fielmente o que
  // não se sabe interpretar, em vez de omitir.
  return { ...base, rawContent: JSON.stringify(content, null, 2) }
}

function buildLesson (lesson: AdminLessonResponse, locale: LocaleCode): ExportLesson {
  return {
    index: lesson.index,
    title: lesson.translations[locale]?.name ?? MISSING_TRANSLATION,
    activities: lesson.activities.map((activity) =>
      buildActivity(activity.index, activity.type, activity.content[locale])
    )
  }
}

export interface ExportScope {
  areaName: string;
  locale: LocaleCode;
  modules: ContentModule[];
  /** Recorte escolhido, só para o cabeçalho do documento. */
  scopeLabel: string;
}

export function buildExportDocument (scope: ExportScope): ExportDocument {
  const modules: ExportModule[] = scope.modules.map((module) => ({
    index: module.index,
    title: module.translations[scope.locale]?.name ?? MISSING_TRANSLATION,
    subtitle: module.translations[scope.locale]?.subtitle ?? null,
    lessons: module.lessons.map((lesson) => buildLesson(lesson, scope.locale))
  }))

  const lessons = modules.flatMap((module) => module.lessons)

  return {
    areaName: scope.areaName,
    locale: scope.locale,
    localeLabel: LOCALE_LABELS[scope.locale],
    scopeLabel: scope.scopeLabel,
    generatedAt: new Date(),
    moduleCount: modules.length,
    lessonCount: lessons.length,
    activityCount: lessons.reduce((total, lesson) => total + lesson.activities.length, 0),
    modules
  }
}

export { MISSING_TRANSLATION, fenceLanguage, isTypedActivity }
