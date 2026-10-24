import { type FastifyPluginAsync } from 'fastify'
import type { PublishAppVersionBody } from '../../types/contracts.js'
import { APP_VERSION_SELECT, findLatestAppVersions, toAppVersionResponse } from '../../utils/appVersion.js'
import { appVersionResponseSchema, errorResponseSchema, publishAppVersionBodySchema } from './app-version.schema.js'

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: PublishAppVersionBody }>('/', {
    schema: {
      description:
        'Publica uma nova versão do aplicativo, com um texto por idioma, numa transação só (ou todos os idiomas entram, ou nenhum). `released_at` é preenchido pelo servidor. Só existe em desenvolvimento.',
      tags: ['appVersion'],
      body: publishAppVersionBodySchema,
      response: {
        201: { type: 'array', items: appVersionResponseSchema },
        400: errorResponseSchema,
        404: errorResponseSchema,
        409: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { version, needUpdate = false, changelogs } = request.body

    const locales = changelogs.map((entry) => entry.locale)
    if (new Set(locales).size !== locales.length) {
      throw fastify.httpErrors.badRequest('Há um idioma repetido em `changelogs`.')
    }

    // Idioma validado contra a tabela, não contra um enum: permite publicar para
    // um idioma novo sem alterar código da API.
    const localeRows = await fastify.prisma.locales.findMany({ where: { locale: { in: locales } } })
    for (const code of locales) {
      if (!localeRows.some((row) => row.locale === code)) {
        throw fastify.httpErrors.notFound(`Idioma "${code}" não encontrado.`)
      }
    }

    // Republicar o mesmo número seria um no-op silencioso: o app compara a
    // versão instalada com a mais recente e não veria mudança.
    const latest = await findLatestAppVersions(fastify.prisma)
    for (const code of locales) {
      if (latest.find((entry) => entry.locale === code)?.version === version) {
        throw fastify.httpErrors.conflict(
          `A versão ${version} já é a mais recente de "${code}". Use um número diferente.`
        )
      }
    }

    const created = await fastify.prisma.$transaction(
      changelogs.map((entry) => fastify.prisma.app_version.create({
        data: {
          locale_id: localeRows.find((row) => row.locale === entry.locale)!.id,
          version,
          changelog: entry.changelog,
          need_update: needUpdate,
          released_at: new Date()
        },
        select: APP_VERSION_SELECT
      }))
    )

    return await reply.code(201).send(created.map(toAppVersionResponse))
  })
}

export default create
