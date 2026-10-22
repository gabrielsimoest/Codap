import { useState } from 'react'
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
import { CODE_LANGUAGES, type TheoryContentForm, type TheoryPersona } from '@/lib/activitySchemas'

/**
 * Formulário de uma atividade `theory`, espelhando `TheoryActivityContent`: as
 * quatro áreas da tela, na ordem em que aparecem — introdução, explicação,
 * código e fechamento.
 *
 * `requireCody` vem da lição: é `true` quando esta é (ou será) a primeira
 * atividade teórica dela, e então a persona neutra fica desabilitada. Os
 * títulos são sempre digitados — nada é preenchido sozinho.
 */
export function TheoryFields ({ requireCody }: { requireCody: boolean }) {
  const form = useFormContext<TheoryContentForm>()
  const control = form.control as Control<TheoryContentForm>
  const errors = form.formState.errors

  const { fields, append, remove } = useFieldArray({ control, name: 'additionalCode' })

  const [introTitle, introText, persona, explanationTitle, explanationText, closing] = useWatch({
    control,
    name: [
      'introduction.title',
      'introduction.text',
      'introduction.persona',
      'explanation.title',
      'explanation.text',
      'closing'
    ]
  })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []

  // O interruptor mostra se o bloco existe; desligar apaga o conteúdo, para a
  // atividade voltar a ir direto ao código (ou terminar nele).
  const [explanationOn, setExplanationOn] = useState(form.getValues('explanation') !== undefined)
  const [closingOn, setClosingOn] = useState(Boolean(form.getValues('closing')))

  const setPersona = (next: TheoryPersona) => {
    form.setValue('introduction.persona', next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted })
  }

  const paragraphs = [introTitle, introText, explanationTitle, explanationText, closing]
    .filter((paragraph): paragraph is string => Boolean(paragraph))

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-md border border-border p-3" aria-labelledby="theory-intro-heading">
        <div>
          <h3 id="theory-intro-heading" className="text-sm font-semibold">Introdução</h3>
          <p className="text-xs text-muted-foreground">
            Apresenta o assunto: contextualiza, desperta curiosidade ou liga ao que o aluno já sabe.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="introduction-title">Título da introdução *</Label>
          <Input id="introduction-title" {...form.register('introduction.title')} />
          <p className="text-xs text-muted-foreground">
            Um título que diga do que a introdução trata — evite repetir a mesma frase em todas as telas.
          </p>
          {errors.introduction?.title && (
            <p className="text-xs text-destructive">{errors.introduction.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="introduction-text">Texto da introdução *</Label>
          <Textarea id="introduction-text" rows={4} {...form.register('introduction.text')} />
          {errors.introduction?.text && (
            <p className="text-xs text-destructive">{errors.introduction.text.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label id="persona-label">Persona *</Label>
          <div role="radiogroup" aria-labelledby="persona-label" className="grid gap-2 sm:grid-cols-2">
            <PersonaOption
              id="persona-cody"
              label="Cody"
              description="Texto acolhedor, curioso e conversacional, com perguntas quando ajudam."
              selected={persona === 'cody'}
              onSelect={() => { setPersona('cody') }}
            />
            <PersonaOption
              id="persona-neutral"
              label="Neutra"
              description="Apresentação direta e didática do assunto, sem saudação."
              selected={persona === 'neutral'}
              disabled={requireCody}
              onSelect={() => { setPersona('neutral') }}
            />
          </div>
          {requireCody && (
            <p data-testid="cody-required" className="text-xs text-amber-500">
              Esta é a primeira atividade teórica da lição: a persona Cody é obrigatória. As teorias
              seguintes podem usar Cody ou neutra.
            </p>
          )}
          {errors.introduction?.persona && (
            <p className="text-xs text-destructive">{errors.introduction.persona.message}</p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-md border border-border p-3" aria-labelledby="theory-explanation-heading">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="theory-explanation-heading" className="text-sm font-semibold">Explicação do conceito</h3>
            <p className="text-xs text-muted-foreground">
              A explicação didática. Sem ela, a tela vai direto da introdução ao código.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="explanation-enabled"
              checked={explanationOn}
              onCheckedChange={(checked) => {
                setExplanationOn(checked)
                form.setValue('explanation', checked ? { title: '', text: '' } : undefined, { shouldDirty: true })
              }}
            />
            <Label htmlFor="explanation-enabled" className="text-sm">Incluir</Label>
          </div>
        </div>

        {explanationOn && (
          <>
            <div className="space-y-2">
              <Label htmlFor="explanation-title">Título da explicação *</Label>
              <Input id="explanation-title" {...form.register('explanation.title')} />
              <p className="text-xs text-muted-foreground">
                O que esta seção ensina, ex.: "Como os elementos HTML são organizados".
              </p>
              {errors.explanation?.title && (
                <p className="text-xs text-destructive">{errors.explanation.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="explanation-text">Texto da explicação *</Label>
              <Textarea id="explanation-text" rows={4} {...form.register('explanation.text')} />
              {errors.explanation?.text && (
                <p className="text-xs text-destructive">{errors.explanation.text.message}</p>
              )}
            </div>
          </>
        )}
      </section>

      <HighlightField
        value={highlight}
        onChange={(next) => { form.setValue('highlight', next, { shouldDirty: true }) }}
        paragraphs={paragraphs}
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

      <div className="space-y-2 rounded-md border border-border p-3">
        <div>
          <Label htmlFor="terminalCode">Código do terminal (terminalCode)</Label>
          <p className="text-xs text-muted-foreground">
            JavaScript que o botão "Executar" roda no lugar do código exibido: TypeScript já
            transpilado, ou JS que simula o que não roda direto no app. Vazio = roda o próprio código.
          </p>
        </div>
        <Textarea
          id="terminalCode"
          rows={4}
          className="font-mono text-xs"
          {...form.register('terminalCode')}
        />
      </div>

      <section className="space-y-3 rounded-md border border-border p-3" aria-labelledby="theory-closing-heading">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="theory-closing-heading" className="text-sm font-semibold">Fechamento</h3>
            <p className="text-xs text-muted-foreground">
              Card depois do código: recapitulação, leitura do código, erro comum, observação ou ponte
              para o próximo conceito. Sem ele, a tela termina no código.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="closing-enabled"
              checked={closingOn}
              onCheckedChange={(checked) => {
                setClosingOn(checked)
                if (!checked) {
                  form.setValue('closing', '', { shouldDirty: true })
                }
              }}
            />
            <Label htmlFor="closing-enabled" className="text-sm">Incluir</Label>
          </div>
        </div>
        {closingOn && (
          <div className="space-y-2">
            <Label htmlFor="closing">Conteúdo complementar</Label>
            <Textarea id="closing" rows={3} {...form.register('closing')} />
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-6">
        <ToggleRow
          id="noTerminal"
          label="Sem terminal (noTerminal)"
          hint="Esconde o botão Executar numa tela de JS que não mostra nada no console."
          checked={form.watch('noTerminal') ?? false}
          onChange={(checked) => { form.setValue('noTerminal', checked, { shouldDirty: true }) }}
        />
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

function PersonaOption ({
  id,
  label,
  description,
  selected,
  disabled = false,
  onSelect
}: {
  id: string;
  label: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={[
        'rounded-md border p-3 text-left transition-colors',
        selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary/50',
        disabled ? 'cursor-not-allowed opacity-50' : ''
      ].join(' ')}
    >
      <span className="block text-sm font-medium">{label}{selected && ' ✓'}</span>
      <span className="block text-xs text-muted-foreground">{description}</span>
    </button>
  )
}
