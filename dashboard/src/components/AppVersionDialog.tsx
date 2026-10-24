import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Smartphone } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { suggestNextVersion } from '@/hooks/useContentVersions'
import { useAppVersionsQuery, usePublishAppVersionMutation } from '@/hooks/useAppVersions'
import { LOCALE_LABELS, LOCALES, type LocaleCode } from '@/types/api'
import { VERSION_PATTERN } from '@/lib/contentVersion'

/**
 * O schema espelha o da API (`app-version.schema.ts`). Um texto por idioma, e
 * todos obrigatórios: a API grava uma linha por idioma numa transação só, e um
 * idioma sem texto deixaria o aviso do app vazio para quem o usa.
 */
const publishSchema = z.object({
  version: z.string().regex(VERSION_PATTERN, 'Use três números separados por ponto (ex.: 1.2.0).'),
  needUpdate: z.boolean(),
  changelogs: z.object(
    Object.fromEntries(LOCALES.map((code) => [code, z.string().min(1, 'Descreva o que mudou neste idioma.')])) as Record<LocaleCode, z.ZodString>
  )
})

type PublishFormValues = z.infer<typeof publishSchema>

const emptyChangelogs = Object.fromEntries(LOCALES.map((code) => [code, ''])) as Record<LocaleCode, string>

/**
 * Publica uma nova versão do **aplicativo** (não do conteúdo das aulas).
 *
 * É o que faz o app mostrar "há uma nova versão" a quem tem uma instalação mais
 * antiga. O aviso nunca bloqueia o uso: "Importante" só muda a ênfase do texto,
 * para quando a versão traz algo sem o qual o app não funciona direito (uma
 * correção de segurança, um idioma, um bug sério).
 *
 * O número aqui precisa ser o mesmo do `version` do `app.json` do build que
 * você distribui — é com ele que o app compara a versão instalada.
 */
export function AppVersionDialog () {
  const [open, setOpen] = useState(false)
  const { data: versions } = useAppVersionsQuery()
  const publish = usePublishAppVersionMutation()

  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: { version: '1.0.1', needUpdate: false, changelogs: emptyChangelogs }
  })

  // A versão de referência é a mais alta entre os idiomas publicados.
  const current = versions?.map((entry) => entry.version).sort((a, b) => compareVersions(b, a))[0]

  // Ao abrir, semeia o campo com o próximo patch. Efeito (e não valor derivado)
  // porque o campo precisa continuar editável. `form` fica fora das dependências:
  // a instância do react-hook-form é estável.
  useEffect(() => {
    if (open) {
      form.setValue('version', suggestNextVersion(current ?? '1.0.0'))
    }
  }, [open, current, form])

  async function onSubmit (values: PublishFormValues) {
    await publish.mutateAsync({
      version: values.version,
      needUpdate: values.needUpdate,
      changelogs: LOCALES.map((code) => ({ locale: code, changelog: values.changelogs[code] }))
    })
    form.reset({ version: '', needUpdate: false, changelogs: emptyChangelogs })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Smartphone className="size-3.5" /> Versão do app
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Publicar versão do aplicativo</DialogTitle>
          <DialogDescription>
            Quem tem uma versão mais antiga instalada vê um aviso ao abrir o app, com o texto
            abaixo e um botão para a página oficial de download. Não bloqueia o uso.
          </DialogDescription>
        </DialogHeader>

        {/* `min-w-0`: ver o comentário equivalente em ContentVersionDialog (grid item + truncate). */}
        <div className="min-w-0 space-y-1 rounded-md border border-border bg-secondary/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Versão vigente
          </p>
          {versions === undefined && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {versions?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma versão do app publicada ainda.</p>
          )}
          {versions?.map((entry) => (
            <div key={entry.locale} className="flex items-baseline gap-2 text-sm">
              <span className="w-20 shrink-0 text-muted-foreground">
                {LOCALE_LABELS[entry.locale as LocaleCode] ?? entry.locale}
              </span>
              <code className="font-mono text-primary">{entry.version}</code>
              <span className="text-xs text-muted-foreground">{entry.releasedAt}</span>
              {entry.needUpdate && (
                <span className="shrink-0 text-xs text-destructive" title="Publicada como importante">
                  importante
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {entry.changelog}
              </span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Versão</FormLabel>
                  <FormControl>
                    <Input placeholder="1.2.0" className="font-mono" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Tem que ser o <code>version</code> do <code>app.json</code> do build que você vai distribuir.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {LOCALES.map((code) => (
              <FormField
                key={code}
                control={form.control}
                name={`changelogs.${code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>O que mudou — {LOCALE_LABELS[code]}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Novo idioma, correções de segurança e melhorias." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="needUpdate"
              render={({ field }) => (
                <FormItem className="flex items-start gap-2 space-y-0">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div>
                    <FormLabel className="text-sm">Atualização importante</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Ligado: a versão traz algo sem o qual o app não funciona direito (segurança,
                      idioma, um bug sério) e o aviso é mais enfático. Desligado: é só uma
                      recomendação, dá para continuar usando normalmente. Em nenhum dos dois casos
                      o app é bloqueado.
                    </p>
                  </div>
                </FormItem>
              )}
            />

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

/** Compara `X.Y.Z` numericamente (`1.0.10` > `1.0.9`); versão ilegível vale 0. */
function compareVersions (a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0)
    if (diff !== 0) return diff
  }
  return 0
}
