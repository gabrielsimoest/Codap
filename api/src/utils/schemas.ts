/**
 * Corpo de erro do `@fastify/sensible` (`fastify.httpErrors.*`). Vive em
 * `utils/` porque é compartilhado por vários recursos e `src/routes/` é
 * varrido pelo `@fastify/autoload` — um arquivo de schema solto ali seria
 * carregado como se fosse uma rota.
 */
export const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' }
  }
}
