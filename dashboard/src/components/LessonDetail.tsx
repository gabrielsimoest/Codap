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
import { CODY_RULE_MESSAGE, firstTheory, removalBreaksRule, reorderBreaksRule } from '@/lib/theoryRules'
import type { AdminActivityResponse, AdminLessonResponse, ContentModule } from '@/types/api'

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

  const firstTheoryId = firstTheory(lesson.activities)?.id ?? null

  /** A nova ordem de um movimento, ou `null` se ele sairia da lista. */
  function movedOrder (position: number, direction: -1 | 1): number[] | null {
    return moveWithin(
      lesson!.activities.map((activity) => activity.id),
      position,
      direction
    )
  }

  /** Mover deixaria uma teoria não-Cody como a primeira da lição? */
  function moveBreaksRule (position: number, direction: -1 | 1): boolean {
    const orderedIds = movedOrder(position, direction)
    return orderedIds !== null && reorderBreaksRule(lesson!.activities, orderedIds)
  }

  function move (position: number, direction: -1 | 1) {
    const orderedIds = movedOrder(position, direction)
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
          lessonActivities={lesson.activities}
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
            {activity.type === 'theory' && <PersonaBadge activity={activity} first={activity.id === firstTheoryId} />}
            <LocaleBadges translations={activity.content} />

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title={moveBreaksRule(position, -1) ? CODY_RULE_MESSAGE : 'Subir atividade'}
                disabled={position === 0 || moveBreaksRule(position, -1)}
                onClick={() => { move(position, -1) }}
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title={moveBreaksRule(position, 1) ? CODY_RULE_MESSAGE : 'Descer atividade'}
                disabled={position === lesson.activities.length - 1 || moveBreaksRule(position, 1)}
                onClick={() => { move(position, 1) }}
              >
                <ChevronDown className="size-3.5" />
              </Button>

              <ActivityFormDialog
                areaId={areaId}
                lessonId={lesson.id}
                lessonActivities={lesson.activities}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    title={removalBreaksRule(lesson.activities, activity.id) ? CODY_RULE_MESSAGE : 'Remover atividade'}
                    disabled={removalBreaksRule(lesson.activities, activity.id)}
                  >
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

/**
 * Persona de uma teoria, lida do `pt` (ou do `en`). A primeira teoria da lição
 * mostra que Cody é obrigatório — é onde o autor esbarra na regra.
 */
function PersonaBadge ({ activity, first }: { activity: AdminActivityResponse; first: boolean }) {
  const content = (activity.content.pt ?? activity.content.en) as { introduction?: { persona?: string } } | undefined
  const persona = content?.introduction?.persona

  if (persona === undefined) {
    return null
  }

  return (
    <>
      <Badge variant="outline" className="text-[10px]" data-testid="persona-badge">
        {persona === 'cody' ? 'Cody' : 'Neutra'}
      </Badge>
      {first && (
        <Badge variant="outline" className="border-amber-500/60 text-[10px] text-amber-500" data-testid="cody-required-badge">
          Cody obrigatório
        </Badge>
      )}
    </>
  )
}
