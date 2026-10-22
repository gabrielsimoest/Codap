import { type FastifyPluginAsync } from 'fastify'
import { shopErrorSchema, useHintResponseSchema } from './shop.schema.js'

const useHint: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/use-hint', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 20, timeWindow: '1 minute' }
    },
    schema: {
      description: 'Usa uma dica instantânea do estoque do usuário logado. Exige internet de propósito: o consumo é validado no servidor, sem log de consumo offline. Sem estoque, 409 `no_hints` e nada muda.',
      tags: ['shop'],
      response: {
        200: useHintResponseSchema,
        401: { type: 'object', description: 'Access token ausente ou inválido.' },
        409: shopErrorSchema
      }
    }
  }, async (request) => {
    const userId = request.user.id

    // Um único UPDATE condicional: sem estoque, nenhuma linha muda — não há
    // janela entre "conferir" e "gastar" para duas requisições passarem juntas.
    const spent = await fastify.prisma.users.updateMany({
      where: { id: userId, instant_hints: { gt: 0 } },
      data: { instant_hints: { decrement: 1 } }
    })
    if (spent.count === 0) {
      throw fastify.httpErrors.conflict('no_hints')
    }

    const { instant_hints: instantHints } = await fastify.prisma.users.findUniqueOrThrow({
      where: { id: userId },
      select: { instant_hints: true }
    })
    return { instantHints }
  })
}

export default useHint
