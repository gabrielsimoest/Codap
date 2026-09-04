import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { App } from './App'
import { Toaster } from './components/Toaster'
import './index.css'

const ONE_HOUR = 1000 * 60 * 60

/**
 * Cache longo, mas **nunca persistente** — ver `src/hooks/useContentQueries.ts`
 * para o raciocínio completo.
 *
 * Em resumo: o dashboard é usado por uma pessoa só, então o conteúdo não muda
 * pelas costas de ninguém. Quem escreve é o próprio usuário, e toda mutation
 * invalida a área afetada explicitamente — o cache nunca fica atrasado em
 * relação a uma edição feita aqui. Isso torna `staleTime: 0` (o default) puro
 * desperdício de requisição.
 *
 * `gcTime` precisa ser maior que `staleTime`, senão o default de 5 min descarta
 * a query antes de ela sequer envelhecer, e o cache longo não teria efeito
 * nenhum ao alternar entre áreas.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_HOUR,
      gcTime: ONE_HOUR * 24,
      // Uma API local que não responde não fica boa em três tentativas — falhar
      // rápido deixa o erro visível enquanto se sobe o `pnpm api:dev`.
      retry: 1
    }
  }
})

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
      {/*
        Bolha do React Query. Some sozinha no build de produção — o pacote
        exporta um componente vazio quando `process.env.NODE_ENV === 'production'`,
        então não é preciso condicionar o import.

        Fica à direita, e não à esquerda: o canto inferior esquerdo é a árvore de
        navegação, uma lista densa e permanente, e a bolha cobria um módulo
        inteiro ali. À direita ela sobra sobre o painel de detalhe, que é largo.
      */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  </StrictMode>
)
