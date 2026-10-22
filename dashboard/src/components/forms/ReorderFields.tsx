import { useFormContext, useWatch, type Control } from 'react-hook-form'
import { AlertTriangle, ArrowDown, ArrowUp, IndentDecrease, IndentIncrease, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { HighlightField } from './HighlightField'
import { cn } from '@/lib/utils'
import { CODE_LANGUAGES, type ReorderContentForm } from '@/lib/activitySchemas'

/** Limites do contrato (`ReorderActivityContent`): 3 a 6 linhas, 0 a 2 distratores. */
const MIN_LINES = 3
const MAX_LINES = 6
const MAX_DISTRACTORS = 2
/** Largura que cabe no celular sem o aluno arrastar o código para o lado. */
const MAX_LINE_LENGTH = 30
/** Um nível de indentação (dois espaços), igual ao do conteúdo existente. */
const INDENT = '  '

/**
 * Formulário de uma atividade `reorder`, espelhando `ReorderActivityContent`.
 *
 * As linhas são uma lista de strings editada **sem trim**: os espaços à
 * esquerda são a indentação do código montado, e o schema também não os apaga
 * (ver `reorderContentSchema`). Por isso os campos são controlados e a lista é
 * regravada inteira a cada mudança, em vez de `useFieldArray`: reordenar uma
 * lista de strings registradas por nome (`lines.0`, `lines.1`…) com
 * `useFieldArray` não tem o mesmo suporte que para objetos.
 */
export function ReorderFields () {
  const form = useFormContext<ReorderContentForm>()
  const control = form.control as Control<ReorderContentForm>
  const errors = form.formState.errors

  const question = useWatch({ control, name: 'question' })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []
  const codeLanguage = useWatch({ control, name: 'codeLanguage' })
  const lines = useWatch({ control, name: 'lines' }) ?? []
  const distractors = useWatch({ control, name: 'distractors' }) ?? []

  // Depois do primeiro envio, o erro deve sumir assim que o campo é corrigido,
  // como nos campos registrados (que revalidam sozinhos ao digitar).
  const revalidate = form.formState.isSubmitted

  function setLines (next: string[]) {
    form.setValue('lines', next, { shouldDirty: true, shouldValidate: revalidate })
  }

  function setDistractors (next: string[]) {
    form.setValue('distractors', next, { shouldDirty: true, shouldValidate: revalidate })
  }

  function editLine (index: number, value: string) {
    setLines(lines.map((line, i) => (i === index ? value : line)))
  }

  function moveLine (index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= lines.length) return
    const next = [...lines]
    ;[next[index], next[target]] = [next[target], next[index]]
    setLines(next)
  }

  function indentLine (index: number, delta: -1 | 1) {
    const line = lines[index]
    editLine(index, delta === 1 ? INDENT + line : line.startsWith(INDENT) ? line.slice(INDENT.length) : line.replace(/^ /, ''))
  }

  const tooLong = lines.filter((line) => line.length > MAX_LINE_LENGTH).length
  const bank = [...lines, ...distractors].map((chip) => chip.trim()).filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reorder-question">Instrução *</Label>
        <Textarea
          id="reorder-question"
          rows={2}
          placeholder="ex.: Monte um parágrafo dentro do body."
          {...form.register('question')}
        />
        {errors.question && (
          <p className="text-xs text-destructive">{errors.question.message}</p>
        )}
      </div>

      <HighlightField
        value={highlight}
        onChange={(next) => { form.setValue('highlight', next, { shouldDirty: true }) }}
        paragraphs={question ? [question] : []}
      />

      <div className="space-y-3 rounded-md border border-border p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>Linhas na ordem correta *</Label>
            <p className="text-xs text-muted-foreground">
              De {MIN_LINES} a {MAX_LINES} linhas. Os espaços no começo são a indentação do código montado
              (no banco do app a linha aparece sem eles). No máximo {MAX_LINE_LENGTH} caracteres por linha,
              contando a indentação. Use só trechos com uma ordem válida.
            </p>
          </div>
          <Select
            value={codeLanguage ?? 'HTML'}
            onValueChange={(value) => {
              form.setValue('codeLanguage', value as ReorderContentForm['codeLanguage'], { shouldDirty: true })
            }}
          >
            <SelectTrigger className="w-40 shrink-0" aria-label="Linguagem do código"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CODE_LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {lines.map((line, index) => {
          const lineError = errors.lines?.[index]?.message
          const length = line.length
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={`reorder-line-${index}`} className="w-16 shrink-0 text-xs text-muted-foreground">
                  Linha {index + 1}
                </Label>
                <Input
                  id={`reorder-line-${index}`}
                  className="font-mono"
                  spellCheck={false}
                  autoComplete="off"
                  value={line}
                  onChange={(event) => { editLine(index, event.target.value) }}
                />
                <span
                  className={cn(
                    'w-12 shrink-0 text-right font-mono text-xs text-muted-foreground',
                    length > MAX_LINE_LENGTH && 'font-semibold text-destructive'
                  )}
                >
                  {length}/{MAX_LINE_LENGTH}
                </span>
                <div className="flex shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Recuar a linha ${index + 1}`}
                    title="Tirar um nível de indentação"
                    onClick={() => { indentLine(index, -1) }}
                  >
                    <IndentDecrease className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Avançar a linha ${index + 1}`}
                    title="Pôr um nível de indentação"
                    onClick={() => { indentLine(index, 1) }}
                  >
                    <IndentIncrease className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Subir a linha ${index + 1}`}
                    title="Subir"
                    disabled={index === 0}
                    onClick={() => { moveLine(index, -1) }}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Descer a linha ${index + 1}`}
                    title="Descer"
                    disabled={index === lines.length - 1}
                    onClick={() => { moveLine(index, 1) }}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    aria-label={`Remover a linha ${index + 1}`}
                    title="Remover linha"
                    disabled={lines.length <= MIN_LINES}
                    onClick={() => { setLines(lines.filter((_, i) => i !== index)) }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              {lineError && <p className="pl-[4.5rem] text-xs text-destructive">{lineError}</p>}
            </div>
          )
        })}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={lines.length >= MAX_LINES}
            onClick={() => { setLines([...lines, '']) }}
          >
            <Plus className="size-3.5" /> Linha
          </Button>
          <p className="text-xs text-muted-foreground">{lines.length}/{MAX_LINES} linhas</p>
        </div>
        {errors.lines?.message && (
          <p className="text-xs text-destructive">{errors.lines.message}</p>
        )}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Linhas erradas (distratores)</Label>
            <p className="text-xs text-muted-foreground">
              Opcional, de 0 a {MAX_DISTRACTORS}. Aparecem embaralhadas junto com as linhas. Use erros
              plausíveis, não absurdos.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={distractors.length >= MAX_DISTRACTORS}
            onClick={() => { setDistractors([...distractors, '']) }}
          >
            <Plus className="size-3.5" /> Distrator
          </Button>
        </div>
        {distractors.map((distractor, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-2">
              <Input
                aria-label={`Distrator ${index + 1}`}
                className="font-mono"
                spellCheck={false}
                autoComplete="off"
                value={distractor}
                onChange={(event) => {
                  setDistractors(distractors.map((item, i) => (i === index ? event.target.value : item)))
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-destructive"
                title="Remover distrator"
                aria-label={`Remover o distrator ${index + 1}`}
                onClick={() => { setDistractors(distractors.filter((_, i) => i !== index)) }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            {errors.distractors?.[index]?.message && (
              <p className="text-xs text-destructive">{errors.distractors[index]?.message}</p>
            )}
          </div>
        ))}
        {errors.distractors?.message && (
          <p className="text-xs text-destructive">{errors.distractors.message}</p>
        )}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <Label>Prévia do código montado</Label>
        <div
          data-testid="reorder-preview"
          className="overflow-x-auto rounded bg-secondary p-2 font-mono text-xs"
        >
          {lines.map((line, index) => (
            <div key={index} className="flex items-baseline gap-2">
              <span className="w-4 shrink-0 select-none text-right text-muted-foreground">{index + 1}</span>
              {/* A borda tracejada marca a coluna 30: o que passa dela não cabe no celular. */}
              <code className="min-h-4 w-[30ch] shrink-0 whitespace-pre border-r border-dashed border-border">
                {line === '' ? ' ' : line}
              </code>
              <span
                className={cn(
                  'flex items-center gap-1 text-muted-foreground',
                  line.length > MAX_LINE_LENGTH && 'font-semibold text-destructive'
                )}
              >
                {line.length > MAX_LINE_LENGTH && <AlertTriangle className="size-3" />}
                {line.length}
              </span>
            </div>
          ))}
        </div>
        {tooLong > 0 && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="size-3" />
            {tooLong} linha(s) passam de {MAX_LINE_LENGTH} caracteres.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Banco do app (sem indentação): {bank.map((chip) => `[${chip}]`).join(' ') || '—'}
        </p>
      </div>

      <div className="space-y-3 rounded-md border border-border p-3">
        <div>
          <Label>Sorteio</Label>
          <p className="text-xs text-muted-foreground">
            Opcional, igual à múltipla escolha: exercícios com o mesmo pool são sorteados entre si.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <div className="space-y-2">
            <Label htmlFor="reorder-pool" className="text-sm">Pool</Label>
            <Input id="reorder-pool" placeholder="ex.: html-basico" {...form.register('pool')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorder-draw" className="text-sm">Sortear</Label>
            <Input
              id="reorder-draw"
              type="number"
              min={1}
              placeholder="1"
              {...form.register('draw', {
                setValueAs: (value: unknown) => (value === '' || value === undefined || value === null ? undefined : Number(value))
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Switch
          id="reorder-tutorial"
          checked={form.watch('tutorial') ?? false}
          onCheckedChange={(checked) => { form.setValue('tutorial', checked, { shouldDirty: true }) }}
        />
        <div>
          <Label htmlFor="reorder-tutorial" className="text-sm">Tutorial</Label>
          <p className="text-xs text-muted-foreground">Marca a tela como parte do tutorial inicial.</p>
        </div>
      </div>
    </div>
  )
}
