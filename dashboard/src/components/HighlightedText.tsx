import { splitHighlighted } from '@/lib/highlight'

/**
 * Renderiza um texto com os termos de `highlight` marcados, do mesmo jeito que
 * o app faria.
 *
 * A cor é a do app (`#637aff`, o `highlightStyle` de `ThemedHighlighter`), que
 * aqui é também o token `--primary` — usar o token mantém a prévia coerente se
 * um dia houver tema claro, sem deixar de ser a cor real.
 */
export function HighlightedText ({
  text,
  highlight,
  className
}: {
  text: string;
  highlight: string[];
  className?: string;
}) {
  const segments = splitHighlighted(text, highlight)

  return (
    <p className={className}>
      {segments.map((segment, position) =>
        segment.highlighted
          ? (
            <span key={position} className="font-medium text-primary">
              {segment.text}
            </span>
            )
          : segment.text
      )}
    </p>
  )
}
