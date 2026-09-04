import { useMemo, useState } from 'react'
import { Download, FileDown, Printer } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { buildExportDocument, type ExportDocument } from '@/lib/exportDocument'
import { downloadMarkdown } from '@/lib/exportMarkdown'
import { LOCALE_LABELS, LOCALES, type ContentModule, type LocaleCode } from '@/types/api'

interface ExportDialogProps {
  areaName: string;
  modules: ContentModule[];
  onPreparePrint: (document: ExportDocument | null) => void;
}

/** Valor do seletor de recorte: a área toda, um módulo, ou uma lição. */
type ScopeValue = 'area' | `module:${number}` | `lesson:${number}:${number}`

/**
 * Exporta um recorte do currículo.
 *
 * Tudo é gerado a partir da árvore já carregada em memória — nenhum endpoint
 * novo. O Markdown sai por download direto; o PDF sai pela impressão do
 * navegador sobre uma view dedicada, sem nenhuma biblioteca de PDF (que
 * renderizaria mal justamente os blocos de código, presentes em quase toda
 * atividade).
 */
export function ExportDialog ({ areaName, modules, onPreparePrint }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<ScopeValue>('area')
  const [locale, setLocale] = useState<LocaleCode>('pt')

  const scopeOptions = useMemo(() => {
    const options: { value: ScopeValue; label: string }[] = [
      { value: 'area', label: `Área inteira — ${areaName || 'sem área'}` }
    ]

    for (const module of modules) {
      const moduleName =
        module.translations[locale]?.name ??
        module.translations.pt?.name ??
        `Módulo ${module.index + 1}`

      options.push({ value: `module:${module.id}`, label: `Módulo · ${moduleName}` })

      for (const lesson of module.lessons) {
        const lessonName =
          lesson.translations[locale]?.name ??
          lesson.translations.pt?.name ??
          `Lição ${lesson.index + 1}`

        options.push({
          value: `lesson:${module.id}:${lesson.id}`,
          label: `   Lição · ${moduleName} › ${lessonName}`
        })
      }
    }

    return options
  }, [modules, areaName, locale])

  function buildDocument (): ExportDocument | null {
    if (modules.length === 0) {
      return null
    }

    if (scope === 'area') {
      return buildExportDocument({ areaName, locale, modules, scopeLabel: 'currículo completo' })
    }

    const [kind, moduleId, lessonId] = scope.split(':')
    const module = modules.find((candidate) => candidate.id === Number(moduleId))
    if (!module) {
      return null
    }

    const moduleName = module.translations[locale]?.name ?? `Módulo ${module.index + 1}`

    if (kind === 'module') {
      return buildExportDocument({
        areaName,
        locale,
        modules: [module],
        scopeLabel: moduleName
      })
    }

    const lesson = module.lessons.find((candidate) => candidate.id === Number(lessonId))
    if (!lesson) {
      return null
    }

    return buildExportDocument({
      areaName,
      locale,
      modules: [{ ...module, lessons: [lesson] }],
      scopeLabel: `${moduleName} › ${lesson.translations[locale]?.name ?? `Lição ${lesson.index + 1}`}`
    })
  }

  function exportMarkdown () {
    const doc = buildDocument()
    if (doc) {
      downloadMarkdown(doc)
      setOpen(false)
    }
  }

  function exportPdf () {
    const doc = buildDocument()
    if (!doc) {
      return
    }

    // Monta a view de impressão, fecha o diálogo (senão o overlay do Radix vai
    // junto para o papel) e só então chama o print — o `setTimeout` dá um
    // quadro para o React aplicar as duas mudanças antes de a janela congelar
    // no diálogo de impressão.
    onPreparePrint(doc)
    setOpen(false)
    setTimeout(() => {
      window.print()
      onPreparePrint(null)
    }, 150)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" disabled={modules.length === 0}>
          <FileDown className="size-3.5" /> Exportar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar conteúdo</DialogTitle>
          <DialogDescription>
            Gera um documento legível por uma pessoa e por um modelo de linguagem: a prosa em texto
            corrido e cada trecho de código na sua linguagem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recorte</Label>
            <Select value={scope} onValueChange={(value) => { setScope(value as ScopeValue) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {scopeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select value={locale} onValueChange={(value) => { setLocale(value as LocaleCode) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCALES.map((code) => (
                  <SelectItem key={code} value={code}>{LOCALE_LABELS[code]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button className="gap-1.5" onClick={exportMarkdown}>
            <Download className="size-3.5" /> Baixar .md
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={exportPdf}>
            <Printer className="size-3.5" /> Imprimir / PDF
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground">
          O PDF sai pelo diálogo de impressão do navegador — escolha "Salvar como PDF" no destino.
        </p>
      </DialogContent>
    </Dialog>
  )
}
