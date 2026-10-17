import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { HighlightField } from './HighlightField'
import type { MatchingContentForm } from '@/lib/activitySchemas'

const MIN_PAIRS = 3
const MAX_PAIRS = 4
const LEFT_MAX = 20
const RIGHT_MAX = 40

/** Contador "n/limite" que fica vermelho quando o texto passa do limite. */
function Counter ({ value, max }: { value: string | undefined; max: number }) {
  const length = (value ?? '').trim().length
  return (
    <span
      className={cn(
        'w-12 shrink-0 text-right text-xs tabular-nums',
        length > max ? 'font-medium text-destructive' : 'text-muted-foreground'
      )}
      aria-live="polite"
    >
      {length}/{max}
    </span>
  )
}

/**
 * Formulário de uma atividade `matching`, espelhando `MatchingActivityContent`.
 *
 * O aluno liga itens de duas colunas embaralhadas, então aqui só se escreve o
 * gabarito: cada linha é um par certo, esquerda e direita lado a lado. O app
 * cuida do embaralhamento. Os limites (20 e 40 caracteres) existem para o
 * celular — a esquerda é uma coluna estreita, a direita quebra em linhas, mas
 * texto demais vira um bloco ilegível.
 */
export function MatchingFields () {
  const form = useFormContext<MatchingContentForm>()
  const control = form.control

  const question = useWatch({ control, name: 'question' })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []
  const pairs = useWatch({ control, name: 'pairs' }) ?? []
  const leftAsCode = useWatch({ control, name: 'leftAsCode' }) ?? false

  const pairFields = useFieldArray({ control, name: 'pairs' })

  const errors = form.formState.errors
  // O erro da lista inteira (3–4 pares) vem em `root` com o zodResolver.
  const pairsError = errors.pairs?.root?.message ?? errors.pairs?.message

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="matching-question">Instrução *</Label>
        <Textarea
          id="matching-question"
          rows={2}
          placeholder="ex.: Ligue cada tag à sua função."
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

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>Pares</Label>
            <p className="text-xs text-muted-foreground">
              De {MIN_PAIRS} a {MAX_PAIRS} pares certos. No app as colunas aparecem embaralhadas,
              sem nenhum par na mesma linha. Itens não podem se repetir na mesma coluna.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1"
            disabled={pairFields.fields.length >= MAX_PAIRS}
            onClick={() => { pairFields.append({ left: '', right: '' }) }}
          >
            <Plus className="size-3.5" /> Par
          </Button>
        </div>

        <div className="grid grid-cols-[1fr_1fr_2rem] gap-x-2 text-xs text-muted-foreground">
          <span>Esquerda (até {LEFT_MAX})</span>
          <span>Direita (até {RIGHT_MAX})</span>
          <span />
        </div>

        {pairFields.fields.map((field, index) => {
          const pairErrors = errors.pairs?.[index]
          return (
            <div key={field.id} className="space-y-1">
              <div className="grid grid-cols-[1fr_1fr_2rem] items-center gap-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor={`matching-left-${index}`} className="sr-only">
                    Item da esquerda do par {index + 1}
                  </Label>
                  <Input
                    id={`matching-left-${index}`}
                    className={cn(leftAsCode && 'font-mono')}
                    aria-invalid={pairErrors?.left ? true : undefined}
                    {...form.register(`pairs.${index}.left`)}
                  />
                  <Counter value={pairs[index]?.left} max={LEFT_MAX} />
                </div>
                <div className="flex items-center gap-1">
                  <Label htmlFor={`matching-right-${index}`} className="sr-only">
                    Item da direita do par {index + 1}
                  </Label>
                  <Input
                    id={`matching-right-${index}`}
                    aria-invalid={pairErrors?.right ? true : undefined}
                    {...form.register(`pairs.${index}.right`)}
                  />
                  <Counter value={pairs[index]?.right} max={RIGHT_MAX} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  title={`Remover par ${index + 1}`}
                  aria-label={`Remover par ${index + 1}`}
                  disabled={pairFields.fields.length <= MIN_PAIRS}
                  onClick={() => { pairFields.remove(index) }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {pairErrors?.left && (
                <p className="text-xs text-destructive">Par {index + 1}, esquerda: {pairErrors.left.message}</p>
              )}
              {pairErrors?.right && (
                <p className="text-xs text-destructive">Par {index + 1}, direita: {pairErrors.right.message}</p>
              )}
            </div>
          )
        })}

        {pairsError && <p className="text-xs text-destructive">{pairsError}</p>}
      </div>

      <div className="flex items-start gap-2">
        <Switch
          id="matching-left-as-code"
          checked={leftAsCode}
          onCheckedChange={(checked) => { form.setValue('leftAsCode', checked, { shouldDirty: true }) }}
        />
        <div>
          <Label htmlFor="matching-left-as-code" className="text-sm">Coluna da esquerda como código</Label>
          <p className="text-xs text-muted-foreground">
            Mostra a esquerda em fonte monoespaçada — para tags, propriedades, métodos e códigos de status.
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <Label>Prévia dos pares</Label>
        <ul className="space-y-1.5">
          {pairs.map((pair, index) => (
            <li key={index} className="grid grid-cols-[1fr_auto_1.5fr] items-center gap-2 text-sm">
              <span className={cn('rounded bg-secondary px-2 py-1.5 text-center', leftAsCode && 'font-mono text-xs')}>
                {pair?.left?.trim() || '—'}
              </span>
              <span aria-hidden="true" className="text-muted-foreground">↔</span>
              <span className="rounded bg-secondary px-2 py-1.5 text-center">
                {pair?.right?.trim() || '—'}
              </span>
            </li>
          ))}
        </ul>
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
            <Label htmlFor="matching-pool" className="text-sm">Pool</Label>
            <Input id="matching-pool" placeholder="ex.: tags-basicas" {...form.register('pool')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matching-draw" className="text-sm">Sortear</Label>
            <Input
              id="matching-draw"
              type="number"
              min={1}
              placeholder="1"
              {...form.register('draw', {
                setValueAs: (value: unknown) => (value === '' || value === undefined || value === null ? undefined : Number(value))
              })}
            />
          </div>
        </div>
        {errors.draw && (
          <p className="text-xs text-destructive">{errors.draw.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Switch
          id="matching-tutorial"
          checked={form.watch('tutorial') ?? false}
          onCheckedChange={(checked) => { form.setValue('tutorial', checked, { shouldDirty: true }) }}
        />
        <div>
          <Label htmlFor="matching-tutorial" className="text-sm">Tutorial</Label>
          <p className="text-xs text-muted-foreground">Marca a tela como parte do tutorial inicial.</p>
        </div>
      </div>
    </div>
  )
}
