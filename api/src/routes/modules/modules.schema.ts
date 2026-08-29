export const listModulesQuerystringSchema = {
  type: 'object',
  required: ['areaId', 'locale'],
  additionalProperties: false,
  properties: {
    areaId: { type: 'integer' },
    locale: { type: 'string', enum: ['pt', 'en'] }
  }
}

export const activityResponseSchema = {
  $id: 'activityResponse',
  type: 'object',
  properties: {
    id: { type: 'integer' },
    index: { type: 'integer' },
    type: {
      type: 'string',
      description:
        "Tipo da atividade (`activities.type`, VarChar(25) livre — não há enum no banco). Hoje o app renderiza 'theory' e 'option'; um tipo desconhecido é ignorado pelo app, não rejeitado aqui."
    },
    content: {
      type: 'object',
      // OBRIGATÓRIO: o fast-json-stringify remove toda propriedade que não
      // esteja declarada em `properties`. Sem `additionalProperties: true` o
      // `content` seria serializado como `{}` — silenciosamente, sem erro nem
      // warning — e o JSONB inteiro se perderia no caminho.
      //
      // Também é de propósito que isto NÃO seja um `oneOf` por tipo de
      // atividade: um `content` que não casasse com nenhuma variante faria o
      // serializador lançar, derrubando o GET /modules inteiro com 500 para
      // todos os clientes. Um tipo novo de atividade precisa ser transportado
      // sem que a API precise conhecê-lo.
      additionalProperties: true,
      description:
        "Conteúdo traduzido (`activity_translations.content`, JSONB). O formato depende de `type` — ver TheoryActivityContent / OptionActivityContent em src/types/contracts.ts. Objeto vazio quando não há tradução no idioma pedido."
    }
  },
  required: ['id', 'index', 'type', 'content']
}

export const lessonResponseSchema = {
  $id: 'lessonResponse',
  type: 'object',
  properties: {
    id: { type: 'integer' },
    index: { type: 'integer' },
    name: { type: 'string' },
    activities: { type: 'array', items: activityResponseSchema }
  },
  required: ['id', 'index', 'name', 'activities']
}

export const moduleResponseSchema = {
  $id: 'moduleResponse',
  type: 'object',
  properties: {
    id: { type: 'integer' },
    areaId: { type: 'integer' },
    index: { type: 'integer' },
    name: { type: 'string' },
    lessons: { type: 'array', items: lessonResponseSchema }
  },
  required: ['id', 'areaId', 'index', 'name', 'lessons']
}
