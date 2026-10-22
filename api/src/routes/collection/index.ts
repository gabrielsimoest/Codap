import { type FastifyPluginAsync } from 'fastify'
import list from './list.js'

const collection: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(list)
}

export default collection
