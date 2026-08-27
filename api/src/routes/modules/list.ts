import { type FastifyPluginAsync } from 'fastify'
import { listModulesQuerystringSchema, moduleResponseSchema } from './modules.schema.js'

interface ListQuerystring {
  areaId: number;
  locale: 'pt' | 'en';
}

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: ListQuerystring }>('/', {
    schema: {
      description: 'Lista os módulos de uma área (e as lições de cada módulo, se houver), com o nome traduzido no idioma informado.',
      tags: ['modules'],
      querystring: listModulesQuerystringSchema,
      response: {
        200: {
          type: 'array',
          items: moduleResponseSchema
        }
      }
    }
  }, async (request) => {
    const { areaId, locale } = request.query

    const modules = await fastify.prisma.modules.findMany({
      where: { area_id: areaId },
      select: {
        id: true,
        area_id: true,
        index: true,
        translations: {
          where: { locale: { locale } },
          select: { name: true },
          take: 1
        },
        lessons: {
          select: {
            id: true,
            index: true,
            translations: {
              where: { locale: { locale } },
              select: { name: true },
              take: 1
            }
          },
          orderBy: { index: 'asc' }
        }
      },
      orderBy: { index: 'asc' }
    })

    return modules.map((module) => ({
      id: module.id,
      areaId: module.area_id,
      index: module.index,
      name: module.translations[0]?.name ?? '',
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        index: lesson.index,
        name: lesson.translations[0]?.name ?? ''
      }))
    }))
  })
}

export default list
