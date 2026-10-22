import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { activitiesApi, areasApi, lessonsApi, modulesApi } from '@/api/content'
import { queryKeys } from '@/api/queryKeys'
import { ApiError } from '@/api/client'
import type {
  CreateActivityBody,
  CreateAreaBody,
  CreateLessonBody,
  CreateModuleBody,
  UpdateActivityBody,
  UpdateAreaBody,
  UpdateLessonBody,
  UpdateModuleBody
} from '@/types/api'

/**
 * Invalida a árvore de uma área.
 *
 * Usa o prefixo `['modules', areaId]` de propósito: a árvore da UI é a junção
 * das queries de **todos** os idiomas, então invalidar só a do idioma que está
 * sendo editado deixaria a outra metade da tela desatualizada.
 */
function invalidateArea (client: QueryClient, areaId: number): Promise<void> {
  return client.invalidateQueries({ queryKey: queryKeys.modulesByArea(areaId) })
}

function reportError (error: unknown): void {
  const message = error instanceof ApiError
    ? error.message
    : 'Não foi possível falar com a API. Ela está rodando em pnpm api:dev?'
  toast.error(message)
}

/**
 * Fábrica das mutations de conteúdo.
 *
 * Todas seguem a mesma forma — executa, avisa por toast, invalida a área — e
 * escrever isso quinze vezes à mão é exatamente como uma delas acaba esquecendo
 * de invalidar. `areaId` vem por parâmetro porque nem toda entidade sabe a qual
 * área pertence (uma atividade só conhece a lição).
 */
function useContentMutation<TVariables, TData> (
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage: string,
  areaId: number | null
) {
  const client = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      toast.success(successMessage)
      if (areaId !== null) {
        await invalidateArea(client, areaId)
      } else {
        await client.invalidateQueries({ queryKey: queryKeys.areas() })
      }
    },
    onError: reportError
  })
}

export function useCreateAreaMutation () {
  return useContentMutation(
    (body: CreateAreaBody) => areasApi.create(body),
    'Área criada.',
    null
  )
}

export function useUpdateAreaMutation () {
  return useContentMutation(
    ({ id, body }: { id: number; body: UpdateAreaBody }) => areasApi.update(id, body),
    'Área atualizada.',
    null
  )
}

export function useRemoveAreaMutation () {
  return useContentMutation((id: number) => areasApi.remove(id), 'Área removida.', null)
}

export function useCreateModuleMutation (areaId: number | null) {
  return useContentMutation(
    (body: CreateModuleBody) => modulesApi.create(body),
    'Módulo criado.',
    areaId
  )
}

export function useUpdateModuleMutation (areaId: number | null) {
  return useContentMutation(
    ({ id, body }: { id: number; body: UpdateModuleBody }) => modulesApi.update(id, body),
    'Módulo atualizado.',
    areaId
  )
}

export function useRemoveModuleMutation (areaId: number | null) {
  return useContentMutation((id: number) => modulesApi.remove(id), 'Módulo removido.', areaId)
}

export function useReorderModulesMutation (areaId: number | null) {
  return useContentMutation(
    ({ areaId: target, orderedIds }: { areaId: number; orderedIds: number[] }) =>
      modulesApi.reorder(target, orderedIds),
    'Ordem dos módulos salva.',
    areaId
  )
}

export function useCreateLessonMutation (areaId: number | null) {
  return useContentMutation(
    (body: CreateLessonBody) => lessonsApi.create(body),
    'Lição criada.',
    areaId
  )
}

export function useUpdateLessonMutation (areaId: number | null) {
  return useContentMutation(
    ({ id, body }: { id: number; body: UpdateLessonBody }) => lessonsApi.update(id, body),
    'Lição atualizada.',
    areaId
  )
}

export function useRemoveLessonMutation (areaId: number | null) {
  return useContentMutation((id: number) => lessonsApi.remove(id), 'Lição removida.', areaId)
}

export function useReorderLessonsMutation (areaId: number | null) {
  return useContentMutation(
    ({ moduleId, orderedIds }: { moduleId: number; orderedIds: number[] }) =>
      lessonsApi.reorder(moduleId, orderedIds),
    'Ordem das lições salva.',
    areaId
  )
}

export function useCreateActivityMutation (areaId: number | null) {
  return useContentMutation(
    (body: CreateActivityBody) => activitiesApi.create(body),
    'Atividade criada.',
    areaId
  )
}

export function useUpdateActivityMutation (areaId: number | null) {
  return useContentMutation(
    ({ id, body }: { id: number; body: UpdateActivityBody }) => activitiesApi.update(id, body),
    'Atividade salva.',
    areaId
  )
}

export function useRemoveActivityMutation (areaId: number | null) {
  return useContentMutation(
    (id: number) => activitiesApi.remove(id),
    'Atividade removida.',
    areaId
  )
}

export function useReorderActivitiesMutation (areaId: number | null) {
  return useContentMutation(
    ({ lessonId, orderedIds }: { lessonId: number; orderedIds: number[] }) =>
      activitiesApi.reorder(lessonId, orderedIds),
    'Ordem das atividades salva.',
    areaId
  )
}
