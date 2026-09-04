const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/**
 * Erro de uma resposta da API, já com a mensagem que o `@fastify/sensible`
 * devolve no corpo. É o que permite mostrar ao usuário o motivo real de um 409
 * ("esta lição tem 3 registros de progresso") em vez de um "erro 409" genérico.
 */
export class ApiError extends Error {
  readonly status: number

  constructor (status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Cliente HTTP do dashboard. Usa `fetch` nativo de propósito: o app depende do
 * axios pelos interceptors de refresh de token, que aqui não existem — não há
 * autenticação nesta ferramenta (ver dashboard/CLAUDE.md).
 *
 * Não chame isto direto de um componente: toda requisição passa por um hook em
 * `src/hooks/`.
 */
export async function request<T> (path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options

  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response))
  }

  // 204 (remoções e reordenações) não tem corpo — `response.json()` lançaria.
  if (response.status === 204) {
    return undefined as T
  }

  return await response.json() as T
}

async function extractErrorMessage (response: Response): Promise<string> {
  try {
    const body = await response.json() as { message?: string }
    if (typeof body.message === 'string' && body.message.length > 0) {
      return body.message
    }
  } catch {
    // Corpo vazio ou não-JSON: cai no texto genérico abaixo.
  }

  if (response.status === 404) {
    return 'Rota não encontrada. A API precisa estar rodando em modo de desenvolvimento (pnpm api:dev) para aceitar escritas.'
  }

  return `A API respondeu ${response.status}.`
}

export { API_URL }
