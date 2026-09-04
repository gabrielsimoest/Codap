import { type FastifyPluginAsync } from 'fastify'
import { findAdminLessons } from '../../utils/content.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { adminLessonResponseSchema, listLessonsQuerystringSchema } from './lessons.schema.js'

interface ListLessonsQuerystring {
  moduleId: number;
}

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: ListLessonsQuerystring }>('/', {
    schema: {
      description:
        'Lista as lições de um módulo com TODAS as traduções e as atividades de cada uma. Complementa `GET /modules`, que resolve tudo num idioma só: aqui o dashboard vê os dois idiomas lado a lado e distingue "sem tradução" de "tradução vazia". Recorte estreito de propósito — permite atualizar o painel de um módulo sem rebuscar a área inteira. Só existe em desenvolvimento.',
      tags: ['lessons'],
      querystring: listLessonsQuerystringSchema,
      response: {
        200: { type: 'array', items: adminLessonResponseSchema },
        404: errorResponseSchema
      }
    }
  }, async (request) => {
    const { moduleId } = request.query

    const module = await fastify.prisma.modules.findUnique({ where: { id: moduleId } })
    if (!module) {
      throw fastify.httpErrors.notFound('Módulo não encontrado.')
    }

    return await findAdminLessons(fastify.prisma, { module_id: moduleId })
  })
}

export default list
