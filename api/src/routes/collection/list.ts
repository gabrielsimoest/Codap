import { type FastifyPluginAsync } from 'fastify'
import type { CollectionResponse } from '../../types/contracts.js'
import { collectionQuerystringSchema, collectionResponseSchema } from './collection.schema.js'

interface ListQuerystring {
  locale: 'pt' | 'en';
}

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: ListQuerystring }>('/', {
    preHandler: fastify.authenticate,
    config: {
      rateLimit: { max: 60, timeWindow: '1 minute' }
    },
    schema: {
      description: 'A coleção do usuário logado: as aulas exclusivas do baú que ele já revelou, com as atividades, traduzidas no idioma informado. É o único caminho até elas — `GET /modules` nunca as devolve —, e uma aula não revelada nunca aparece aqui. Cada item traz `moduleId` e `areaId` para o app encaixá-la ao fim do módulo dela.',
      tags: ['collection'],
      querystring: collectionQuerystringSchema,
      response: {
        200: collectionResponseSchema,
        401: { type: 'object', description: 'Access token ausente ou inválido.' }
      }
    }
  }, async (request): Promise<CollectionResponse> => {
    const { locale } = request.query

    const rows = await fastify.prisma.user_chest_lessons.findMany({
      // `is_chest` de novo: uma aula devolvida à trilha pelo dashboard já está em
      // `GET /modules` e não pode aparecer nos dois lugares.
      where: { user_id: request.user.id, lesson: { is_chest: true } },
      orderBy: [{ revealed_at: 'asc' }, { id: 'asc' }],
      select: {
        lesson: {
          select: {
            id: true,
            index: true,
            min_level: true,
            xp_reward: true,
            is_chest: true,
            module: { select: { id: true, area_id: true } },
            translations: { where: { locale: { locale } }, select: { name: true }, take: 1 },
            activities: {
              select: {
                id: true,
                index: true,
                type: true,
                translations: { where: { locale: { locale } }, select: { content: true }, take: 1 }
              },
              orderBy: { index: 'asc' }
            }
          }
        }
      }
    })

    return {
      lessons: rows.map(({ lesson }) => ({
        id: lesson.id,
        index: lesson.index,
        name: lesson.translations[0]?.name ?? '',
        minLevel: lesson.min_level,
        xpReward: lesson.xp_reward,
        chest: lesson.is_chest,
        moduleId: lesson.module.id,
        areaId: lesson.module.area_id,
        activities: lesson.activities.map((activity) => ({
          id: activity.id,
          index: activity.index,
          type: activity.type,
          content: activity.translations[0]?.content ?? {}
        }))
      }))
    }
  })
}

export default list
