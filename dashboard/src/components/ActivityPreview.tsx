import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HighlightedText } from '@/components/HighlightedText'
import { buildExportDocument } from '@/lib/exportDocument'
import { LOCALE_LABELS, LOCALES, type AdminActivityResponse, type LocaleCode } from '@/types/api'

/**
 * Pré-visualização somente leitura do conteúdo de uma atividade, um idioma por
 * aba.
 *
 * Reaproveita `buildExportDocument` — a mesma travessia que gera o Markdown e o
 * PDF — em vez de reinterpretar o `content` aqui. Assim, o que se vê na tela é
 * exatamente o que sai na exportação, e um tipo novo passa a aparecer nos três
 * lugares de uma vez.
 */
export function ActivityPreview ({ activity }: { activity: AdminActivityResponse }) {
  const available = LOCALES.filter((locale) => activity.content[locale] !== undefined)

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem conteúdo em nenhum idioma.
      </p>
    )
  }

  return (
    <Tabs defaultValue={available[0]}>
      <TabsList className="h-8">
        {available.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="text-xs">
            {LOCALE_LABELS[locale]}
          </TabsTrigger>
        ))}
      </TabsList>

      {available.map((locale) => (
        <TabsContent key={locale} value={locale} className="mt-3">
          <LocalePreview activity={activity} locale={locale} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function LocalePreview ({
  activity,
  locale
}: {
  activity: AdminActivityResponse;
  locale: LocaleCode;
}) {
  // Um documento de um módulo/lição/atividade só, para reusar a normalização
  // sem duplicar a leitura do `content`.
  const doc = buildExportDocument({
    areaName: '',
    locale,
    scopeLabel: '',
    modules: [{
      id: 0,
      areaId: 0,
      index: 0,
      translations: {},
      lessons: [{
        id: 0,
        moduleId: 0,
        index: 0,
        translations: {},
        activities: [activity]
      }]
    }]
  })

  const exported = doc.modules[0].lessons[0].activities[0]

  return (
    <div className="space-y-3 text-sm">
      {/*
        A prosa é renderizada com os termos de `highlight` já aplicados, como o
        app faria — é o que permite conferir o efeito sem abrir o formulário.
      */}
      {exported.question && (
        <HighlightedText
          text={exported.question}
          highlight={exported.highlight}
          className="font-medium"
        />
      )}

      {exported.paragraphs.map((paragraph, position) => (
        <HighlightedText
          key={position}
          text={paragraph}
          highlight={exported.highlight}
          className="leading-relaxed text-foreground/90"
        />
      ))}

      {exported.options.length > 0 && (
        <ol className="space-y-1">
          {exported.options.map((option, position) => (
            <li
              key={position}
              className={option.correct ? 'font-medium text-primary' : 'text-foreground/80'}
            >
              {position + 1}. {option.text}
              {option.correct && ' ✓'}
            </li>
          ))}
        </ol>
      )}

      {exported.highlight.length > 0 && (
        <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <span>Destaques:</span>
          {exported.highlight.map((term) => (
            <code key={term} className="rounded bg-secondary px-1 py-0.5 text-[11px]">{term}</code>
          ))}
        </p>
      )}

      {exported.codeBlocks.map((block, position) => (
        <pre
          key={position}
          className="overflow-x-auto rounded-md border border-border bg-secondary/40 p-3 text-xs"
        >
          <code>{block.code}</code>
        </pre>
      ))}

      {exported.rawContent && (
        <pre className="overflow-x-auto rounded-md border border-border bg-secondary/40 p-3 text-xs">
          <code>{exported.rawContent}</code>
        </pre>
      )}

      {exported.notes.length > 0 && (
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {exported.notes.map((note) => <li key={note}>· {note}</li>)}
        </ul>
      )}
    </div>
  )
}
