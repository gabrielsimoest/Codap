import { type FastifyPluginAsync } from 'fastify'
import list from './list.js'
import create from './create.js'
import update from './update.js'
import remove from './remove.js'
import reorder from './reorder.js'

const modules: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(list)

  // Ver o comentário em `routes/areas/index.ts`: escrita de catálogo só existe
  // em desenvolvimento.
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(create)
  await fastify.register(update)
  await fastify.register(remove)
  await fastify.register(reorder)
}

export default modules
