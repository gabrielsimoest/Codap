import { type ReactNode, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { TheoryFields } from './TheoryFields'
import { OptionFields } from './OptionFields'
import { CodeBlankFields } from './CodeBlankFields'
import { FillBlankFields } from './FillBlankFields'
import { CodePlaygroundFields } from './CodePlaygroundFields'
import { CodeEditorFields } from './CodeEditorFields'
import { ReorderFields } from './ReorderFields'
import { MatchingFields } from './MatchingFields'
import { useCreateActivityMutation, useUpdateActivityMutation } from '@/hooks/useContentMutations'
import {
  buildTheoryContentSchema,
  codeBlankContentSchema,
  fillBlankContentSchema,
  codePlaygroundContentSchema,
  codeEditorContentSchema,
  emptyCodeBlankContent,
  emptyFillBlankContent,
  emptyCodePlaygroundContent,
  emptyCodeEditorContent,
  emptyMatchingContent,
  emptyOptionContent,
  emptyReorderContent,
  isTypedActivity,
  matchingContentSchema,
  optionContentSchema,
  reorderContentSchema,
  toTheoryForm
} from '@/lib/activitySchemas'
import { firstTheory } from '@/lib/theoryRules'
import { LOCALE_LABELS, LOCALES, type AdminActivityResponse, type LocaleCode, type TranslationMap } from '@/types/api'

interface ActivityFormDialogProps {
  areaId: number;
  lessonId: number;
  trigger: ReactNode;
  /** Ausente = criação. */
  activity?: AdminActivityResponse;
  /** Todas as atividades da lição, na ordem: a regra da persona depende da posição. */
  lessonActivities: AdminActivityResponse[];
}

/**
 * Edita uma atividade num idioma por vez.
 *
 * Um idioma por vez, e não os dois lado a lado como em módulo/lição, porque o
 * `content` de uma atividade é um documento inteiro (parágrafos, código,
 * alternativas) — mostrar dois em paralelo tornaria o formulário ilegível. A
 * requisição envia só o idioma editado, e a API preserva o outro.
 */
export function ActivityFormDialog ({ areaId, lessonId, trigger, activity, lessonActivities }: ActivityFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState(activity?.type ?? 'theory')
  const [locale, setLocale] = useState<LocaleCode>('pt')

  const createActivity = useCreateActivityMutation(areaId)
  const updateActivity = useUpdateActivityMutation(areaId)

  // A primeira teoria da lição precisa ser Cody. Esta atividade é a primeira
  // teoria quando não há outra teoria antes dela — uma atividade nova entra no
  // fim, então só é a primeira se a lição ainda não tem teoria. Vale também
  // para trocar o tipo de uma atividade já existente para `theory`.
  const theoryRequiresCody = useMemo(() => {
    if (type !== 'theory') {
      return false
    }
    const others = lessonActivities.filter((other) => other.id !== activity?.id)
    if (!activity) {
      return firstTheory(others) === undefined
    }
    return !others.some((other) => other.type === 'theory' && other.index < activity.index)
  }, [type, lessonActivities, activity])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{activity ? 'Editar atividade' : 'Nova atividade'}</DialogTitle>
          <DialogDescription>
            O conteúdo é salvo por idioma. Enviar um idioma não altera o outro.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="activity-type">Tipo</Label>
            <Input
              id="activity-type"
              value={type}
              maxLength={25}
              className="w-52 font-mono text-sm"
              onChange={(event) => { setType(event.target.value) }}
            />
          </div>
          <p className="pb-2 text-xs text-muted-foreground">
            {isTypedActivity(type)
              ? 'Tipo com formulário dedicado.'
              : 'Tipo sem formulário dedicado — o conteúdo é editado como JSON.'}
          </p>
        </div>

        <Tabs value={locale} onValueChange={(value) => { setLocale(value as LocaleCode) }}>
          <TabsList>
            {LOCALES.map((code) => (
              <TabsTrigger key={code} value={code}>
                {LOCALE_LABELS[code]}
                {activity?.content[code] === undefined && ' ·'}
              </TabsTrigger>
            ))}
          </TabsList>

          {LOCALES.map((code) => (
            <TabsContent key={code} value={code} className="mt-4">
              <ActivityContentForm
                // Remonta o formulário ao trocar de tipo ou idioma: são
                // documentos diferentes, com campos diferentes.
                key={`${code}-${type}`}
                type={type}
                theoryRequiresCody={theoryRequiresCody}
                content={activity?.content[code]}
                submitLabel={activity ? 'Salvar' : 'Criar atividade'}
                onCancel={() => { setOpen(false) }}
                onSubmit={async (content) => {
                  const payload: TranslationMap<unknown> = { [code]: content }

                  if (activity) {
                    await updateActivity.mutateAsync({
                      id: activity.id,
                      body: { type, content: payload }
                    })
                  } else {
                    await createActivity.mutateAsync({ lessonId, type, content: payload })
                  }

                  setOpen(false)
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface ActivityContentFormProps {
  type: string;
  theoryRequiresCody: boolean;
  content: unknown;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (content: unknown) => Promise<void>;
}

function ActivityContentForm ({
  type,
  theoryRequiresCody,
  content,
  submitLabel,
  onCancel,
  onSubmit
}: ActivityContentFormProps) {
  if (type === 'theory') {
    return (
      <TheoryContentForm
        requireCody={theoryRequiresCody}
        content={content}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    )
  }

  if (type === 'option') {
    return (
      <TypedContentForm
        schema={optionContentSchema}
        defaults={(content as object) ?? emptyOptionContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <OptionFields />
      </TypedContentForm>
    )
  }

  if (type === 'code_blank') {
    return (
      <TypedContentForm
        schema={codeBlankContentSchema}
        defaults={(content as object) ?? emptyCodeBlankContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <CodeBlankFields />
      </TypedContentForm>
    )
  }

  if (type === 'fill_blank') {
    return (
      <TypedContentForm
        schema={fillBlankContentSchema}
        defaults={(content as object) ?? emptyFillBlankContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <FillBlankFields />
      </TypedContentForm>
    )
  }

  if (type === 'code_playground') {
    return (
      <TypedContentForm
        schema={codePlaygroundContentSchema}
        defaults={(content as object) ?? emptyCodePlaygroundContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <CodePlaygroundFields />
      </TypedContentForm>
    )
  }

  if (type === 'code_editor') {
    return (
      <TypedContentForm
        schema={codeEditorContentSchema}
        defaults={(content as object) ?? emptyCodeEditorContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <CodeEditorFields />
      </TypedContentForm>
    )
  }

  if (type === 'reorder') {
    return (
      <TypedContentForm
        schema={reorderContentSchema}
        defaults={(content as object) ?? emptyReorderContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <ReorderFields />
      </TypedContentForm>
    )
  }

  if (type === 'matching') {
    return (
      <TypedContentForm
        schema={matchingContentSchema}
        defaults={(content as object) ?? emptyMatchingContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <MatchingFields />
      </TypedContentForm>
    )
  }

  return (
    <RawJsonForm
      content={content}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  )
}

/**
 * Formulário de teoria: o schema depende da lição (`requireCody`), então é
 * montado aqui, por render, e não importado pronto como os dos outros tipos.
 */
function TheoryContentForm ({
  requireCody,
  content,
  submitLabel,
  onCancel,
  onSubmit
}: {
  requireCody: boolean;
  content: unknown;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (content: unknown) => Promise<void>;
}) {
  const schema = useMemo(() => buildTheoryContentSchema({ requireCody }), [requireCody])
  const defaults = useMemo(() => toTheoryForm(content, { requireCody }), [content, requireCody])

  return (
    <TypedContentForm
      schema={schema}
      defaults={defaults}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={onSubmit}
    >
      <TheoryFields requireCody={requireCody} />
    </TypedContentForm>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function TypedContentForm ({
  schema,
  defaults,
  submitLabel,
  onCancel,
  onSubmit,
  children
}: {
  schema: any;
  defaults: object;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (content: unknown) => Promise<void>;
  children: ReactNode;
}) {
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: defaults
  })

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          // Campos opcionais vazios não devem virar `""` no JSONB — o app trata
          // ausência e string vazia de formas diferentes ao decidir o que
          // renderizar.
          await onSubmit(stripEmpty(values))
        })}
        className="space-y-4"
      >
        {children}
        <FormActions submitLabel={submitLabel} onCancel={onCancel} busy={form.formState.isSubmitting} />
      </form>
    </FormProvider>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function RawJsonForm ({
  content,
  submitLabel,
  onCancel,
  onSubmit
}: {
  content: unknown;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (content: unknown) => Promise<void>;
}) {
  const initial = useMemo(
    () => (content === undefined ? '{\n  \n}' : JSON.stringify(content, null, 2)),
    [content]
  )
  const [text, setText] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit (event: React.FormEvent) {
    event.preventDefault()

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'JSON inválido.')
      return
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setError('O conteúdo precisa ser um objeto JSON.')
      return
    }

    setError(null)
    setBusy(true)
    try {
      await onSubmit(parsed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="raw-json">Conteúdo (JSON)</Label>
        <p className="text-xs text-muted-foreground">
          Este tipo não tem formulário dedicado. A API transporta o conteúdo fielmente sem conhecer
          o formato — quem sabe renderizá-lo é o app.
        </p>
        <Textarea
          id="raw-json"
          rows={18}
          className="font-mono text-xs"
          value={text}
          onChange={(event) => { setText(event.target.value) }}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <FormActions submitLabel={submitLabel} onCancel={onCancel} busy={busy} />
    </form>
  )
}

function FormActions ({
  submitLabel,
  onCancel,
  busy
}: {
  submitLabel: string;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <DialogFooter>
      <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      <Button type="submit" disabled={busy}>{submitLabel}</Button>
    </DialogFooter>
  )
}

/** Remove chaves com string vazia ou array vazio, para não poluir o JSONB. */
function stripEmpty (values: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string' && value.trim().length === 0) {
      continue
    }
    if (Array.isArray(value) && value.length === 0) {
      // `highlight` é obrigatório no contrato e precisa sobreviver vazio.
      if (key !== 'highlight') {
        continue
      }
    }
    if (value === undefined) {
      continue
    }
    cleaned[key] = value
  }

  return cleaned
}
