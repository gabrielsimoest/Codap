export const syncEventInputSchema = {
  type: 'object',
  required: ['clientEventId', 'type', 'occurredAt', 'payload'],
  additionalProperties: false,
  properties: {
    clientEventId: { type: 'string', format: 'uuid' },
    type: { type: 'string', enum: ['lesson_completed', 'achievement_unlocked'] },
    occurredAt: { type: 'string', format: 'date-time' },
    payload: {
      type: 'object',
      additionalProperties: false,
      properties: {
        lessonId: { type: 'integer' },
        achievementId: { type: 'integer' }
      }
    }
  }
}

export const syncRequestBodySchema = {
  type: 'object',
  required: ['events'],
  additionalProperties: false,
  properties: {
    events: {
      type: 'array',
      maxItems: 100,
      items: syncEventInputSchema
    }
  }
}

export const syncResponseSchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clientEventId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['applied', 'duplicate', 'error'] },
          error: { type: 'string' }
        },
        required: ['clientEventId', 'status']
      }
    }
  },
  required: ['results']
}
