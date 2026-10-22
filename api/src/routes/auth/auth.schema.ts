// Campos do usuário duplicados aqui (em vez de reaproveitar o objeto
// `userResponseSchema` de users/users.schema.ts, que carrega um `$id`) para
// evitar aninhar um schema com $id dentro de outro — mais simples e seguro
// do que depender de resolução de $ref entre pastas de rotas carregadas
// separadamente pelo autoload.
const authUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    xp: { type: ['integer', 'null'] },
    bits: { type: ['integer', 'null'] },
    email_verified_at: { type: ['string', 'null'], format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'email', 'created_at', 'updated_at']
}

const authTokensProperties = {
  accessToken: { type: 'string' },
  accessTokenExpiresAt: { type: 'string', format: 'date-time' },
  refreshToken: { type: 'string' },
  refreshTokenExpiresAt: { type: 'string', format: 'date-time' }
}

const authTokensRequired = ['accessToken', 'accessTokenExpiresAt', 'refreshToken', 'refreshTokenExpiresAt']

export const authResponseSchema = {
  type: 'object',
  properties: {
    user: authUserSchema,
    ...authTokensProperties
  },
  required: ['user', ...authTokensRequired]
}

export const refreshResponseSchema = {
  type: 'object',
  properties: { ...authTokensProperties },
  required: authTokensRequired
}

export const authErrorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    // Presentes só em erros que o app precisa tratar por causa, não pelo texto
    // (ex.: `email_typo` traz a `suggestion` de e-mail corrigido).
    code: { type: 'string' },
    suggestion: { type: 'string' }
  }
}

export const registerBodySchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    rememberMe: { type: 'boolean', default: false }
  }
}

export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 },
    rememberMe: { type: 'boolean', default: false }
  }
}

export const refreshBodySchema = {
  type: 'object',
  required: ['refreshToken'],
  additionalProperties: false,
  properties: {
    refreshToken: { type: 'string', minLength: 1 }
  }
}

export const logoutBodySchema = refreshBodySchema

export const forgotPasswordBodySchema = {
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' }
  }
}

export const tokenBodySchema = {
  type: 'object',
  required: ['token'],
  additionalProperties: false,
  properties: {
    token: { type: 'string', minLength: 1, maxLength: 200 }
  }
}

export const resetPasswordBodySchema = {
  type: 'object',
  required: ['token', 'password'],
  additionalProperties: false,
  properties: {
    token: { type: 'string', minLength: 1, maxLength: 200 },
    password: { type: 'string', minLength: 8 }
  }
}

export const messageResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  },
  required: ['message']
}

export const meResponseSchema = {
  type: 'object',
  properties: {
    user: authUserSchema
  },
  required: ['user']
}

export const changeEmailBodySchema = {
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' }
  }
}
