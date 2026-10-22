import { useFormContext, useWatch, type Control } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
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
import {
  CODE_BLANK_MARKER,
  CODE_LANGUAGES,
  FILL_BLANK_ANSWER,
  countBlanks,
  type FillBlankContentForm
} from '@/lib/activitySchemas'

const MAX_ANSWERS = 3

/**
 * Formulário de uma atividade `fill_blank`, espelhando `FillBlankActivityContent`.
 *
 * O código leva exatamente uma lacuna `___`, e as respostas aceitas são uma
 * lista curta (até 3) — útil quando há sinônimos legítimos, como `let` e `var`
 * para "declare uma variável que muda". A lista é editada com `setValue` em vez
 * de `useFieldArray`, que espera objetos e não strings.
 */
export function FillBlankFields () {
  const form = useFormContext<FillBlankContentForm>()
  const control = form.control as Control<FillBlankContentForm>

  const question = useWatch({ control, name: 'question' })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []
  const codeLanguage = useWatch({ control, name: 'codeLanguage' })
  const code = useWatch({ control, name: 'code' }) ?? ''
  const answers = useWatch({ control, name: 'answers' }) ?? []
  const ignoreCase = useWatch({ control, name: 'ignoreCase' }) ?? false

  const blanks = countBlanks(code)
  const preview = code.replace(CODE_BLANK_MARKER, answers[0] ? `[${answers[0]}]` : CODE_BLANK_MARKER)
  const answerErrors = form.formState.errors.answers

  const setAnswers = (next: string[]) => {
    form.setValue('answers', next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fill-question">Instrução *</Label>
        <Textarea
          id="fill-question"
          rows={2}
          placeholder='ex.: Digite o método que adiciona o 3 no fim do array nums.'
          {...form.register('question')}
        />
        <p className="text-xs text-muted-foreground">
          Diga exatamente o que digitar, com os valores do código — o aluno não vê opções.
        </p>
        {form.formState.errors.question && (
          <p className="text-xs text-destructive">{form.formState.errors.question.message}</p>
        )}
      </div>

      <HighlightField
        value={highlight}
        onChange={(next) => { form.setValue('highlight', next, { shouldDirty: true }) }}
        paragraphs={question ? [question] : []}
      />

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center gap-3">
          <Label htmlFor="fill-code" className="shrink-0">Código com a lacuna *</Label>
          <Select
            value={codeLanguage ?? 'JavaScript'}
            onValueChange={(value) => {
              form.setValue('codeLanguage', value as FillBlankContentForm['codeLanguage'], { shouldDirty: true })
            }}
          >
            <SelectTrigger className="w-40" aria-label="Linguagem do código"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CODE_LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Marque exatamente uma lacuna com <code>___</code>. No máximo 30 caracteres por linha,
          contando a resposta mais longa.
        </p>
        <Textarea id="fill-code" rows={4} className="font-mono text-xs" {...form.register('code')} />
        <p className="text-xs text-muted-foreground">
          {blanks === 1 ? '1 lacuna encontrada.' : `${blanks} lacuna(s) encontrada(s) — precisa ser exatamente 1.`}
        </p>
        {form.formState.errors.code && (
          <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Respostas aceitas</Label>
            <p className="text-xs text-muted-foreground">
              A primeira é a principal. Só letras, números e hífen, até 20 caracteres.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={answers.length >= MAX_ANSWERS}
            onClick={() => { setAnswers([...answers, '']) }}
          >
            <Plus className="size-3.5" /> Resposta
          </Button>
        </div>
        {answers.map((answer, index) => {
          const invalid = answer.trim().length > 0 && !FILL_BLANK_ANSWER.test(answer.trim())
          const error = Array.isArray(answerErrors) ? answerErrors[index]?.message : undefined
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={`fill-answer-${index}`} className="w-24 shrink-0 text-xs text-muted-foreground">
                  Resposta {index + 1}
                </Label>
                <Input
                  id={`fill-answer-${index}`}
                  className="font-mono"
                  value={answer}
                  onChange={(event) => {
                    setAnswers(answers.map((value, k) => (k === index ? event.target.value : value)))
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-destructive"
                  title={`Remover a resposta ${index + 1}`}
                  disabled={answers.length <= 1}
                  onClick={() => { setAnswers(answers.filter((_, k) => k !== index)) }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {(error ?? invalid) && (
                <p className="pl-26 text-xs text-destructive">
                  {error ?? 'Use só letras, números e hífen, até 20 caracteres.'}
                </p>
              )}
            </div>
          )
        })}
        {answerErrors && !Array.isArray(answerErrors) && answerErrors.message && (
          <p className="text-xs text-destructive">{answerErrors.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Switch
          id="fill-ignore-case"
          checked={ignoreCase}
          onCheckedChange={(checked) => {
            form.setValue('ignoreCase', checked ? true : undefined, { shouldDirty: true })
          }}
        />
        <div>
          <Label htmlFor="fill-ignore-case" className="text-sm">Ignorar maiúsculas (ignoreCase)</Label>
          <p className="text-xs text-muted-foreground">
            Ligue em HTML e CSS, onde <code>H1</code> vale como <code>h1</code>. Deixe desligado em
            JavaScript e TypeScript: lá <code>push</code> e <code>Push</code> são coisas diferentes.
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <Label>Prévia com a resposta principal</Label>
        <pre data-testid="fill-preview" className="overflow-x-auto rounded bg-secondary p-2 font-mono text-xs">{preview || ' '}</pre>
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
            <Label htmlFor="fill-pool" className="text-sm">Pool</Label>
            <Input id="fill-pool" placeholder="ex.: metodos-array" {...form.register('pool')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fill-draw" className="text-sm">Sortear</Label>
            <Input
              id="fill-draw"
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
          id="fill-tutorial"
          checked={form.watch('tutorial') ?? false}
          onCheckedChange={(checked) => { form.setValue('tutorial', checked, { shouldDirty: true }) }}
        />
        <div>
          <Label htmlFor="fill-tutorial" className="text-sm">Tutorial</Label>
          <p className="text-xs text-muted-foreground">Marca a tela como parte do tutorial inicial.</p>
        </div>
      </div>
    </div>
  )
}
