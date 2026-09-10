import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contentVersionApi } from '@/api/content'
import { queryKeys } from '@/api/queryKeys'
import { ApiError } from '@/api/client'
import type { PublishContentVersionBody } from '@/types/api'

/** Versão de conteúdo vigente de cada idioma. */
export function useContentVersionsQuery () {
  return useQuery({
    queryKey: queryKeys.contentVersions(),
    queryFn: () => contentVersionApi.list()
  })
}

export function usePublishContentVersionMutation () {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: PublishContentVersionBody) => contentVersionApi.publish(body),
    onSuccess: async (published) => {
      toast.success(`Versão ${published.version} publicada para ${published.locale}.`)
      await client.invalidateQueries({ queryKey: queryKeys.contentVersions() })
    },
    onError: (error) => {
      // A mensagem do 409 diz qual é a versão vigente — é informação útil, não
      // ruído. Mostrar "erro 409" no lugar dela esconderia o motivo.
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível publicar. A API está rodando em pnpm api:dev?'
      )
    }
  })
}

/**
 * Sugere o próximo *patch* a partir da versão vigente (`0.1.3` → `0.1.4`).
 *
 * Só uma sugestão: o campo continua editável, porque subir *minor* ou *major* é
 * uma decisão editorial que o dashboard não tem como inferir. Uma versão
 * ilegível (ou ausente) devolve `0.0.1`, o primeiro incremento possível.
 */
export function suggestNextVersion (current: string | undefined): string {
  const parts = current?.split('.').map((part) => Number(part)) ?? []
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) {
    return '0.0.1'
  }

  const [major, minor, patch] = parts
  return `${major}.${minor}.${patch + 1}`
}
