import { type FastifyPluginAsync } from 'fastify'
import list from './list.js'
import create from './create.js'
import update from './update.js'
import remove from './remove.js'

const areas: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(list)

  // As rotas de escrita do catálogo só são registradas em desenvolvimento —
  // mesmo critério de `src/plugins/swagger.ts`. Não é UI escondida: fora de dev
  // elas não existem, e a API responde 404. O dashboard de conteúdo (pacote
  // `dashboard/`) roda em localhost e é o único consumidor delas.
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(create)
  await fastify.register(update)
  await fastify.register(remove)
}

export default areas
