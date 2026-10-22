import { type FastifyPluginAsync } from 'fastify'
import { enforceTheoryPersonaRule, findFirstTheoryId } from '../../utils/theoryRules.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { activityIdParamsSchema } from './activities.schema.js'

interface RemoveActivityParams {
  id: number;
}

const remove: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete<{ Params: RemoveActivityParams }>('/:id', {
    schema: {
      description:
        'Remove uma atividade e suas traduções. Não há checagem de progresso aqui: o progresso do usuário é registrado por lição (`user_lessons`), nunca por atividade — remover uma atividade não apaga histórico de ninguém. Responde 422 se remover uma teoria deixasse outra, de persona neutra, como a primeira da lição — mude a persona dela antes. Só existe em desenvolvimento.',
      tags: ['activities'],
      params: activityIdParamsSchema,
      response: {
        204: { type: 'null', description: 'Atividade removida com sucesso.' },
        404: errorResponseSchema,
        422: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const existingActivity = await fastify.prisma.activities.findUnique({ where: { id } })
    if (!existingActivity) {
      throw fastify.httpErrors.notFound('Atividade não encontrada.')
    }

    await fastify.prisma.$transaction(async (tx) => {
      const firstTheoryBefore = await findFirstTheoryId(tx, existingActivity.lesson_id)

      await tx.activity_translations.deleteMany({ where: { activity_id: id } })
      await tx.activities.delete({ where: { id } })

      await enforceTheoryPersonaRule(tx, fastify, existingActivity.lesson_id, firstTheoryBefore)
    })

    return reply.code(204).send()
  })
}

export default remove
