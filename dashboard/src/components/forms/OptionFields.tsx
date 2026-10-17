import { useFieldArray, useFormContext, useWatch, type Control } from 'react-hook-form'
import { Check, Plus, Trash2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { HighlightField } from './HighlightField'
import { CODE_LANGUAGES, type OptionContentForm } from '@/lib/activitySchemas'

/** Mesmo limite do `code`: linha mais longa obriga a arrastar o bloco no celular. */
const MAX_OPTION_CODE_LINE = 30

function longestLine (text: string | undefined): number {
  return (text ?? '').split('\n').reduce((max, line) => Math.max(max, line.length), 0)
}

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
  const codeLanguage = useWatch({ control, name: 'codeLanguage' })
  const optionsAsCode = useWatch({ control, name: 'optionsAsCode' }) ?? false
  const optionValues = useWatch({ control, name: 'options' }) ?? []

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

      {/*
        Mesma ordem do app: o trecho fica entre o enunciado e as alternativas.
        Vazio = pergunta só de texto (o `stripEmpty` não grava `code: ""`).
      */}
      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center gap-3">
          <Label htmlFor="option-code" className="shrink-0">Trecho de código</Label>
          <Select
            value={codeLanguage ?? 'JavaScript'}
            onValueChange={(value) => {
              form.setValue('codeLanguage', value as OptionContentForm['codeLanguage'], { shouldDirty: true })
            }}
          >
            <SelectTrigger className="w-40" aria-label="Linguagem do trecho"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CODE_LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Opcional. Aparece com destaque de sintaxe, só para leitura — sem aba Web nem Executar,
          para não entregar a resposta de um "qual a saída?".
        </p>
        <Textarea id="option-code" rows={4} className="font-mono text-xs" {...form.register('code')} />

        {/*
          "Ache o erro": cada alternativa vira um trecho de código, na linguagem
          do Select acima. O `code` do enunciado continua valendo junto.
        */}
        <div className="flex items-start gap-2 pt-1">
          <Switch
            id="option-options-as-code"
            checked={optionsAsCode}
            onCheckedChange={(checked) => {
              // `undefined` (e não `false`) ao desligar: o conteúdo volta a não
              // ter a chave, como antes de alguém ligar.
              form.setValue('optionsAsCode', checked ? true : undefined, { shouldDirty: true, shouldValidate: true })
            }}
          />
          <div>
            <Label htmlFor="option-options-as-code" className="text-sm">
              Alternativas como código (optionsAsCode)
            </Label>
            <p className="text-xs text-muted-foreground">
              Cada alternativa aparece em monoespaçado, com destaque na linguagem acima — para
              "qual destes trechos tem um erro?". Aceita várias linhas, de até {MAX_OPTION_CODE_LINE} caracteres.
            </p>
          </div>
        </div>
      </div>

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
            <div key={field.id} className={cn('flex gap-2', optionsAsCode ? 'items-start' : 'items-center')}>
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

              {optionsAsCode
                ? (
                  <div className="min-w-0 flex-1 space-y-1">
                    <Textarea
                      rows={Math.min(Math.max((optionValues[index] ?? '').split('\n').length, 2), 6)}
                      className="font-mono text-xs"
                      spellCheck={false}
                      aria-label={`Alternativa ${index + 1} (código)`}
                      {...form.register(`options.${index}`)}
                    />
                    {longestLine(optionValues[index]) > MAX_OPTION_CODE_LINE && (
                      <p className="text-xs text-destructive">
                        Uma linha tem {longestLine(optionValues[index])} caracteres; o máximo é {MAX_OPTION_CODE_LINE}
                        {' '}para caber no celular.
                      </p>
                    )}
                  </div>
                  )
                : <Input aria-label={`Alternativa ${index + 1}`} {...form.register(`options.${index}`)} />}

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

      {/*
        Sorteio da prática: o app mostra a teoria fixa e, depois, sorteia
        `draw` atividades de cada `pool` e embaralha as alternativas.
      */}
      <div className="space-y-3 rounded-md border border-border p-3">
        <div>
          <Label>Sorteio</Label>
          <p className="text-xs text-muted-foreground">
            Perguntas com o mesmo pool são alternativas entre si: cada sessão sorteia algumas delas.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <div className="space-y-2">
            <Label htmlFor="option-pool" className="text-sm">Pool</Label>
            <Input id="option-pool" placeholder="ex.: img-alt" {...form.register('pool')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="option-draw" className="text-sm">Sortear</Label>
            <Input
              id="option-draw"
              type="number"
              min={1}
              placeholder="1"
              {...form.register('draw', {
                setValueAs: (value: unknown) => (value === '' || value === undefined || value === null ? undefined : Number(value))
              })}
            />
          </div>
        </div>
        {form.formState.errors.draw && (
          <p className="text-xs text-destructive">{form.formState.errors.draw.message}</p>
        )}
        <div className="flex items-start gap-2">
          <Switch
            id="option-fixed-order"
            checked={form.watch('fixedOrder') ?? false}
            onCheckedChange={(checked) => { form.setValue('fixedOrder', checked, { shouldDirty: true }) }}
          />
          <div>
            <Label htmlFor="option-fixed-order" className="text-sm">Ordem fixa</Label>
            <p className="text-xs text-muted-foreground">
              Não embaralha as alternativas — use em verdadeiro/falso.
            </p>
          </div>
        </div>
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
