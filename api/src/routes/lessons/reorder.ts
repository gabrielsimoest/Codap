import { type FastifyPluginAsync } from 'fastify'
import type { ReorderBody } from '../../types/contracts.js'
import { isSameIdSet } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { reorderLessonsBodySchema } from './lessons.schema.js'

interface ReorderLessonsBody extends ReorderBody {
  moduleId: number;
}

const reorder: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.patch<{ Body: ReorderLessonsBody }>('/reorder', {
    schema: {
      description:
        'Renumera o `index` das lições de um módulo para 0..n-1, na ordem de `orderedIds`. Ver o endpoint equivalente de módulos para o porquê de a ordem não ser escrita via PATCH avulso. Só existe em desenvolvimento.',
      tags: ['lessons'],
      body: reorderLessonsBodySchema,
      response: {
        204: { type: 'null', description: 'Lições reordenadas com sucesso.' },
        400: errorResponseSchema,
        404: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { moduleId, orderedIds } = request.body

    const module = await fastify.prisma.modules.findUnique({ where: { id: moduleId } })
    if (!module) {
      throw fastify.httpErrors.notFound('Módulo não encontrado.')
    }

    const lessons = await fastify.prisma.lessons.findMany({
      where: { module_id: moduleId },
      select: { id: true }
    })

    if (!isSameIdSet(lessons.map((lesson) => lesson.id), orderedIds)) {
      throw fastify.httpErrors.badRequest(
        'orderedIds precisa conter exatamente as lições deste módulo, sem repetições.'
      )
    }

    await fastify.prisma.$transaction(
      orderedIds.map((id, index) =>
        fastify.prisma.lessons.update({ where: { id }, data: { index } })
      )
    )

    return reply.code(204).send()
  })
}

export default reorder
