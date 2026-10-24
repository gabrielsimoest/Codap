import { type FastifyPluginAsync } from 'fastify'
import list from './list.js'
import create from './create.js'

/**
 * Mesma assimetria de `content-version`: a leitura existe em **qualquer**
 * ambiente (é o app em produção que a consome), e só a publicação segue o gate
 * de desenvolvimento das demais rotas de escrita.
 */
const appVersion: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(list)

  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(create)
}

export default appVersion
