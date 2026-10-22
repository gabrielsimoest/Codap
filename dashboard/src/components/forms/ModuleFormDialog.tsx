import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCreateModuleMutation, useUpdateModuleMutation } from '@/hooks/useContentMutations'
import { LOCALE_LABELS, LOCALES, type ContentModule, type ModuleTranslationInput, type TranslationMap } from '@/types/api'

/**
 * Um nome vazio significa "não envie este idioma", nunca "apague a tradução".
 * As rotas de escrita aceitam um mapa parcial de propósito (ver `TranslationMap`
 * em contracts.ts), e não existe endpoint para remover uma tradução — limpar o
 * campo aqui simplesmente deixa o que já está gravado como está.
 */
const moduleFormSchema = z.object({
  pt: z.object({ name: z.string(), subtitle: z.string() }),
  en: z.object({ name: z.string(), subtitle: z.string() })
}).refine(
  (values) => LOCALES.some((locale) => values[locale].name.trim().length > 0),
  { message: 'Preencha o nome em ao menos um idioma.', path: ['pt', 'name'] }
)

type ModuleFormValues = z.infer<typeof moduleFormSchema>

function toFormValues (module?: ContentModule): ModuleFormValues {
  return {
    pt: {
      name: module?.translations.pt?.name ?? '',
      subtitle: module?.translations.pt?.subtitle ?? ''
    },
    en: {
      name: module?.translations.en?.name ?? '',
      subtitle: module?.translations.en?.subtitle ?? ''
    }
  }
}

function toTranslations (values: ModuleFormValues): TranslationMap<ModuleTranslationInput> {
  const translations: TranslationMap<ModuleTranslationInput> = {}

  for (const locale of LOCALES) {
    const name = values[locale].name.trim()
    if (name.length === 0) {
      continue
    }
    const subtitle = values[locale].subtitle.trim()
    translations[locale] = { name, subtitle: subtitle.length > 0 ? subtitle : null }
  }

  return translations
}

interface ModuleFormDialogProps {
  areaId: number;
  trigger: ReactNode;
  /** Ausente = criação. */
  module?: ContentModule;
  nextIndex?: number;
}

export function ModuleFormDialog ({ areaId, trigger, module, nextIndex }: ModuleFormDialogProps) {
  const [open, setOpen] = useState(false)
  const createModule = useCreateModuleMutation(areaId)
  const updateModule = useUpdateModuleMutation(areaId)

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    values: toFormValues(module)
  })

  async function onSubmit (values: ModuleFormValues) {
    const translations = toTranslations(values)

    if (module) {
      await updateModule.mutateAsync({ id: module.id, body: { translations } })
    } else {
      await createModule.mutateAsync({ areaId, index: nextIndex, translations })
      form.reset(toFormValues())
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{module ? 'Editar módulo' : 'Novo módulo'}</DialogTitle>
          <DialogDescription>
            O <strong>nome</strong> é o rótulo genérico que o app mostra como título ("Módulo 1"). O{' '}
            <strong>subtítulo</strong> é o nome descritivo ("Além do JavaScript").
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {LOCALES.map((locale) => (
              <div key={locale} className="space-y-3 rounded-md border border-border p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {LOCALE_LABELS[locale]}
                </p>

                <FormField
                  control={form.control}
                  name={`${locale}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder={locale === 'pt' ? 'Módulo 1' : 'Module 1'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`${locale}.subtitle`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtítulo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={locale === 'pt' ? 'Conceitos de HTML' : 'HTML concepts'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <p className="text-xs text-muted-foreground">
              Deixar um idioma em branco não remove a tradução já gravada — apenas não a altera.
            </p>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false) }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {module ? 'Salvar' : 'Criar módulo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
