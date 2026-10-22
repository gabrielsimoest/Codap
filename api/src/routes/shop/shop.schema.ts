const shopItemSchema = { type: 'string', enum: ['double_xp', 'instant_hint', 'chest'] }

export const shopStateResponseSchema = {
  type: 'object',
  properties: {
    prices: {
      type: 'object',
      properties: {
        double_xp: { type: 'integer' },
        instant_hint: { type: 'integer' },
        chest: { type: 'integer' }
      },
      required: ['double_xp', 'instant_hint', 'chest'],
      description: 'Preços em Bits. Moram no servidor: o app só os exibe.'
    },
    bits: { type: 'integer' },
    instantHints: { type: 'integer', description: 'Dicas instantâneas compradas e ainda não usadas.' },
    doubleXpEndsAt: {
      type: ['string', 'null'],
      description: 'Fim da última janela de Dobro de XP que ainda não terminou, ou `null` sem nenhuma.'
    },
    chest: {
      type: 'object',
      properties: {
        missesInARow: { type: 'integer', description: 'Baús seguidos sem aula; aos 2, o próximo baú dá aula.' },
        areas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              areaId: { type: 'integer' },
              total: { type: 'integer' },
              revealed: { type: 'integer' }
            },
            required: ['areaId', 'total', 'revealed']
          },
          description: 'Quantas aulas do baú cada área tem e quantas o usuário já revelou. Nunca diz quais são.'
        }
      },
      required: ['missesInARow', 'areas']
    }
  },
  required: ['prices', 'bits', 'instantHints', 'doubleXpEndsAt', 'chest']
}

export const purchaseBodySchema = {
  type: 'object',
  required: ['item'],
  additionalProperties: false,
  properties: {
    item: shopItemSchema,
    locale: {
      type: 'string',
      enum: ['pt', 'en'],
      description: 'Idioma do nome da aula revelada por um baú. Padrão: pt.'
    }
  }
}

/**
 * O resultado de um baú, achatado de propósito: um `oneOf` por tipo de
 * resultado faria o serializador lançar quando nada casasse (ver api/CLAUDE.md).
 * Só `kind` é sempre presente; o resto depende dele.
 */
const chestOutcomeSchema = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['lesson', 'instant_hint', 'double_xp', 'bits'] },
    lesson: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        areaId: { type: 'integer' },
        moduleId: { type: 'integer' },
        name: { type: 'string' }
      },
      required: ['id', 'areaId', 'moduleId', 'name']
    },
    endsAt: { type: 'string' },
    amount: { type: 'integer' }
  },
  required: ['kind']
}

export const purchaseResponseSchema = {
  type: 'object',
  properties: {
    item: shopItemSchema,
    bits: { type: 'integer' },
    instantHints: { type: 'integer' },
    doubleXpEndsAt: { type: ['string', 'null'] },
    chest: chestOutcomeSchema
  },
  required: ['item', 'bits', 'instantHints', 'doubleXpEndsAt']
}

export const useHintResponseSchema = {
  type: 'object',
  properties: {
    instantHints: { type: 'integer' }
  },
  required: ['instantHints']
}

/** Erro da loja: o corpo padrão do sensible mais o saldo atual (só no 402). */
export const shopErrorSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
    bits: { type: 'integer', description: 'Saldo atual, para o app mostrar quanto falta (402 insufficient_bits).' }
  }
}
