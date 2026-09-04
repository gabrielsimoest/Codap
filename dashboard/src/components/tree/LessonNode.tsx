import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LocaleBadges } from '@/components/LocaleBadges'
import { ConfirmDelete } from '@/components/ConfirmDelete'
import { LessonFormDialog } from '@/components/forms/LessonFormDialog'
import { useRemoveLessonMutation, useReorderLessonsMutation } from '@/hooks/useContentMutations'
import { moveWithin } from '@/lib/reorder'
import type { AdminLessonResponse } from '@/types/api'

interface LessonNodeProps {
  areaId: number;
  moduleId: number;
  lesson: AdminLessonResponse;
  lessons: AdminLessonResponse[];
  position: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function LessonNode ({
  areaId,
  moduleId,
  lesson,
  lessons,
  position,
  isSelected,
  onSelect
}: LessonNodeProps) {
  const removeLesson = useRemoveLessonMutation(areaId)
  const reorderLessons = useReorderLessonsMutation(areaId)

  const label = lesson.translations.pt?.name ?? lesson.translations.en?.name ?? 'Sem nome'

  function move (direction: -1 | 1) {
    const orderedIds = moveWithin(lessons.map((item) => item.id), position, direction)
    if (orderedIds) {
      reorderLessons.mutate({ moduleId, orderedIds })
    }
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md px-1 hover:bg-accent/40',
        isSelected && 'bg-primary/15 hover:bg-primary/20'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        data-testid="lesson-node"
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-1 text-left"
      >
        <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          {lesson.index + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {lesson.activities.length}
        </span>
        <LocaleBadges translations={lesson.translations} />
      </button>

      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          title="Subir lição"
          disabled={position === 0}
          onClick={() => { move(-1) }}
        >
          <ChevronUp className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          title="Descer lição"
          disabled={position === lessons.length - 1}
          onClick={() => { move(1) }}
        >
          <ChevronDown className="size-3" />
        </Button>

        <LessonFormDialog
          areaId={areaId}
          moduleId={moduleId}
          lesson={lesson}
          trigger={
            <Button variant="ghost" size="icon" className="size-6" title="Editar lição">
              <Pencil className="size-3" />
            </Button>
          }
        />

        <ConfirmDelete
          title="Remover esta lição?"
          description={
            <>
              <p>
                <strong>{label}</strong> será removida junto com{' '}
                <strong>{lesson.activities.length} atividade(s)</strong> e todas as traduções.
              </p>
              <p>
                Se esta lição já tiver progresso de usuário, a API recusa a remoção para não apagar
                esse histórico.
              </p>
            </>
          }
          onConfirm={() => { removeLesson.mutate(lesson.id) }}
          trigger={
            <Button variant="ghost" size="icon" className="size-6 text-destructive" title="Remover lição">
              <Trash2 className="size-3" />
            </Button>
          }
        />
      </div>
    </div>
  )
}
