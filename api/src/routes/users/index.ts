import { type FastifyPluginAsync } from 'fastify'
import create from './create.js'
import list from './list.js'
import getById from './getById.js'
import update from './update.js'
import remove from './remove.js'

const users: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Sem autenticação e sem nenhum cliente (o app cria e lê a conta por /auth):
  // aberto em produção, qualquer pessoa listaria e-mails, trocaria a senha ou o
  // e-mail de outra conta, apagaria contas e escreveria XP e Bits. Fora de
  // desenvolvimento a rota não existe e a API responde 404, como na escrita do
  // catálogo.
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(create)
  await fastify.register(list)
  await fastify.register(getById)
  await fastify.register(update)
  await fastify.register(remove)
}

export default users
