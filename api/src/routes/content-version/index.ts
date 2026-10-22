import { type FastifyPluginAsync } from 'fastify'
import list from './list.js'
import create from './create.js'

/**
 * Assimetria proposital em relação ao resto do catálogo: o `list` fica
 * registrado em **qualquer** ambiente, porque é o app em produção que o
 * consome para decidir se precisa rebuscar o conteúdo. Só a publicação segue o
 * gate de desenvolvimento das demais rotas de escrita.
 */
const contentVersion: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(list)

  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(create)
}

export default contentVersion
