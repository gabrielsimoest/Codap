import { useFieldArray, useFormContext, useWatch, type Control } from 'react-hook-form'
import { Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { HighlightField } from './HighlightField'
import type { OptionContentForm } from '@/lib/activitySchemas'

/**
 * Formulário de uma atividade `option`, espelhando `OptionActivityContent`.
 *
 * A alternativa correta é escolhida clicando na própria opção, e não digitando
 * um número: `correctOption` é **1-based** no contrato, e um campo numérico
 * cru convidaria ao erro de gravar o índice do array (0-based).
 */
export function OptionFields () {
  const form = useFormContext<OptionContentForm>()
  const control = form.control as Control<OptionContentForm>

  const { fields, append, remove } = useFieldArray({
    control,
    // `options` é `string[]`; o `useFieldArray` precisa de um nome de campo, e
    // a tipagem dele espera objetos — daí o cast pontual.
    name: 'options' as never
  })

  const correctOption = useWatch({ control, name: 'correctOption' })
  const question = useWatch({ control, name: 'question' })
  const additional = useWatch({ control, name: 'aditionalParagraph' })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Pergunta *</Label>
        <Textarea id="question" rows={2} {...form.register('question')} />
        {form.formState.errors.question && (
          <p className="text-xs text-destructive">{form.formState.errors.question.message}</p>
        )}
      </div>

      <div className="space-y-2">
        {/*
          O nome do campo tem um erro de digitação (`aditional`) que veio do
          contrato e está gravado no banco — corrigir aqui quebraria todo o
          conteúdo já semeado.
        */}
        <Label htmlFor="aditionalParagraph">Parágrafo complementar</Label>
        <Textarea id="aditionalParagraph" rows={2} {...form.register('aditionalParagraph')} />
      </div>

      <HighlightField
        value={highlight}
        onChange={(next) => { form.setValue('highlight', next, { shouldDirty: true }) }}
        paragraphs={[question, additional].filter((text): text is string => Boolean(text))}
      />

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Alternativas</Label>
            <p className="text-xs text-muted-foreground">
              Clique no círculo para marcar a alternativa correta.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => { append('' as never) }}
          >
            <Plus className="size-3.5" /> Alternativa
          </Button>
        </div>

        {fields.map((field, index) => {
          const isCorrect = correctOption === index + 1
          return (
            <div key={field.id} className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Marcar como correta"
                className={cn(
                  'size-8 shrink-0 rounded-full border',
                  isCorrect
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground'
                )}
                onClick={() => {
                  form.setValue('correctOption', index + 1, { shouldDirty: true })
                }}
              >
                {isCorrect ? <Check className="size-4" /> : <span className="text-xs">{index + 1}</span>}
              </Button>

              <Input {...form.register(`options.${index}`)} />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-destructive"
                title="Remover alternativa"
                disabled={fields.length <= 2}
                onClick={() => {
                  remove(index)
                  // `correctOption` é 1-based e aponta para uma posição: se a
                  // alternativa correta sai (ou vem depois da removida), o
                  // ponteiro precisa acompanhar, senão passa a apontar para
                  // outra alternativa silenciosamente.
                  if (correctOption > index + 1) {
                    form.setValue('correctOption', correctOption - 1, { shouldDirty: true })
                  } else if (correctOption === index + 1) {
                    form.setValue('correctOption', 1, { shouldDirty: true })
                  }
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )
        })}

        {form.formState.errors.options && (
          <p className="text-xs text-destructive">
            {form.formState.errors.options.message ?? 'Confira as alternativas.'}
          </p>
        )}
        {form.formState.errors.correctOption && (
          <p className="text-xs text-destructive">
            {form.formState.errors.correctOption.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Switch
          id="option-tutorial"
          checked={form.watch('tutorial') ?? false}
          onCheckedChange={(checked) => { form.setValue('tutorial', checked, { shouldDirty: true }) }}
        />
        <div>
          <Label htmlFor="option-tutorial" className="text-sm">Tutorial</Label>
          <p className="text-xs text-muted-foreground">
            Marca a tela como parte do tutorial inicial.
          </p>
        </div>
      </div>
    </div>
  )
}
