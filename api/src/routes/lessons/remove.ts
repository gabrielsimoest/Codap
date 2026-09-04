import { type FastifyPluginAsync } from 'fastify'
import { countLessonProgress, deleteLessonsCascade } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { lessonIdParamsSchema } from './lessons.schema.js'

interface RemoveLessonParams {
  id: number;
}

const remove: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete<{ Params: RemoveLessonParams }>('/:id', {
    schema: {
      description:
        'Remove uma lição e, em cascata, suas atividades e traduções. Falha com 409 se a lição já tiver progresso de usuário. Só existe em desenvolvimento.',
      tags: ['lessons'],
      params: lessonIdParamsSchema,
      response: {
        204: { type: 'null', description: 'Lição removida com sucesso.' },
        404: errorResponseSchema,
        409: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const existingLesson = await fastify.prisma.lessons.findUnique({ where: { id } })
    if (!existingLesson) {
      throw fastify.httpErrors.notFound('Lição não encontrada.')
    }

    const progressCount = await countLessonProgress(fastify.prisma, [id])
    if (progressCount > 0) {
      throw fastify.httpErrors.conflict(
        `Esta lição tem ${progressCount} registro(s) de progresso de usuário. Remover apagaria esse histórico.`
      )
    }

    await fastify.prisma.$transaction(async (tx) => {
      await deleteLessonsCascade(tx, [id])
    })

    return reply.code(204).send()
  })
}

export default remove
