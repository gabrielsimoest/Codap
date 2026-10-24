import { type FastifyPluginAsync } from 'fastify'
import create from './create.js'
import progress from './progress.js'

const sync: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(create)
  await fastify.register(progress)
}

export default sync
