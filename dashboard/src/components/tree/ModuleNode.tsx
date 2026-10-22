import { type ReactNode } from 'react'
import { ChevronUp, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LocaleBadges } from '@/components/LocaleBadges'
import { ConfirmDelete } from '@/components/ConfirmDelete'
import { ModuleFormDialog } from '@/components/forms/ModuleFormDialog'
import { LessonFormDialog } from '@/components/forms/LessonFormDialog'
import { LessonNode } from './LessonNode'
import {
  useRemoveModuleMutation,
  useReorderModulesMutation
} from '@/hooks/useContentMutations'
import { moveWithin } from '@/lib/reorder'
import type { ContentModule } from '@/types/api'

interface ModuleNodeProps {
  areaId: number;
  module: ContentModule;
  modules: ContentModule[];
  position: number;
  isCollapsed: boolean;
  collapseIcon: ReactNode;
  onToggle: () => void;
  selectedLessonId: number | null;
  onSelectLesson: (lessonId: number) => void;
}

export function ModuleNode ({
  areaId,
  module,
  modules,
  position,
  isCollapsed,
  collapseIcon,
  onToggle,
  selectedLessonId,
  onSelectLesson
}: ModuleNodeProps) {
  const removeModule = useRemoveModuleMutation(areaId)
  const reorderModules = useReorderModulesMutation(areaId)

  // O rótulo cai para português e depois para inglês: a árvore precisa mostrar
  // *algo* mesmo num módulo traduzido só num idioma — o selo de "sem tradução"
  // é que sinaliza a lacuna, não um nome vazio.
  const label = module.translations.pt?.name ?? module.translations.en?.name ?? 'Sem nome'
  const subtitle = module.translations.pt?.subtitle ?? module.translations.en?.subtitle ?? null

  function move (direction: -1 | 1) {
    const orderedIds = moveWithin(modules.map((item) => item.id), position, direction)
    if (orderedIds) {
      reorderModules.mutate({ areaId, orderedIds })
    }
  }

  return (
    <div className="rounded-md">
      <div className="group flex items-center gap-1 rounded-md px-1 py-1 hover:bg-accent/40">
        <button
          type="button"
          onClick={onToggle}
          data-testid="module-node"
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-1 text-left"
          aria-expanded={!isCollapsed}
        >
          {collapseIcon}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{label}</span>
            {subtitle && (
              <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
            )}
          </span>
          <LocaleBadges translations={module.translations} />
        </button>

        <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="Subir módulo"
            disabled={position === 0}
            onClick={() => { move(-1) }}
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="Descer módulo"
            disabled={position === modules.length - 1}
            onClick={() => { move(1) }}
          >
            <ChevronDown className="size-3.5" />
          </Button>

          <ModuleFormDialog
            areaId={areaId}
            module={module}
            trigger={
              <Button variant="ghost" size="icon" className="size-7" title="Editar módulo">
                <Pencil className="size-3.5" />
              </Button>
            }
          />

          <ConfirmDelete
            title="Remover este módulo?"
            description={
              <>
                <p>
                  <strong>{label}</strong> será removido junto com{' '}
                  <strong>{module.lessons.length} lição(ões)</strong> e todas as atividades e
                  traduções dentro delas.
                </p>
                <p>
                  Se alguma lição já tiver progresso de usuário, a API recusa a remoção para não
                  apagar esse histórico.
                </p>
              </>
            }
            onConfirm={() => { removeModule.mutate(module.id) }}
            trigger={
              <Button variant="ghost" size="icon" className="size-7 text-destructive" title="Remover módulo">
                <Trash2 className="size-3.5" />
              </Button>
            }
          />
        </div>
      </div>

      {!isCollapsed && (
        <div className="ml-4 border-l border-border pl-2">
          {module.lessons.map((lesson, lessonPosition) => (
            <LessonNode
              key={lesson.id}
              areaId={areaId}
              moduleId={module.id}
              lesson={lesson}
              lessons={module.lessons}
              position={lessonPosition}
              isSelected={lesson.id === selectedLessonId}
              onSelect={() => { onSelectLesson(lesson.id) }}
            />
          ))}

          <LessonFormDialog
            areaId={areaId}
            moduleId={module.id}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className={cn('mt-1 h-7 w-full justify-start gap-1 px-2 text-xs text-muted-foreground')}
              >
                <Plus className="size-3.5" /> Nova lição
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
