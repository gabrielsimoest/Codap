import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAreasQuery, useContentTreeQuery } from '@/hooks/useContentQueries'
import { AppHeader } from '@/components/AppHeader'
import { ContentTree } from '@/components/tree/ContentTree'
import { LessonDetail } from '@/components/LessonDetail'
import { PrintDocument } from '@/components/export/PrintDocument'
import type { ExportDocument } from '@/lib/exportDocument'
import type { ContentModule } from '@/types/api'

/**
 * SPA de uma tela só, em master–detail: a árvore da área à esquerda, a lição
 * selecionada à direita. Não há router — a seleção é estado local, e uma
 * segunda rota só faria sentido se houvesse uma segunda tela.
 */
export function App () {
  const { data: areas, isLoading, error } = useAreasQuery()

  const [chosenAreaId, setChosenAreaId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [printDocument, setPrintDocument] = useState<ExportDocument | null>(null)

  // A área efetiva é derivada durante a renderização, não escrita por um efeito:
  // enquanto ninguém escolheu nada, vale a primeira da lista. Por posição, nunca
  // por id — `areas.id` é autoincrement, sem valor fixo garantido (mesma regra
  // que o app segue em `areaMetadata.ts`).
  const areaId = chosenAreaId ?? areas?.[0]?.id ?? null

  const { modules, isLoading: isTreeLoading, error: treeError } = useContentTreeQuery(areaId)

  const selectedArea = areas?.find((area) => area.id === areaId) ?? null

  const selectedLesson = findLesson(modules, selectedLessonId)

  if (isLoading) {
    return <CenteredMessage icon={<Loader2 className="size-5 animate-spin" />} text="Carregando áreas…" />
  }

  if (error) {
    return (
      <CenteredMessage
        icon={<AlertCircle className="size-5 text-destructive" />}
        text="Não foi possível falar com a API."
        detail="Suba a API em modo de desenvolvimento com `pnpm api:dev` na raiz do repositório e recarregue esta página."
      />
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader
        areas={areas ?? []}
        areaId={areaId}
        onAreaChange={(next) => {
          setChosenAreaId(next)
          setSelectedLessonId(null)
        }}
        areaName={selectedArea?.name ?? ''}
        modules={modules}
        onPreparePrint={setPrintDocument}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="w-96 shrink-0 overflow-y-auto border-r border-border bg-card print-hidden">
          <ContentTree
            areaId={areaId}
            modules={modules}
            isLoading={isTreeLoading}
            error={treeError}
            selectedLessonId={selectedLessonId}
            onSelectLesson={setSelectedLessonId}
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto print-hidden">
          <LessonDetail
            areaId={areaId}
            module={selectedLesson?.module ?? null}
            lesson={selectedLesson?.lesson ?? null}
          />
        </main>
      </div>

      {/*
        A view de impressão fica fora do fluxo (escondida em tela, visível só na
        impressão): é assim que o PDF sai por `window.print()`, sem nenhuma
        dependência de renderização de PDF.
      */}
      {printDocument && <PrintDocument document={printDocument} />}
    </div>
  )
}

/** Localiza a lição selecionada e o módulo a que ela pertence. */
function findLesson (modules: ContentModule[], lessonId: number | null) {
  if (lessonId === null) {
    return null
  }
  for (const module of modules) {
    const lesson = module.lessons.find((candidate) => candidate.id === lessonId)
    if (lesson) {
      return { module, lesson }
    }
  }
  return null
}

function CenteredMessage ({
  icon,
  text,
  detail
}: {
  icon: React.ReactNode;
  text: string;
  detail?: string;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      {icon}
      <p className="text-sm font-medium text-foreground">{text}</p>
      {detail && <p className="max-w-md text-xs text-muted-foreground">{detail}</p>}
    </div>
  )
}
