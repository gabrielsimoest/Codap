import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Megaphone } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  suggestNextVersion,
  useContentVersionsQuery,
  usePublishContentVersionMutation
} from '@/hooks/useContentVersions'
import { LOCALE_LABELS, LOCALES, type LocaleCode } from '@/types/api'
import { VERSION_PATTERN } from '@/lib/contentVersion'

/**
 * O schema espelha o da API (`content-version.schema.ts`) — mesma expressão,
 * escrita sem barra invertida pelo mesmo motivo documentado lá.
 */
const publishSchema = z.object({
  locale: z.string().min(1),
  version: z.string().regex(VERSION_PATTERN, 'Use três números separados por ponto (ex.: 0.1.4).'),
  changelog: z.string().min(1, 'Descreva o que mudou.')
})

type PublishFormValues = z.infer<typeof publishSchema>

/**
 * Publica uma nova versão do conteúdo.
 *
 * É o que faz o app rebuscar o catálogo: enquanto a versão não muda, quem já
 * abriu o app continua com o conteúdo em cache, por mais que o banco tenha
 * mudado. **Editar conteúdo aqui não basta — sem publicar, ninguém recebe.**
 *
 * A publicação é por idioma, de propósito: um idioma com suporte parcial não
 * deve rebuscar porque outro mudou.
 */
export function ContentVersionDialog () {
  const [open, setOpen] = useState(false)
  const { data: versions } = useContentVersionsQuery()
  const publish = usePublishContentVersionMutation()

  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: { locale: LOCALES[0], version: '0.0.1', changelog: '' }
  })

  // `useWatch` e nao `form.watch`: o React Compiler nao consegue memoizar o
  // segundo (oxlint avisa), e os demais formulários do pacote já usam este.
  const selectedLocale = useWatch({ control: form.control, name: 'locale' })
  const currentForLocale = versions?.find((entry) => entry.locale === selectedLocale)

  // Ao abrir o diálogo ou trocar de idioma, semeia o campo com o próximo patch
  // daquele idioma.
  //
  // É um efeito, e não um valor derivado, porque o campo precisa ser editável:
  // derivar sobrescreveria o que o usuário digitou a cada render. `form` fica
  // fora das dependências de propósito — a instância do react-hook-form é
  // estável, e incluí-la só reexecutaria o efeito à toa.
  useEffect(() => {
    if (open) {
      form.setValue('version', suggestNextVersion(currentForLocale?.version))
    }
  }, [open, selectedLocale, currentForLocale?.version, form])

  async function onSubmit (values: PublishFormValues) {
    await publish.mutateAsync(values)
    form.reset({ locale: values.locale, version: '', changelog: '' })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Megaphone className="size-3.5" /> Publicar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publicar versão do conteúdo</DialogTitle>
          <DialogDescription>
            Editar conteúdo não basta: enquanto a versão não mudar, quem já abriu o app continua
            com o que está em cache. É esta publicação que dispara a atualização.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 rounded-md border border-border bg-secondary/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Versão vigente
          </p>
          {versions === undefined && (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          )}
          {versions?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma versão publicada ainda.</p>
          )}
          {versions?.map((entry) => (
            <div key={entry.locale} className="flex items-baseline gap-2 text-sm">
              <span className="w-20 shrink-0 text-muted-foreground">
                {LOCALE_LABELS[entry.locale as LocaleCode] ?? entry.locale}
              </span>
              <code className="font-mono text-primary">{entry.version}</code>
              <span className="text-xs text-muted-foreground">{entry.releasedAt}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {entry.changelog}
              </span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCALES.map((code) => (
                          <SelectItem key={code} value={code}>{LOCALE_LABELS[code]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão</FormLabel>
                    <FormControl>
                      <Input placeholder="0.1.4" className="font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="changelog"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que mudou</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Duas lições novas no módulo intermediário de CSS."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground">
              Só o idioma escolhido é atualizado. Se a edição cobriu os dois, publique duas vezes.
            </p>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false) }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Publicar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
