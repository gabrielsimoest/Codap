import { type FastifyPluginAsync } from 'fastify'
import { errorResponseSchema } from '../../utils/schemas.js'
import { countLessonProgress, deleteModulesCascade } from '../../utils/content.js'
import { areaIdParamsSchema } from './areas.schema.js'

interface RemoveAreaParams {
  id: number;
}

const remove: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete<{ Params: RemoveAreaParams }>('/:id', {
    schema: {
      description:
        'Remove uma área e, em cascata, seus módulos, lições, atividades e todas as traduções. Falha com 409 se alguma lição já tiver progresso de usuário. Só existe em desenvolvimento.',
      tags: ['areas'],
      params: areaIdParamsSchema,
      response: {
        204: { type: 'null', description: 'Área removida com sucesso.' },
        404: errorResponseSchema,
        409: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const existingArea = await fastify.prisma.areas.findUnique({ where: { id } })
    if (!existingArea) {
      throw fastify.httpErrors.notFound('Área não encontrada.')
    }

    const lessons = await fastify.prisma.lessons.findMany({
      where: { module: { area_id: id } },
      select: { id: true }
    })
    const lessonIds = lessons.map((lesson) => lesson.id)

    const progressCount = await countLessonProgress(fastify.prisma, lessonIds)
    if (progressCount > 0) {
      throw fastify.httpErrors.conflict(
        `Esta área tem ${progressCount} registro(s) de progresso de usuário em suas lições. Remover apagaria esse histórico.`
      )
    }

    await fastify.prisma.$transaction(async (tx) => {
      const modules = await tx.modules.findMany({
        where: { area_id: id },
        select: { id: true }
      })
      await deleteModulesCascade(tx, modules.map((module) => module.id))
      await tx.areas.delete({ where: { id } })
    })

    return reply.code(204).send()
  })
}

export default remove
