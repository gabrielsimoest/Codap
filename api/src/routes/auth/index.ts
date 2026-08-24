import { type FastifyPluginAsync } from 'fastify'
import register from './register.js'
import login from './login.js'
import refresh from './refresh.js'
import logout from './logout.js'

const auth: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(register)
  await fastify.register(login)
  await fastify.register(refresh)
  await fastify.register(logout)
}

export default auth
