import { useFieldArray, useFormContext, useWatch, type Control } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { CODE_LANGUAGES, type TheoryContentForm } from '@/lib/activitySchemas'

/**
 * Formulário de uma atividade `theory`, espelhando `TheoryActivityContent`.
 *
 * Os quatro parágrafos são campos separados (e não um textarea único) porque é
 * assim que o app os renderiza — cada um é um bloco próprio na tela, com o
 * bloco de código entre eles.
 */
export function TheoryFields () {
  const form = useFormContext<TheoryContentForm>()
  const control = form.control as Control<TheoryContentForm>

  const { fields, append, remove } = useFieldArray({ control, name: 'additionalCode' })

  const paragraphs = useWatch({
    control,
    name: ['firstParagraph', 'secondParagraph', 'thirdParagraph', 'endParagraph']
  })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstParagraph">Primeiro parágrafo *</Label>
        <Textarea id="firstParagraph" rows={3} {...form.register('firstParagraph')} />
        {form.formState.errors.firstParagraph && (
          <p className="text-xs text-destructive">
            {form.formState.errors.firstParagraph.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="secondParagraph">Segundo parágrafo</Label>
          <Textarea id="secondParagraph" rows={3} {...form.register('secondParagraph')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thirdParagraph">Terceiro parágrafo</Label>
          <Textarea id="thirdParagraph" rows={3} {...form.register('thirdParagraph')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endParagraph">Parágrafo final</Label>
        <Textarea id="endParagraph" rows={2} {...form.register('endParagraph')} />
      </div>

      <HighlightField
        value={highlight}
        onChange={(next) => { form.setValue('highlight', next, { shouldDirty: true }) }}
        paragraphs={(paragraphs ?? []).filter((paragraph): paragraph is string => Boolean(paragraph))}
      />

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Linguagem do código</Label>
          <Select
            value={form.watch('codeLanguage')}
            onValueChange={(value) => {
              form.setValue('codeLanguage', value as TheoryContentForm['codeLanguage'], { shouldDirty: true })
            }}
          >
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CODE_LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea rows={6} className="font-mono text-xs" {...form.register('code')} />
        {form.formState.errors.code && (
          <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Blocos de código adicionais</Label>
            <p className="text-xs text-muted-foreground">
              Uma aba extra no app. É o que permite juntar HTML e CSS para a aba "Web" renderizar a
              demonstração.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => { append({ codeLanguage: 'CSS', code: '' }) }}
          >
            <Plus className="size-3.5" /> Bloco
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 rounded-md border border-border/60 p-2">
            <div className="flex items-center gap-2">
              <Select
                value={form.watch(`additionalCode.${index}.codeLanguage`)}
                onValueChange={(value) => {
                  form.setValue(
                    `additionalCode.${index}.codeLanguage`,
                    value as TheoryContentForm['codeLanguage'],
                    { shouldDirty: true }
                  )
                }}
              >
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CODE_LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>{language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto size-8 text-destructive"
                title="Remover bloco"
                onClick={() => { remove(index) }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <Textarea
              rows={4}
              className="font-mono text-xs"
              {...form.register(`additionalCode.${index}.code`)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <ToggleRow
          id="onlyCode"
          label="Somente código (onlyCode)"
          hint="Esconde a aba de pré-visualização web no app."
          checked={form.watch('onlyCode') ?? false}
          onChange={(checked) => { form.setValue('onlyCode', checked, { shouldDirty: true }) }}
        />
        <ToggleRow
          id="tutorial"
          label="Tutorial"
          hint="Marca a tela como parte do tutorial inicial."
          checked={form.watch('tutorial') ?? false}
          onChange={(checked) => { form.setValue('tutorial', checked, { shouldDirty: true }) }}
        />
      </div>
    </div>
  )
}

function ToggleRow ({
  id,
  label,
  hint,
  checked,
  onChange
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <div>
        <Label htmlFor={id} className="text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}
