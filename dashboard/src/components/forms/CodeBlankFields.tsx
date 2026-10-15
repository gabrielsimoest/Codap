import { useEffect } from 'react'
import { useFieldArray, useFormContext, useWatch, type Control } from 'react-hook-form'
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
  countBlanks,
  type CodeBlankContentForm
} from '@/lib/activitySchemas'

/**
 * Formulário de uma atividade `code_blank`, espelhando `CodeBlankActivityContent`.
 *
 * O número de respostas acompanha sozinho o número de lacunas (`___`) do
 * código: quem autora marca as lacunas no trecho e só preenche o que vai em
 * cada uma, sem ter de manter as duas contagens em sincronia à mão.
 */
export function CodeBlankFields () {
  const form = useFormContext<CodeBlankContentForm>()
  const control = form.control as Control<CodeBlankContentForm>

  const question = useWatch({ control, name: 'question' })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []
  const codeLanguage = useWatch({ control, name: 'codeLanguage' })
  const code = useWatch({ control, name: 'code' }) ?? ''
  const answers = useWatch({ control, name: 'answers' }) ?? []
  const distractors = useWatch({ control, name: 'distractors' }) ?? []

  const blanks = countBlanks(code)

  // Mantém uma resposta por lacuna (até 3), preservando o que já foi digitado.
  useEffect(() => {
    const target = Math.min(Math.max(blanks, 1), 3)
    const current = form.getValues('answers') ?? []
    if (current.length === target) return
    const next = Array.from({ length: target }, (_, index) => current[index] ?? '')
    form.setValue('answers', next, { shouldDirty: true })
  }, [blanks, form])

  const distractorFields = useFieldArray({
    control,
    // `distractors` é `string[]`; o `useFieldArray` espera objetos — daí o cast.
    name: 'distractors' as never
  })

  const preview = answers.reduce(
    (acc, answer) => acc.replace(CODE_BLANK_MARKER, answer ? `[${answer}]` : CODE_BLANK_MARKER),
    code
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="blank-question">Instrução *</Label>
        <Textarea
          id="blank-question"
          rows={2}
          placeholder="ex.: Complete para centralizar o texto."
          {...form.register('question')}
        />
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
          <Label htmlFor="blank-code" className="shrink-0">Código com lacunas *</Label>
          <Select
            value={codeLanguage ?? 'JavaScript'}
            onValueChange={(value) => {
              form.setValue('codeLanguage', value as CodeBlankContentForm['codeLanguage'], { shouldDirty: true })
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
          Marque cada lacuna com <code>___</code> (de 1 a 3). No máximo 30 caracteres por linha,
          contando a resposta — no celular, linha longa obriga a arrastar o bloco para o lado.
        </p>
        <Textarea id="blank-code" rows={5} className="font-mono text-xs" {...form.register('code')} />
        <p className="text-xs text-muted-foreground">
          {blanks === 0 ? 'Nenhuma lacuna marcada.' : `${blanks} lacuna(s) encontrada(s).`}
        </p>
        {form.formState.errors.code && (
          <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div>
          <Label>Respostas</Label>
          <p className="text-xs text-muted-foreground">
            Uma por lacuna, na ordem em que aparecem no código.
          </p>
        </div>
        {answers.map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">Lacuna {index + 1}</span>
            <Input
              aria-label={`Resposta da lacuna ${index + 1}`}
              className="font-mono"
              {...form.register(`answers.${index}`)}
            />
          </div>
        ))}
        {form.formState.errors.answers && (
          <p className="text-xs text-destructive">
            {form.formState.errors.answers.message ?? 'Confira as respostas.'}
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Blocos errados</Label>
            <p className="text-xs text-muted-foreground">
              Aparecem embaralhados junto com as respostas. Use erros plausíveis, não absurdos.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => { distractorFields.append('' as never) }}
          >
            <Plus className="size-3.5" /> Bloco
          </Button>
        </div>
        {distractorFields.fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              aria-label={`Bloco errado ${index + 1}`}
              className="font-mono"
              {...form.register(`distractors.${index}`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive"
              title="Remover bloco"
              disabled={distractorFields.fields.length <= 1}
              onClick={() => { distractorFields.remove(index) }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        {form.formState.errors.distractors && (
          <p className="text-xs text-destructive">
            {form.formState.errors.distractors.message ?? 'Confira os blocos errados.'}
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <Label>Prévia com as respostas</Label>
        <pre className="overflow-x-auto rounded bg-secondary p-2 font-mono text-xs">{preview || ' '}</pre>
        <p className="text-xs text-muted-foreground">
          Blocos: {[...answers, ...distractors].filter(Boolean).map((chip) => `[${chip}]`).join(' ') || '—'}
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
            <Label htmlFor="blank-pool" className="text-sm">Pool</Label>
            <Input id="blank-pool" placeholder="ex.: map-filter" {...form.register('pool')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blank-draw" className="text-sm">Sortear</Label>
            <Input
              id="blank-draw"
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
          id="blank-tutorial"
          checked={form.watch('tutorial') ?? false}
          onCheckedChange={(checked) => { form.setValue('tutorial', checked, { shouldDirty: true }) }}
        />
        <div>
          <Label htmlFor="blank-tutorial" className="text-sm">Tutorial</Label>
          <p className="text-xs text-muted-foreground">Marca a tela como parte do tutorial inicial.</p>
        </div>
      </div>
    </div>
  )
}
