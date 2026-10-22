import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronRight, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleNode } from './ModuleNode'
import { ModuleFormDialog } from '@/components/forms/ModuleFormDialog'
import type { ContentModule } from '@/types/api'

interface ContentTreeProps {
  areaId: number | null;
  modules: ContentModule[];
  isLoading: boolean;
  error: unknown;
  selectedLessonId: number | null;
  onSelectLesson: (lessonId: number) => void;
}

export function ContentTree ({
  areaId,
  modules,
  isLoading,
  error,
  selectedLessonId,
  onSelectLesson
}: ContentTreeProps) {
  // Todos os módulos começam expandidos: a árvore é a única forma de navegar, e
  // abrir quatro nós a cada recarga seria atrito puro.
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

  function toggle (moduleId: number) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  if (areaId === null) {
    return <p className="p-4 text-sm text-muted-foreground">Selecione uma área.</p>
  }

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando conteúdo…
      </p>
    )
  }

  if (error) {
    return (
      <p className="flex items-start gap-2 p-4 text-sm text-destructive">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        Não foi possível carregar o conteúdo desta área.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Módulos
        </span>
        <ModuleFormDialog
          areaId={areaId}
          nextIndex={modules.length}
          trigger={
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              <Plus className="size-3.5" /> Módulo
            </Button>
          }
        />
      </div>

      {modules.length === 0 && (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          Esta área ainda não tem módulos.
        </p>
      )}

      {modules.map((module, position) => (
        <ModuleNode
          key={module.id}
          areaId={areaId}
          module={module}
          modules={modules}
          position={position}
          isCollapsed={collapsed.has(module.id)}
          onToggle={() => { toggle(module.id) }}
          collapseIcon={collapsed.has(module.id) ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          selectedLessonId={selectedLessonId}
          onSelectLesson={onSelectLesson}
        />
      ))}
    </div>
  )
}
