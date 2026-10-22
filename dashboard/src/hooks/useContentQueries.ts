import { useQueries, useQuery } from '@tanstack/react-query'
import { areasApi, modulesApi } from '@/api/content'
import { queryKeys } from '@/api/queryKeys'
import { mergeModulesByLocale } from '@/lib/mergeContent'
import { LOCALES, type ContentModule, type LocaleCode, type ModuleResponse } from '@/types/api'

/**
 * Cache: longo, finito e **em memória**.
 *
 * `staleTime`/`gcTime` são configurados uma vez em `src/main.tsx`; as queries
 * aqui não sobrescrevem. Três decisões distintas, que vale não confundir:
 *
 * 1. **Longo (1 h), não zero.** O dashboard é usado por uma pessoa de cada vez
 *    — não há um segundo editor mudando o catálogo em paralelo. A única fonte
 *    de escrita é o próprio usuário, e as mutations já invalidam a área
 *    afetada, então rebuscar a cada foco de janela seria requisição jogada
 *    fora. `GET /modules` de JavaScript devolve o currículo inteiro; não é um
 *    payload para refazer à toa.
 * 2. **Finito, não infinito.** O app usa infinito porque o conteúdo é imutável
 *    do ponto de vista dele. Aqui não é: o banco pode mudar por fora (seed,
 *    Prisma Studio, um `psql`), e um cache eterno esconderia isso para sempre.
 *    Uma hora é o intervalo em que uma sessão de autoria acontece inteira, e
 *    recarregar a página continua sendo a saída imediata.
 * 3. **Nunca persistente.** O app persiste o cache (AsyncStorage +
 *    `@tanstack/react-query-persist-client`) porque precisa funcionar offline.
 *    Fazer o mesmo aqui seria um defeito: o cache sobreviveria ao fechamento do
 *    navegador e o usuário voltaria editando sobre uma foto antiga do banco,
 *    sem nada na tela indicando isso. **Não instale um persister neste
 *    pacote.**
 */

export function useAreasQuery () {
  return useQuery({
    queryKey: queryKeys.areas(),
    queryFn: () => areasApi.list()
  })
}

/**
 * A árvore de uma área em todos os idiomas.
 *
 * Busca `GET /modules` uma vez por idioma e junta no cliente. Não existe um
 * endpoint "admin" que devolva a área inteira multilíngue de uma vez, e é
 * deliberado: `GET /modules` é o endpoint do app, com testes travando o formato
 * da resposta, e duplicá-lo numa variante multilíngue criaria uma segunda forma
 * para manter em sincronia. Duas requisições resolvem sem esse custo.
 */
export function useContentTreeQuery (areaId: number | null) {
  const results = useQueries({
    queries: LOCALES.map((locale) => ({
      queryKey: queryKeys.modules(areaId ?? 0, locale),
      queryFn: () => modulesApi.list(areaId as number, locale),
      enabled: areaId !== null
    }))
  })

  const isLoading = results.some((result) => result.isLoading)
  const error = results.find((result) => result.error)?.error ?? null

  let modules: ContentModule[] = []
  if (areaId !== null && results.every((result) => result.data !== undefined)) {
    const byLocale: Partial<Record<LocaleCode, ModuleResponse[]>> = {}
    LOCALES.forEach((locale, position) => {
      byLocale[locale] = results[position].data as ModuleResponse[]
    })
    modules = mergeModulesByLocale(byLocale)
  }

  return { modules, isLoading, error }
}
