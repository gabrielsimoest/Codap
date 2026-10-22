import { type FastifyPluginAsync } from 'fastify'
import type { ReorderBody } from '../../types/contracts.js'
import { isSameIdSet } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { reorderModulesBodySchema } from './modules.schema.js'

interface ReorderModulesBody extends ReorderBody {
  areaId: number;
}

const reorder: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Body: ReorderModulesBody }>('/reorder', {
    schema: {
      description:
        'Renumera o `index` dos módulos de uma área para 0..n-1, na ordem de `orderedIds`. É a única forma de mudar a ordem: não há constraint única em (area_id, index), então escrever `index` avulso permitiria duplicatas e ordem não-determinística. Só existe em desenvolvimento.',
      tags: ['modules'],
      body: reorderModulesBodySchema,
      response: {
        204: { type: 'null', description: 'Módulos reordenados com sucesso.' },
        400: errorResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { areaId, orderedIds } = request.body

    const area = await fastify.prisma.areas.findUnique({ where: { id: areaId } })
    if (!area) {
      throw fastify.httpErrors.notFound('Área não encontrada.')
    }

    const modules = await fastify.prisma.modules.findMany({
      where: { area_id: areaId },
      select: { id: true }
    })

    if (!isSameIdSet(modules.map((module) => module.id), orderedIds)) {
      throw fastify.httpErrors.badRequest(
        'orderedIds precisa conter exatamente os módulos desta área, sem repetições.'
      )
    }

    await fastify.prisma.$transaction(
      orderedIds.map((id, index) =>
        fastify.prisma.modules.update({ where: { id }, data: { index } })
      )
    )

    return reply.code(204).send()
  })
}

export default reorder
