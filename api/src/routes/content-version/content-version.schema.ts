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
    id: {
      type: 'integer',
      description:
        'Autoincrement, estritamente crescente. É por ele que o app compara versões (`id > guardado`), nunca pela string de versão.'
    },
    locale: { type: 'string' },
    version: { type: 'string' },
    changelog: {
      type: 'string',
      description: 'Escrito para o aluno: é o texto do aviso de "conteúdo atualizado" no app.'
    },
    releasedAt: {
      type: 'string',
      description: 'YYYY-MM-DD — a coluna é `@db.Date`, sem hora.'
    },
    announce: {
      type: 'boolean',
      description: 'Se a publicação aparece no aviso do app. Falso = atualização silenciosa.'
    }
  },
  required: ['id', 'locale', 'version', 'changelog', 'releasedAt', 'announce']
}

export const listContentVersionQuerystringSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    locale: {
      type: 'string',
      description:
        'Restringe a um idioma (forma que o app usa). Omitido, devolve a versão mais recente de cada idioma (forma que o dashboard usa). A resposta é sempre uma lista, nos dois casos.'
    },
    sinceId: {
      type: 'integer',
      minimum: 0,
      description:
        'Em vez da versão vigente, devolve **todas** as publicações do idioma com `id` maior que este, da mais nova para a mais antiga. Exige `locale`. É o que o app usa para montar o aviso de "conteúdo atualizado" de quem ficou várias publicações sem abrir.'
    }
  },
  // `sinceId` sem `locale` misturaria publicações de idiomas diferentes num
  // histórico só, e os `id` de idiomas distintos não são comparáveis entre si
  // para esse fim. O schema recusa com 400 em vez de devolver algo ambíguo.
  dependencies: { sinceId: ['locale'] }
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
    changelog: { type: 'string', minLength: 1 },
    announce: {
      type: 'boolean',
      description:
        'Mostra esta publicação no aviso de "conteúdo atualizado" do app. Omitido = `false` (atualização silenciosa — uma correção de digitação não deve interromper ninguém).'
    }
  }
}

export { errorResponseSchema }
