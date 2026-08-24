import { type FastifyPluginAsync } from 'fastify'
import create from './create.js'

const sync: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(create)
}

export default sync
