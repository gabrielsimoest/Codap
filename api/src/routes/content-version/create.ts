import { type FastifyPluginAsync } from 'fastify'
import type { PublishContentVersionBody } from '../../types/contracts.js'
import { errorResponseSchema } from '../../utils/schemas.js'
import { findLatestContentVersions } from '../../utils/contentVersion.js'
import {
  contentVersionResponseSchema,
  publishContentVersionBodySchema
} from './content-version.schema.js'

const create: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: PublishContentVersionBody }>('/', {
    schema: {
      description:
        'Publica uma nova versão do conteúdo de um idioma. `released_at` é preenchido pelo servidor, nunca vem do cliente. Só existe em desenvolvimento.',
      tags: ['contentVersion'],
      body: publishContentVersionBodySchema,
      response: {
        201: contentVersionResponseSchema,
        404: errorResponseSchema,
        409: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { locale, version, changelog } = request.body

    // Idioma validado contra a tabela, não contra um enum no schema: é o que
    // permite publicar para um idioma novo sem alterar código da API.
    const localeRow = await fastify.prisma.locales.findFirst({ where: { locale } })
    if (!localeRow) {
      throw fastify.httpErrors.notFound(`Idioma "${locale}" não encontrado.`)
    }

    const [current] = await findLatestContentVersions(fastify.prisma, locale)
    if (current?.version === version) {
      // Republicar o mesmo número seria um no-op silencioso: o app compara por
      // diferença, não veria mudança nenhuma, e ninguém receberia o conteúdo
      // novo. Um botão "publicar" que não publica é pior que um erro.
      throw fastify.httpErrors.conflict(
        `A versão ${version} já é a mais recente de "${locale}". Use um número diferente.`
      )
    }

    // Versão MENOR é permitida de propósito: rollback é legítimo, e o app
    // rebusca por divergência, não por ordem.
    const created = await fastify.prisma.content_version.create({
      data: {
        locale_id: localeRow.id,
        version,
        changelog,
        released_at: new Date()
      },
      select: {
        version: true,
        changelog: true,
        released_at: true,
        locale: { select: { locale: true } }
      }
    })

    return reply.code(201).send({
      locale: created.locale.locale,
      version: created.version,
      changelog: created.changelog,
      releasedAt: created.released_at.toISOString().slice(0, 10)
    })
  })
}

export default create
