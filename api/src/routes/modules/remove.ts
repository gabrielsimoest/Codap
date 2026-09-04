import { type FastifyPluginAsync } from 'fastify'
import { countLessonProgress, deleteModulesCascade } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { moduleIdParamsSchema } from './modules.schema.js'

interface RemoveModuleParams {
  id: number;
}

const remove: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete<{ Params: RemoveModuleParams }>('/:id', {
    schema: {
      description:
        'Remove um módulo e, em cascata, suas lições, atividades e traduções. Falha com 409 se alguma lição já tiver progresso de usuário. Só existe em desenvolvimento.',
      tags: ['modules'],
      params: moduleIdParamsSchema,
      response: {
        204: { type: 'null', description: 'Módulo removido com sucesso.' },
        404: errorResponseSchema,
        409: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const existingModule = await fastify.prisma.modules.findUnique({ where: { id } })
    if (!existingModule) {
      throw fastify.httpErrors.notFound('Módulo não encontrado.')
    }

    const lessons = await fastify.prisma.lessons.findMany({
      where: { module_id: id },
      select: { id: true }
    })

    const progressCount = await countLessonProgress(
      fastify.prisma,
      lessons.map((lesson) => lesson.id)
    )
    if (progressCount > 0) {
      throw fastify.httpErrors.conflict(
        `Este módulo tem ${progressCount} registro(s) de progresso de usuário em suas lições. Remover apagaria esse histórico.`
      )
    }

    await fastify.prisma.$transaction(async (tx) => {
      await deleteModulesCascade(tx, [id])
    })

    return reply.code(204).send()
  })
}

export default remove
