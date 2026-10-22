import { type FastifyPluginAsync } from 'fastify'
import state from './state.js'
import purchase from './purchase.js'
import useHint from './useHint.js'

const shop: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(state)
  await fastify.register(purchase)
  await fastify.register(useHint)
}

export default shop
