import { type FastifyPluginAsync } from 'fastify'
import {
  appVersionResponseSchema,
  errorResponseSchema,
  listAppVersionQuerystringSchema
} from './app-version.schema.js'
import { findAppVersionHistory, findLatestAppVersions } from '../../utils/appVersion.js'

interface ListAppVersionQuerystring {
  locale?: string;
  limit?: number;
}

const list: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: ListAppVersionQuerystring }>('/', {
    schema: {
      description:
        'Versões publicadas do aplicativo, sempre como lista: a mais recente de cada idioma, ou — com `locale` — o histórico daquele idioma, da mais nova para a mais antiga. É o que o app consulta ao abrir (com rede) para avisar de uma nova versão e para mostrar o histórico em Configurações. **Existe em produção**; só a publicação é exclusiva de desenvolvimento. Idioma sem texto de uma versão usa, para essa versão, o texto em inglês (`locale` da entrada diz de qual idioma veio) — assim o aviso nunca some para quem usa um idioma ainda sem changelog. Sem nenhuma publicação, devolve lista vazia, não 404.',
      tags: ['appVersion'],
      querystring: listAppVersionQuerystringSchema,
      response: {
        200: { type: 'array', items: appVersionResponseSchema },
        400: errorResponseSchema
      }
    }
  }, async (request) => {
    const { locale, limit = 20 } = request.query

    if (locale !== undefined) {
      return await findAppVersionHistory(fastify.prisma, locale, limit)
    }
    return await findLatestAppVersions(fastify.prisma)
  })
}

export default list
