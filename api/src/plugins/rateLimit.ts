import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

/**
 * Limite global brando para toda a API; rotas sensíveis (login/registro/
 * refresh) definem um limite mais estrito via `config.rateLimit` na própria rota.
 */
export default fp(async (fastify) => {
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute'
  })
})
