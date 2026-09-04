import { type FastifyPluginAsync } from 'fastify'
import type { ReorderBody } from '../../types/contracts.js'
import { isSameIdSet } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { reorderActivitiesBodySchema } from './activities.schema.js'

interface ReorderActivitiesBody extends ReorderBody {
  lessonId: number;
}

const reorder: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Body: ReorderActivitiesBody }>('/reorder', {
    schema: {
      description:
        'Renumera o `index` das atividades de uma lição para 0..n-1, na ordem de `orderedIds`. Ver o endpoint equivalente de módulos para o porquê de a ordem não ser escrita via PATCH avulso. Só existe em desenvolvimento.',
      tags: ['activities'],
      body: reorderActivitiesBodySchema,
      response: {
        204: { type: 'null', description: 'Atividades reordenadas com sucesso.' },
        400: errorResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { lessonId, orderedIds } = request.body

    const lesson = await fastify.prisma.lessons.findUnique({ where: { id: lessonId } })
    if (!lesson) {
      throw fastify.httpErrors.notFound('Lição não encontrada.')
    }

    const activities = await fastify.prisma.activities.findMany({
      where: { lesson_id: lessonId },
      select: { id: true }
    })

    if (!isSameIdSet(activities.map((activity) => activity.id), orderedIds)) {
      throw fastify.httpErrors.badRequest(
        'orderedIds precisa conter exatamente as atividades desta lição, sem repetições.'
      )
    }

    await fastify.prisma.$transaction(
      orderedIds.map((id, index) =>
        fastify.prisma.activities.update({ where: { id }, data: { index } })
      )
    )

    return reply.code(204).send()
  })
}

export default reorder
