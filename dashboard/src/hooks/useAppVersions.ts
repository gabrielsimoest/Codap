import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { appVersionApi } from '@/api/content'
import { queryKeys } from '@/api/queryKeys'
import { ApiError } from '@/api/client'
import type { PublishAppVersionBody } from '@/types/api'

/** Versão vigente do app em cada idioma. */
export function useAppVersionsQuery () {
  return useQuery({
    queryKey: queryKeys.appVersions(),
    queryFn: () => appVersionApi.list()
  })
}

export function usePublishAppVersionMutation () {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: PublishAppVersionBody) => appVersionApi.publish(body),
    onSuccess: async (published) => {
      const first = published[0]
      toast.success(
        `Versão ${first?.version ?? ''} do app publicada em ${published.length} idioma(s)` +
          (first?.needUpdate ? ', marcada como importante.' : '.')
      )
      await client.invalidateQueries({ queryKey: queryKeys.appVersions() })
    },
    onError: (error) => {
      // A mensagem do 409/404 diz o motivo (versão repetida, idioma inexistente).
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível publicar. A API está rodando em pnpm api:dev?'
      )
    }
  })
}
