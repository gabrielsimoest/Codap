import { type FastifyPluginAsync } from 'fastify'
import {
  contentVersionResponseSchema,
  errorResponseSchema,
  listContentVersionQuerystringSchema
} from './content-version.schema.js'
import { findContentVersionsSince, findLatestContentVersions } from '../../utils/contentVersion.js'

interface ListContentVersionQuerystring {
  locale?: string;
  sinceId?: number;
}

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: ListContentVersionQuerystring }>('/', {
    schema: {
      description:
        'Versão publicada do conteúdo, sempre como lista: a mais recente de cada idioma, ou só a de `locale` quando informado. Com `sinceId` (que exige `locale`), devolve todas as publicações do idioma posteriores a esse `id`, da mais nova para a mais antiga. Ao contrário das rotas de escrita do catálogo, **existe em produção** — é o app que a consome. Idioma sem nenhuma publicação devolve lista vazia, não 404: para o app isso significa "não há o que comparar", e ele mantém o cache.',
      tags: ['contentVersion'],
      querystring: listContentVersionQuerystringSchema,
      response: {
        200: { type: 'array', items: contentVersionResponseSchema },
        400: errorResponseSchema
      }
    }
  }, async (request) => {
    const { locale, sinceId } = request.query

    // O schema garante que `sinceId` só chega acompanhado de `locale`.
    if (sinceId !== undefined && locale !== undefined) {
      return await findContentVersionsSince(fastify.prisma, locale, sinceId)
    }

    return await findLatestContentVersions(fastify.prisma, locale)
  })
}

export default list
