import type { ExportActivity, ExportDocument, ExportLesson, ExportModule } from './exportDocument'

/**
 * Renderiza o documento de exportação em Markdown.
 *
 * O formato serve a dois leitores ao mesmo tempo: um professor lendo o
 * currículo, e um modelo de linguagem a quem se pede uma revisão. Por isso a
 * hierarquia usa títulos de verdade (e não negrito), e todo trecho de código sai
 * numa cerca com a linguagem declarada — é o que separa, sem ambiguidade, a
 * prosa da aula do código de exemplo.
 */

function renderActivity (activity: ExportActivity): string[] {
  const lines: string[] = [`#### Atividade ${activity.index + 1} · \`${activity.type}\``, '']

  if (activity.question) {
    lines.push(`**Pergunta:** ${activity.question}`, '')
  }

  for (const paragraph of activity.paragraphs) {
    lines.push(paragraph, '')
  }

  if (activity.options.length > 0) {
    for (const [position, option] of activity.options.entries()) {
      lines.push(`${position + 1}. ${option.text}${option.correct ? '  ← **correta**' : ''}`)
    }
    lines.push('')
  }

  if (activity.highlight.length > 0) {
    lines.push(`*Termos destacados:* ${activity.highlight.map((term) => `\`${term}\``).join(', ')}`, '')
  }

  for (const block of activity.codeBlocks) {
    lines.push('```' + block.language, block.code, '```', '')
  }

  if (activity.rawContent) {
    lines.push('> Tipo sem formatação dedicada neste exportador — conteúdo bruto:', '')
    lines.push('```json', activity.rawContent, '```', '')
  }

  for (const note of activity.notes) {
    lines.push(`> ${note}`, '')
  }

  return lines
}

function renderLesson (lesson: ExportLesson): string[] {
  const lines: string[] = [`### Lição ${lesson.index + 1} — ${lesson.title}`, '']

  if (lesson.activities.length === 0) {
    lines.push('*Sem atividades.*', '')
  }

  for (const activity of lesson.activities) {
    lines.push(...renderActivity(activity))
  }

  return lines
}

function renderModule (module: ExportModule): string[] {
  const heading = module.subtitle
    ? `## ${module.title} — ${module.subtitle}`
    : `## ${module.title}`

  const lines: string[] = ['---', '', heading, '']

  if (module.lessons.length === 0) {
    lines.push('*Sem lições.*', '')
  }

  for (const lesson of module.lessons) {
    lines.push(...renderLesson(lesson))
  }

  return lines
}

export function renderMarkdown (doc: ExportDocument): string {
  const lines: string[] = [
    `# ${doc.areaName} — ${doc.scopeLabel}`,
    '',
    `> **Idioma:** ${doc.localeLabel}  `,
    `> **Exportado em:** ${doc.generatedAt.toLocaleString('pt-BR')}  `,
    `> **Conteúdo:** ${doc.moduleCount} módulo(s), ${doc.lessonCount} lição(ões), ${doc.activityCount} atividade(s)`,
    ''
  ]

  for (const module of doc.modules) {
    lines.push(...renderModule(module))
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

/** Nome de arquivo estável e ordenável, sem caractere proibido no Windows. */
export function markdownFileName (doc: ExportDocument): string {
  const slug = `${doc.areaName}-${doc.scopeLabel}`
    // NFD separa a letra do acento; `\p{M}` remove só o acento, preservando a
    // letra. Sem esse passo, o filtro seguinte trocaria cada acento por um
    // hífen ("área" viraria "a-rea").
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  const stamp = doc.generatedAt.toISOString().slice(0, 10)
  return `codap-${slug}-${doc.locale}-${stamp}.md`
}

/**
 * Dispara o download no navegador. `URL.revokeObjectURL` precisa acontecer
 * depois do clique, senão o Chrome cancela o download silenciosamente.
 */
export function downloadMarkdown (doc: ExportDocument): void {
  const blob = new Blob([renderMarkdown(doc)], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = markdownFileName(doc)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => { URL.revokeObjectURL(url) }, 0)
}
