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
import { useCreateActivityMutation, useUpdateActivityMutation } from '@/hooks/useContentMutations'
import {
  emptyOptionContent,
  emptyTheoryContent,
  isTypedActivity,
  optionContentSchema,
  theoryContentSchema
} from '@/lib/activitySchemas'
import { LOCALE_LABELS, LOCALES, type AdminActivityResponse, type LocaleCode, type TranslationMap } from '@/types/api'

interface ActivityFormDialogProps {
  areaId: number;
  lessonId: number;
  trigger: ReactNode;
  /** Ausente = criação. */
  activity?: AdminActivityResponse;
}

/**
 * Edita uma atividade num idioma por vez.
 *
 * Um idioma por vez, e não os dois lado a lado como em módulo/lição, porque o
 * `content` de uma atividade é um documento inteiro (parágrafos, código,
 * alternativas) — mostrar dois em paralelo tornaria o formulário ilegível. A
 * requisição envia só o idioma editado, e a API preserva o outro.
 */
export function ActivityFormDialog ({ areaId, lessonId, trigger, activity }: ActivityFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState(activity?.type ?? 'theory')
  const [locale, setLocale] = useState<LocaleCode>('pt')

  const createActivity = useCreateActivityMutation(areaId)
  const updateActivity = useUpdateActivityMutation(areaId)

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
  content: unknown;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (content: unknown) => Promise<void>;
}

function ActivityContentForm ({
  type,
  content,
  submitLabel,
  onCancel,
  onSubmit
}: ActivityContentFormProps) {
  if (type === 'theory') {
    return (
      <TypedContentForm
        schema={theoryContentSchema}
        defaults={(content as object) ?? emptyTheoryContent()}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <TheoryFields />
      </TypedContentForm>
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

  return (
    <RawJsonForm
      content={content}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
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
