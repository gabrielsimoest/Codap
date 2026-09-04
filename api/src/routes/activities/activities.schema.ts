export const activityIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' }
  }
}

/**
 * `content` por idioma, parcial de propósito — ver `TranslationMap` em
 * `src/types/contracts.ts`.
 *
 * **`additionalProperties: true` em cada idioma é obrigatório.** O
 * fast-json-stringify apaga toda propriedade não declarada num `type: 'object'`
 * — sem essa flag o `content` seria serializado como `{}` na resposta,
 * silenciosamente, e o JSONB inteiro se perderia (ver api/CLAUDE.md). Pelo
 * mesmo motivo do schema de `GET /modules`, também **não** é um `oneOf` das
 * variantes conhecidas: um `content` de um `type` novo precisa atravessar sem
 * que a API precise conhecê-lo.
 */
const activityContentByLocale = {
  pt: { type: 'object', additionalProperties: true },
  en: { type: 'object', additionalProperties: true }
}

/** Corpo de escrita: pelo menos um idioma precisa vir. */
const activityContentMapSchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: activityContentByLocale
}

/**
 * Resposta: sem `minProperties`. Uma atividade recém-criada num idioma só
 * devolve um mapa de uma chave, e nada impede que uma atividade legada não
 * tenha tradução nenhuma — a resposta precisa conseguir representar isso.
 */
const activityContentMapResponseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: activityContentByLocale
}

export const adminActivityResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    lessonId: { type: 'integer' },
    index: { type: 'integer' },
    type: { type: 'string' },
    content: activityContentMapResponseSchema
  },
  required: ['id', 'lessonId', 'index', 'type', 'content']
}

export const createActivityBodySchema = {
  type: 'object',
  required: ['lessonId', 'type', 'content'],
  additionalProperties: false,
  properties: {
    lessonId: { type: 'integer' },
    index: { type: 'integer', minimum: 0, description: 'Omitido = append no fim.' },
    type: {
      type: 'string',
      minLength: 1,
      maxLength: 25,
      description:
        "Discriminador do formato de `content` (`activities.type`, VarChar(25) livre — não há enum no banco). O app hoje renderiza 'theory' e 'option'; um tipo desconhecido é ignorado por ele, não rejeitado aqui."
    },
    content: activityContentMapSchema
  }
}

export const updateActivityBodySchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: {
    type: { type: 'string', minLength: 1, maxLength: 25 },
    content: activityContentMapSchema
  }
}

export const reorderActivitiesBodySchema = {
  type: 'object',
  required: ['lessonId', 'orderedIds'],
  additionalProperties: false,
  properties: {
    lessonId: { type: 'integer' },
    orderedIds: {
      type: 'array',
      items: { type: 'integer' },
      description: 'Precisa ser exatamente o conjunto de atividades da lição, na ordem desejada.'
    }
  }
}
