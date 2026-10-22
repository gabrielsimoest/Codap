import { useState } from 'react'
import { AlertTriangle, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { analyseHighlight } from '@/lib/highlight'
import { HighlightedText } from '@/components/HighlightedText'

interface HighlightFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  /** Prosa da atividade contra a qual os termos são conferidos. */
  paragraphs: string[];
}

/**
 * Campo de `highlight` com prévia ao vivo.
 *
 * Mostra as duas coisas que importam na hora de escrever: **como o texto vai
 * ficar** (os termos pintados na prosa, como o app renderiza) e **quantas vezes
 * cada termo casa**. O destaque é por palavra inteira e sem diferenciar
 * maiúsculas, então um termo curto e comum pinta todas as ocorrências, não só a
 * pretendida — `"a"` em português destacaria boa parte do texto.
 */
export function HighlightField ({ value, onChange, paragraphs }: HighlightFieldProps) {
  const [draft, setDraft] = useState('')
  const reports = analyseHighlight(paragraphs, value)
  const visibleParagraphs = paragraphs.filter((paragraph) => paragraph.trim().length > 0)

  function addTerm () {
    const term = draft.trim()
    if (term.length === 0 || value.includes(term)) {
      setDraft('')
      return
    }
    onChange([...value, term])
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <Label>Termos destacados</Label>

      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder="Adicione um termo e pressione Enter"
          onChange={(event) => { setDraft(event.target.value) }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTerm()
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={addTerm} title="Adicionar termo">
          <Plus className="size-4" />
        </Button>
      </div>

      {reports.length === 0 && (
        <p className="text-xs text-muted-foreground">Nenhum termo destacado.</p>
      )}

      <ul className="space-y-1">
        {reports.map((report) => (
          <li
            key={report.term}
            className={cn(
              'flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs',
              report.invalidPattern || report.neverMatches || report.suspicious
                ? 'border-destructive/50 bg-destructive/5'
                : 'border-border'
            )}
          >
            <code className="font-mono">{report.term}</code>

            <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
              {(report.invalidPattern || report.neverMatches || report.suspicious) && (
                <AlertTriangle className="size-3 text-destructive" />
              )}
              <span>
                {report.invalidPattern
                  ? 'expressão inválida'
                  : report.neverMatches
                    ? 'não destaca nada'
                    : `${report.matches} ocorrência(s)`}
              </span>
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              title="Remover termo"
              onClick={() => { onChange(value.filter((term) => term !== report.term)) }}
            >
              <X className="size-3" />
            </Button>
          </li>
        ))}
      </ul>

      {/*
        A prévia é o ponto do campo: ver o destaque aplicado é mais direto do
        que deduzi-lo de uma contagem. Aparece só quando já há prosa escrita —
        num formulário em branco seria uma caixa vazia sem função.
      */}
      {visibleParagraphs.length > 0 && (
        <div className="space-y-2 rounded-md border border-border bg-secondary/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Prévia do destaque
          </p>
          {visibleParagraphs.map((paragraph, position) => (
            <HighlightedText
              key={position}
              text={paragraph}
              highlight={value}
              className="text-sm leading-relaxed text-foreground/90"
            />
          ))}
        </div>
      )}

      {reports.some((report) => report.invalidPattern) && (
        <p className="text-xs text-destructive">
          O app injeta o termo na expressão de busca <strong>sem escapar</strong>, então um
          metacaractere de regex (<code>(</code>, <code>[</code>, <code>+</code>, <code>?</code>)
          quebra o destaque. Use o termo sem esses caracteres.
        </p>
      )}
      {reports.some((report) => report.neverMatches) && (
        <p className="text-xs text-destructive">
          Um termo que não casa nada geralmente é erro de digitação — confira a grafia contra a
          prosa acima.
        </p>
      )}
      {reports.some((report) => report.suspicious && !report.neverMatches && !report.invalidPattern) && (
        <p className="text-xs text-destructive">
          Um termo curto com muitas ocorrências costuma ser um artigo ou preposição — o destaque
          pintaria boa parte do texto.
        </p>
      )}
    </div>
  )
}
