import { errorResponseSchema } from '../../utils/schemas.js'
import { VERSION_PATTERN } from '../content-version/content-version.schema.js'

export const appVersionResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Autoincrement: ordem de publicação.' },
    locale: { type: 'string' },
    version: { type: 'string', description: 'Três segmentos numéricos (`1.2.0`). O app compara por semver.' },
    changelog: { type: 'string', description: 'Escrito para quem usa o app.' },
    needUpdate: {
      type: 'boolean',
      description: 'Verdadeiro = a versão traz algo sem o qual o app não funciona direito; o aviso é mais enfático. Nunca bloqueia o uso.'
    },
    releasedAt: { type: 'string', description: 'YYYY-MM-DD — a coluna é `@db.Date`, sem hora.' }
  },
  required: ['id', 'locale', 'version', 'changelog', 'needUpdate', 'releasedAt']
}

export const listAppVersionQuerystringSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    locale: {
      type: 'string',
      description: 'Devolve o histórico deste idioma (forma que o app usa). Omitido, devolve a versão mais recente de cada idioma (forma que o dashboard usa).'
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 50,
      default: 20,
      description: 'Quantas publicações do histórico devolver (só com `locale`).'
    }
  }
}

export const publishAppVersionBodySchema = {
  type: 'object',
  required: ['version', 'changelogs'],
  additionalProperties: false,
  properties: {
    version: { type: 'string', pattern: VERSION_PATTERN },
    needUpdate: {
      type: 'boolean',
      description: 'Omitido = `false` (recomendada). Verdadeiro = traz algo sem o qual o app não funciona direito.'
    },
    changelogs: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['locale', 'changelog'],
        additionalProperties: false,
        properties: {
          locale: { type: 'string', description: 'Validado contra a tabela `locales`, não contra um enum.' },
          changelog: { type: 'string', minLength: 1 }
        }
      }
    }
  }
}

export { errorResponseSchema }
