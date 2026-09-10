import { type FastifyPluginAsync } from 'fastify'
import {
  contentVersionResponseSchema,
  listContentVersionQuerystringSchema
} from './content-version.schema.js'
import { findLatestContentVersions } from '../../utils/contentVersion.js'

interface ListContentVersionQuerystring {
  locale?: string;
}

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: ListContentVersionQuerystring }>('/', {
    schema: {
      description:
        'Versão publicada do conteúdo, sempre como lista: a mais recente de cada idioma, ou só a de `locale` quando informado. Ao contrário das rotas de escrita do catálogo, **existe em produção** — é o app que a consome. Idioma sem nenhuma publicação devolve lista vazia, não 404: para o app isso significa "não há o que comparar", e ele mantém o cache.',
      tags: ['contentVersion'],
      querystring: listContentVersionQuerystringSchema,
      response: {
        200: { type: 'array', items: contentVersionResponseSchema }
      }
    }
  }, async (request) => {
    return await findLatestContentVersions(fastify.prisma, request.query.locale)
  })
}

export default list
