import { ChevronDown, ChevronUp, FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LocaleBadges } from '@/components/LocaleBadges'
import { ConfirmDelete } from '@/components/ConfirmDelete'
import { ActivityFormDialog } from '@/components/forms/ActivityFormDialog'
import { ActivityPreview } from '@/components/ActivityPreview'
import {
  useRemoveActivityMutation,
  useReorderActivitiesMutation
} from '@/hooks/useContentMutations'
import { moveWithin } from '@/lib/reorder'
import type { AdminLessonResponse, ContentModule } from '@/types/api'

interface LessonDetailProps {
  areaId: number | null;
  module: ContentModule | null;
  lesson: AdminLessonResponse | null;
}

export function LessonDetail ({ areaId, module, lesson }: LessonDetailProps) {
  const removeActivity = useRemoveActivityMutation(areaId)
  const reorderActivities = useReorderActivitiesMutation(areaId)

  if (!lesson || !module || areaId === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <FileText className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Selecione uma lição na árvore à esquerda para ver e editar suas atividades.
        </p>
      </div>
    )
  }

  const lessonName = lesson.translations.pt?.name ?? lesson.translations.en?.name ?? 'Sem nome'
  const moduleName = module.translations.pt?.name ?? module.translations.en?.name ?? ''

  function move (position: number, direction: -1 | 1) {
    const orderedIds = moveWithin(
      lesson!.activities.map((activity) => activity.id),
      position,
      direction
    )
    if (orderedIds) {
      reorderActivities.mutate({ lessonId: lesson!.id, orderedIds })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{moduleName}</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{lessonName}</h1>
          <LocaleBadges translations={lesson.translations} />
        </div>
        <p className="text-xs text-muted-foreground">
          Lição {lesson.index + 1} · {lesson.activities.length} atividade(s)
        </p>
      </div>

      <div className="flex justify-end">
        <ActivityFormDialog
          areaId={areaId}
          lessonId={lesson.id}
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" /> Nova atividade
            </Button>
          }
        />
      </div>

      {lesson.activities.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Esta lição ainda não tem atividades.
          </CardContent>
        </Card>
      )}

      {lesson.activities.map((activity, position) => (
        <Card key={activity.id}>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Atividade {activity.index + 1}
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {activity.type}
            </Badge>
            <LocaleBadges translations={activity.content} />

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title="Subir atividade"
                disabled={position === 0}
                onClick={() => { move(position, -1) }}
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title="Descer atividade"
                disabled={position === lesson.activities.length - 1}
                onClick={() => { move(position, 1) }}
              >
                <ChevronDown className="size-3.5" />
              </Button>

              <ActivityFormDialog
                areaId={areaId}
                lessonId={lesson.id}
                activity={activity}
                trigger={
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Editar
                  </Button>
                }
              />

              <ConfirmDelete
                title="Remover esta atividade?"
                description={
                  <p>
                    A atividade e o conteúdo dela em todos os idiomas serão apagados. O progresso do
                    usuário é registrado por lição, não por atividade, então nenhum histórico se
                    perde aqui.
                  </p>
                }
                onConfirm={() => { removeActivity.mutate(activity.id) }}
                trigger={
                  <Button variant="ghost" size="icon" className="size-7 text-destructive" title="Remover atividade">
                    <Trash2 className="size-3.5" />
                  </Button>
                }
              />
            </div>
          </CardHeader>

          <CardContent>
            <ActivityPreview activity={activity} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
