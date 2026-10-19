import { type ReactNode, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useCreateLessonMutation, useUpdateLessonMutation } from '@/hooks/useContentMutations'
import {
  DEFAULT_CHEST_XP_REWARD,
  DEFAULT_XP_REWARD,
  lessonFormSchema,
  toDeepeningFields,
  toFormValues,
  toTranslations,
  type LessonFormValues
} from '@/lib/lessonForm'
import { LOCALE_LABELS, LOCALES, type AdminLessonResponse } from '@/types/api'

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

  const optional = useWatch({ control: form.control, name: 'optional' })
  const chest = useWatch({ control: form.control, name: 'chest' })

  async function onSubmit (values: LessonFormValues) {
    const translations = toTranslations(values)
    const deepening = toDeepeningFields(values, lesson)

    if (lesson) {
      await updateLesson.mutateAsync({ id: lesson.id, body: { translations, ...deepening } })
    } else {
      // Sem `index`: a API faz append no fim do módulo.
      await createLesson.mutateAsync({ moduleId, translations, ...deepening })
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

            <FormField
              control={form.control}
              name="optional"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-md border p-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        // Aprofundamento e baú se excluem: ligar um desliga o outro.
                        if (checked) {
                          form.setValue('chest', false, { shouldDirty: true })
                        }
                        // Sugere 30 XP só ao ligar com o campo vazio; o que já
                        // está gravado nunca é trocado por uma sugestão.
                        if (checked && form.getValues('xpReward').trim() === '') {
                          form.setValue('xpReward', DEFAULT_XP_REWARD, { shouldDirty: true })
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Aula de aprofundamento</FormLabel>
                    <FormDescription>
                      Opcional: abre no app a partir de um nível e rende XP próprio. Desligada, a
                      lição é da trilha principal.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chest"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-md border p-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (checked) {
                          form.setValue('optional', false, { shouldDirty: true })
                        }
                        if (checked && form.getValues('xpReward').trim() === '') {
                          form.setValue('xpReward', DEFAULT_CHEST_XP_REWARD, { shouldDirty: true })
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Aula do baú</FormLabel>
                    <FormDescription>
                      Exclusiva: fora do catálogo, só chega a quem a revela abrindo o Baú Surpresa.
                      Fica para sempre na coleção da pessoa. Não tem nível mínimo.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {(optional || chest) && (
              <div className={optional ? 'grid grid-cols-2 items-start gap-3' : 'grid grid-cols-1 gap-3'}>
                {optional && (
                  <FormField
                    control={form.control}
                    name="minLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível mínimo</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" placeholder="8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="xpReward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>XP ao concluir</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="numeric" placeholder="padrão: 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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
