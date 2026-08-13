export const userResponseSchema = {
  $id: 'userResponse',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    xp: { type: ['integer', 'null'] },
    dependabots: { type: ['integer', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'email', 'created_at', 'updated_at']
}

export const userIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' }
  }
}

export const createUserBodySchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    xp: { type: 'integer', minimum: 0 },
    dependabots: { type: 'integer', minimum: 0 }
  }
}

export const updateUserBodySchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    xp: { type: 'integer', minimum: 0 },
    dependabots: { type: 'integer', minimum: 0 }
  }
}
