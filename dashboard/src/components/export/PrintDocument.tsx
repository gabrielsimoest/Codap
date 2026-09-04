import type { ExportActivity, ExportDocument } from '@/lib/exportDocument'

/**
 * View de impressão — a origem do PDF.
 *
 * Fica escondida na tela (`hidden print:block`) e só aparece no papel, onde a
 * folha `@media print` de `index.css` apaga o resto da interface. Parte do
 * mesmo `ExportDocument` que gera o Markdown, então os dois formatos nunca
 * divergem em conteúdo.
 */
export function PrintDocument ({ document }: { document: ExportDocument }) {
  return (
    <article className="hidden print:block print-surface">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          {document.areaName} — {document.scopeLabel}
        </h1>
        <p className="mt-1 text-sm">
          Idioma: {document.localeLabel} · Exportado em{' '}
          {document.generatedAt.toLocaleString('pt-BR')}
        </p>
        <p className="text-sm">
          {document.moduleCount} módulo(s) · {document.lessonCount} lição(ões) ·{' '}
          {document.activityCount} atividade(s)
        </p>
      </header>

      {document.modules.map((module, modulePosition) => (
        <section
          key={module.index}
          className={modulePosition > 0 ? 'print-page-break' : undefined}
        >
          <h2 className="mt-6 border-b pb-1 text-xl font-semibold">
            {module.title}
            {module.subtitle && ` — ${module.subtitle}`}
          </h2>

          {module.lessons.map((lesson) => (
            <section key={lesson.index} className="mt-4">
              <h3 className="text-lg font-semibold">
                Lição {lesson.index + 1} — {lesson.title}
              </h3>

              {lesson.activities.length === 0 && (
                <p className="text-sm italic">Sem atividades.</p>
              )}

              {lesson.activities.map((activity) => (
                <PrintActivity key={activity.index} activity={activity} />
              ))}
            </section>
          ))}
        </section>
      ))}
    </article>
  )
}

function PrintActivity ({ activity }: { activity: ExportActivity }) {
  return (
    <div className="print-block mt-3 pl-2">
      <h4 className="text-sm font-semibold">
        Atividade {activity.index + 1} · {activity.type}
      </h4>

      {activity.question && <p className="mt-1 font-medium">{activity.question}</p>}

      {activity.paragraphs.map((paragraph, position) => (
        <p key={position} className="mt-1 text-sm leading-relaxed">{paragraph}</p>
      ))}

      {activity.options.length > 0 && (
        <ol className="mt-1 ml-5 list-decimal text-sm">
          {activity.options.map((option, position) => (
            <li key={position} className={option.correct ? 'font-semibold' : undefined}>
              {option.text}{option.correct && ' (correta)'}
            </li>
          ))}
        </ol>
      )}

      {activity.highlight.length > 0 && (
        <p className="mt-1 text-xs">
          <em>Termos destacados:</em> {activity.highlight.join(', ')}
        </p>
      )}

      {activity.codeBlocks.map((block, position) => (
        <pre
          key={position}
          className="print-surface mt-2 overflow-x-auto whitespace-pre-wrap border p-2 text-xs"
        >
          <code>{block.code}</code>
        </pre>
      ))}

      {activity.rawContent && (
        <pre className="print-surface mt-2 overflow-x-auto whitespace-pre-wrap border p-2 text-xs">
          <code>{activity.rawContent}</code>
        </pre>
      )}

      {activity.notes.map((note) => (
        <p key={note} className="mt-1 text-xs italic">{note}</p>
      ))}
    </div>
  )
}
