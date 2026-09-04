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
import { useCreateLessonMutation, useUpdateLessonMutation } from '@/hooks/useContentMutations'
import {
  LOCALE_LABELS,
  LOCALES,
  type AdminLessonResponse,
  type LessonTranslationInput,
  type TranslationMap
} from '@/types/api'

// Mesma regra do formulário de módulo: nome vazio = idioma não enviado.
const lessonFormSchema = z.object({
  pt: z.object({ name: z.string() }),
  en: z.object({ name: z.string() })
}).refine(
  (values) => LOCALES.some((locale) => values[locale].name.trim().length > 0),
  { message: 'Preencha o nome em ao menos um idioma.', path: ['pt', 'name'] }
)

type LessonFormValues = z.infer<typeof lessonFormSchema>

function toFormValues (lesson?: AdminLessonResponse): LessonFormValues {
  return {
    pt: { name: lesson?.translations.pt?.name ?? '' },
    en: { name: lesson?.translations.en?.name ?? '' }
  }
}

function toTranslations (values: LessonFormValues): TranslationMap<LessonTranslationInput> {
  const translations: TranslationMap<LessonTranslationInput> = {}

  for (const locale of LOCALES) {
    const name = values[locale].name.trim()
    if (name.length > 0) {
      translations[locale] = { name }
    }
  }

  return translations
}

interface LessonFormDialogProps {
  areaId: number;
  moduleId: number;
  trigger: ReactNode;
  /** Ausente = criação. */
  lesson?: AdminLessonResponse;
}

export function LessonFormDialog ({ areaId, moduleId, trigger, lesson }: LessonFormDialogProps) {
  const [open, setOpen] = useState(false)
  const createLesson = useCreateLessonMutation(areaId)
  const updateLesson = useUpdateLessonMutation(areaId)

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    values: toFormValues(lesson)
  })

  async function onSubmit (values: LessonFormValues) {
    const translations = toTranslations(values)

    if (lesson) {
      await updateLesson.mutateAsync({ id: lesson.id, body: { translations } })
    } else {
      // Sem `index`: a API faz append no fim do módulo.
      await createLesson.mutateAsync({ moduleId, translations })
      form.reset(toFormValues())
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Editar lição' : 'Nova lição'}</DialogTitle>
          <DialogDescription>
            O nome da lição é o que aparece na lista do módulo dentro do app.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {LOCALES.map((locale) => (
              <FormField
                key={locale}
                control={form.control}
                name={`${locale}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LOCALE_LABELS[locale]}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={locale === 'pt' ? 'O que é HTML?' : 'What is HTML?'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false) }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {lesson ? 'Salvar' : 'Criar lição'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
