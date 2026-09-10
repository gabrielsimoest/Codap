import { errorResponseSchema } from '../../utils/schemas.js'

/**
 * Três segmentos numéricos: `0.0.0`, `1.12.3`. Sem sufixo por enquanto.
 *
 * Escrito com `[0-9]` e `[.]` em vez de `\d` e `\.` de propósito: o padrão vive
 * numa string JS, onde uma barra invertida a menos passa despercebida e vira
 * outra coisa silenciosamente (`'\d'` é só `'d'`). Sem barra nenhuma, não há o
 * que escapar errado.
 */
export const VERSION_PATTERN = '^[0-9]+[.][0-9]+[.][0-9]+$'

export const contentVersionResponseSchema = {
  type: 'object',
  properties: {
    locale: { type: 'string' },
    version: { type: 'string' },
    changelog: { type: 'string' },
    releasedAt: {
      type: 'string',
      description: 'YYYY-MM-DD — a coluna é `@db.Date`, sem hora.'
    }
  },
  required: ['locale', 'version', 'changelog', 'releasedAt']
}

export const listContentVersionQuerystringSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    locale: {
      type: 'string',
      description:
        'Restringe a um idioma (forma que o app usa). Omitido, devolve a versão mais recente de cada idioma (forma que o dashboard usa). A resposta é sempre uma lista, nos dois casos.'
    }
  }
}

export const publishContentVersionBodySchema = {
  type: 'object',
  required: ['locale', 'version', 'changelog'],
  additionalProperties: false,
  properties: {
    locale: {
      type: 'string',
      description:
        'Validado contra a tabela `locales`, não contra um enum — é o que permite publicar para um idioma novo sem alterar código da API.'
    },
    version: { type: 'string', pattern: VERSION_PATTERN },
    changelog: { type: 'string', minLength: 1 }
  }
}

export { errorResponseSchema }
