import { type FastifyPluginAsync } from 'fastify'
import { errorResponseSchema } from '../../utils/schemas.js'
import { activityIdParamsSchema } from './activities.schema.js'

interface RemoveActivityParams {
  id: number;
}

const remove: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete<{ Params: RemoveActivityParams }>('/:id', {
    schema: {
      description:
        'Remove uma atividade e suas traduções. Não há checagem de progresso aqui: o progresso do usuário é registrado por lição (`user_lessons`), nunca por atividade — remover uma atividade não apaga histórico de ninguém. Só existe em desenvolvimento.',
      tags: ['activities'],
      params: activityIdParamsSchema,
      response: {
        204: { type: 'null', description: 'Atividade removida com sucesso.' },
        404: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const existingActivity = await fastify.prisma.activities.findUnique({ where: { id } })
    if (!existingActivity) {
      throw fastify.httpErrors.notFound('Atividade não encontrada.')
    }

    await fastify.prisma.$transaction(async (tx) => {
      await tx.activity_translations.deleteMany({ where: { activity_id: id } })
      await tx.activities.delete({ where: { id } })
    })

    return reply.code(204).send()
  })
}

export default remove
