export const lessonIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' }
  }
}

export const listLessonsQuerystringSchema = {
  type: 'object',
  required: ['moduleId'],
  additionalProperties: false,
  properties: {
    moduleId: { type: 'integer' }
  }
}

const lessonTranslationInputSchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 }
  }
}

/**
 * Mapa de traduções por idioma, parcial de propósito — ver `TranslationMap` em
 * `src/types/contracts.ts`. `minProperties: 1` só impede um mapa vazio.
 */
const lessonTranslationsSchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: {
    pt: lessonTranslationInputSchema,
    en: lessonTranslationInputSchema
  }
}

/**
 * `content` por idioma. Mesma regra do schema de resposta de `GET /modules`:
 * `additionalProperties: true` é **obrigatório**, senão o fast-json-stringify
 * apaga silenciosamente todo o JSONB (ver api/CLAUDE.md). E continua sem
 * `oneOf`: a API transporta o conteúdo fielmente, sem conhecer cada `type`.
 */
const activityContentMapSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pt: { type: 'object', additionalProperties: true },
    en: { type: 'object', additionalProperties: true }
  }
}

export const adminActivityResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    lessonId: { type: 'integer' },
    index: { type: 'integer' },
    type: { type: 'string' },
    content: activityContentMapSchema
  },
  required: ['id', 'lessonId', 'index', 'type', 'content']
}

export const adminLessonResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    moduleId: { type: 'integer' },
    index: { type: 'integer' },
    translations: {
      type: 'object',
      additionalProperties: false,
      properties: {
        pt: lessonTranslationInputSchema,
        en: lessonTranslationInputSchema
      },
      description: 'Todas as traduções da lição. Um idioma sem tradução não aparece aqui.'
    },
    activities: { type: 'array', items: adminActivityResponseSchema }
  },
  required: ['id', 'moduleId', 'index', 'translations', 'activities']
}

export const createLessonBodySchema = {
  type: 'object',
  required: ['moduleId', 'translations'],
  additionalProperties: false,
  properties: {
    moduleId: { type: 'integer' },
    index: { type: 'integer', minimum: 0, description: 'Omitido = append no fim.' },
    translations: lessonTranslationsSchema
  }
}

export const updateLessonBodySchema = {
  type: 'object',
  required: ['translations'],
  additionalProperties: false,
  properties: {
    translations: lessonTranslationsSchema
  }
}

export const reorderLessonsBodySchema = {
  type: 'object',
  required: ['moduleId', 'orderedIds'],
  additionalProperties: false,
  properties: {
    moduleId: { type: 'integer' },
    orderedIds: {
      type: 'array',
      items: { type: 'integer' },
      description: 'Precisa ser exatamente o conjunto de lições do módulo, na ordem desejada.'
    }
  }
}
