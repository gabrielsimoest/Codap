export const collectionQuerystringSchema = {
  type: 'object',
  required: ['locale'],
  additionalProperties: false,
  properties: {
    locale: { type: 'string', enum: ['pt', 'en'] }
  }
}

/**
 * A atividade, sem `$id`: o `activityResponseSchema` de `GET /modules` tem um e
 * não pode ser registrado duas vezes. `additionalProperties: true` no `content`
 * é obrigatório pelo mesmo motivo de lá — o serializador apagaria o JSONB.
 */
const collectionActivitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    index: { type: 'integer' },
    type: { type: 'string' },
    content: { type: 'object', additionalProperties: true }
  },
  required: ['id', 'index', 'type', 'content']
}

export const collectionResponseSchema = {
  type: 'object',
  properties: {
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          index: { type: 'integer' },
          name: { type: 'string' },
          minLevel: { type: ['integer', 'null'] },
          xpReward: { type: ['integer', 'null'] },
          chest: { type: 'boolean' },
          moduleId: { type: 'integer' },
          areaId: { type: 'integer' },
          activities: { type: 'array', items: collectionActivitySchema }
        },
        required: ['id', 'index', 'name', 'minLevel', 'xpReward', 'chest', 'moduleId', 'areaId', 'activities']
      }
    }
  },
  required: ['lessons']
}
