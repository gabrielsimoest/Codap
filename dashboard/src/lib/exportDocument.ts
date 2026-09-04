import type {
  AdminLessonResponse,
  ContentModule,
  LocaleCode,
  OptionActivityContent,
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
