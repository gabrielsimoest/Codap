import { type FastifyPluginAsync } from 'fastify'
import register from './register.js'
import login from './login.js'
import refresh from './refresh.js'
import logout from './logout.js'
import verifyEmail from './verifyEmail.js'
import resendVerification from './resendVerification.js'
import forgotPassword from './forgotPassword.js'
import resetPassword from './resetPassword.js'
import me from './me.js'
import requestPasswordChange from './requestPasswordChange.js'
import changeEmail from './changeEmail.js'

const auth: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(register)
  await fastify.register(login)
  await fastify.register(refresh)
  await fastify.register(logout)
  await fastify.register(verifyEmail)
  await fastify.register(resendVerification)
  await fastify.register(forgotPassword)
  await fastify.register(resetPassword)
  await fastify.register(me)
  await fastify.register(requestPasswordChange)
  await fastify.register(changeEmail)
}

export default auth
