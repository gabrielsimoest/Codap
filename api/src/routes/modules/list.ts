import { type FastifyPluginAsync } from 'fastify'
import { listModulesQuerystringSchema, moduleResponseSchema } from './modules.schema.js'

interface ListQuerystring {
  areaId: number;
  locale: 'pt' | 'en';
  includeChest?: boolean;
}

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: ListQuerystring }>('/', {
    schema: {
      description: 'Lista os módulos de uma área, com as lições de cada módulo e as atividades de cada lição aninhadas, tudo traduzido no idioma informado. É a única chamada necessária para montar o catálogo e o conteúdo de uma área.',
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
    const { areaId, locale, includeChest } = request.query

    // As aulas do baú são por usuário e o catálogo é igual para todos (e cacheado
    // para sempre no app): ficam fora. O dashboard as enxerga por um parâmetro
    // que só vale em desenvolvimento.
    const withChest = includeChest === true && process.env.NODE_ENV === 'development'

    const modules = await fastify.prisma.modules.findMany({
      where: { area_id: areaId },
      select: {
        id: true,
        area_id: true,
        index: true,
        translations: {
          where: { locale: { locale } },
          select: { name: true, subtitle: true },
          take: 1
        },
        lessons: {
          where: withChest ? {} : { is_chest: false },
          select: {
            id: true,
            index: true,
            min_level: true,
            xp_reward: true,
            is_chest: true,
            translations: {
              where: { locale: { locale } },
              select: { name: true },
              take: 1
            },
            activities: {
              select: {
                id: true,
                index: true,
                type: true,
                translations: {
                  where: { locale: { locale } },
                  select: { content: true },
                  take: 1
                }
              },
              orderBy: { index: 'asc' }
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
      subtitle: module.translations[0]?.subtitle ?? '',
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        index: lesson.index,
        name: lesson.translations[0]?.name ?? '',
        minLevel: lesson.min_level,
        xpReward: lesson.xp_reward,
        chest: lesson.is_chest,
        activities: lesson.activities.map((activity) => ({
          id: activity.id,
          index: activity.index,
          type: activity.type,
          content: activity.translations[0]?.content ?? {}
        }))
      }))
    }))
  })
}

export default list
