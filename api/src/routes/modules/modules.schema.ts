export const listModulesQuerystringSchema = {
  type: 'object',
  required: ['areaId', 'locale'],
  additionalProperties: false,
  properties: {
    areaId: { type: 'integer' },
    locale: { type: 'string', enum: ['pt', 'en'] }
  }
}

export const lessonSummarySchema = {
  $id: 'lessonSummary',
  type: 'object',
  properties: {
    id: { type: 'integer' },
    index: { type: 'integer' },
    name: { type: 'string' }
  },
  required: ['id', 'index', 'name']
}

export const moduleResponseSchema = {
  $id: 'moduleResponse',
  type: 'object',
  properties: {
    id: { type: 'integer' },
    areaId: { type: 'integer' },
    index: { type: 'integer' },
    name: { type: 'string' },
    lessons: { type: 'array', items: lessonSummarySchema }
  },
  required: ['id', 'areaId', 'index', 'name', 'lessons']
}
