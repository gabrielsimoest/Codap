import { type FastifyPluginAsync } from 'fastify'
import create from './create.js'
import list from './list.js'
import getById from './getById.js'
import update from './update.js'
import remove from './remove.js'

const users: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(create)
  await fastify.register(list)
  await fastify.register(getById)
  await fastify.register(update)
  await fastify.register(remove)
}

export default users
