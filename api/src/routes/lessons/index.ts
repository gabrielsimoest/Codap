import { type FastifyPluginAsync } from 'fastify'
import list from './list.js'
import create from './create.js'
import update from './update.js'
import remove from './remove.js'
import reorder from './reorder.js'

/**
 * Recurso inteiramente voltado ao dashboard de conteúdo, incluindo a leitura:
 * `GET /lessons` devolve a forma "admin" (todos os idiomas), que o app não usa
 * nem deveria usar — ele consome `GET /modules`, já resolvido num idioma só.
 * Por isso o gate de desenvolvimento envolve o recurso todo, e não só a escrita
 * como em `areas`/`modules`.
 */
const lessons: FastifyPluginAsync = async (fastify): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(list)
  await fastify.register(create)
  await fastify.register(update)
  await fastify.register(remove)
  await fastify.register(reorder)
}

export default lessons
