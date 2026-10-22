import { type FastifyPluginAsync } from 'fastify'
import { buildShopState } from '../../utils/shopState.js'
import { shopStateResponseSchema } from './shop.schema.js'

const state: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 60, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Estado da loja do usuário logado: preços (em Bits, definidos no servidor), saldo, dicas instantâneas, a janela de Dobro de XP que ainda não terminou e quantas aulas do baú cada área tem e quantas ele já revelou.',
      tags: ['shop'],
      response: {
        200: shopStateResponseSchema,
        401: { type: 'object', description: 'Access token ausente ou inválido.' }
      }
    }
  }, async (request) => {
    return await buildShopState(fastify.prisma, request.user.id)
  })
}

export default state
