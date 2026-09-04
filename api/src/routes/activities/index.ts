import { type FastifyPluginAsync } from 'fastify'
import create from './create.js'
import update from './update.js'
import remove from './remove.js'
import reorder from './reorder.js'

/**
 * Recurso exclusivo do dashboard de conteúdo. Não há `list`/`getById` aqui: o
 * app lê atividades por `GET /modules` (aninhadas, num idioma só) e o dashboard
 * por `GET /lessons` (aninhadas, todos os idiomas) — um terceiro caminho de
 * leitura só criaria mais uma forma de resposta para manter em sincronia.
 */
const activities: FastifyPluginAsync = async (fastify): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(create)
  await fastify.register(update)
  await fastify.register(remove)
  await fastify.register(reorder)
}

export default activities
