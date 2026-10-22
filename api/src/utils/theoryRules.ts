import type { FastifyInstance } from 'fastify'
import { type Prisma } from '../generated/prisma/client.js'

/**
 * Regra editorial das teorias: **a primeira atividade teórica de cada lição (o
 * "tópico") usa a persona Cody**. As seguintes escolhem entre Cody e neutra —
 * a decisão continua sendo do autor, nada força "neutra" para as demais.
 *
 * "Primeira" é a de menor `index` entre as atividades `type = 'theory'` **da
 * própria lição**: atividades de outros tipos não entram na contagem, e a
 * posição global no módulo não importa. Por isso a regra pode quebrar de quatro
 * jeitos — criar uma teoria antes da primeira, trocar o `type` da primeira,
 * removê-la ou reordenar — e todas as rotas de escrita de atividade passam por
 * `enforceTheoryPersonaRule`.
 *
 * **Só se mete onde a primeira teórica pode ter mudado.** Escrever uma atividade
 * prática (`option`, `code_blank`, `fill_blank`, `reorder`, `matching`,
 * `code_playground`, `code_editor`), uma lição sem teoria ou uma teoria que não
 * é a primeira nunca dispara a checagem, e uma teoria ainda no formato antigo
 * (sem `introduction`) é ignorada em vez de barrar a lição inteira. O contrato
 * de `content` continua sem validação no backend: aqui só existe esta regra.
 */

/**
 * `true` quando o `content` declara uma introdução cuja persona não é Cody.
 * Conteúdo sem `introduction` (formato antigo, ainda não migrado) ou que nem é
 * um objeto não conta como violação: a regra só barra o que ela entende.
 */
export function violatesCodyRule (content: unknown): boolean {
  if (typeof content !== 'object' || content === null) {
    return false
  }
  const introduction = (content as { introduction?: unknown }).introduction
  if (typeof introduction !== 'object' || introduction === null) {
    return false
  }
  return (introduction as { persona?: unknown }).persona !== 'cody'
}

/** Id da primeira atividade teórica da lição, ou `null` se ela não tem teoria. */
export async function findFirstTheoryId (
  tx: Prisma.TransactionClient,
  lessonId: number
): Promise<number | null> {
  const first = await tx.activities.findFirst({
    where: { lesson_id: lessonId, type: 'theory' },
    orderBy: [{ index: 'asc' }, { id: 'asc' }],
    select: { id: true }
  })
  return first?.id ?? null
}

/**
 * Chame **depois** da escrita, dentro da mesma transação, com o
 * `findFirstTheoryId` de **antes** dela. Lança 422 (e a transação desfaz tudo)
 * se a primeira teoria da lição, em qualquer idioma, declarar persona neutra.
 *
 * Só valida quando a primeira teórica mudou de atividade ou quando a atividade
 * escrita (`touchedId`) é a própria primeira — o resto das escritas passa direto.
 */
export async function enforceTheoryPersonaRule (
  tx: Prisma.TransactionClient,
  fastify: FastifyInstance,
  lessonId: number,
  firstBefore: number | null,
  touchedId?: number
): Promise<void> {
  const firstAfter = await findFirstTheoryId(tx, lessonId)
  if (firstAfter === null) {
    return
  }
  if (firstAfter === firstBefore && firstAfter !== touchedId) {
    return
  }

  const translations = await tx.activity_translations.findMany({
    where: { activity_id: firstAfter },
    select: { content: true, locale: { select: { locale: true } } }
  })
  const offending = translations
    .filter((translation) => violatesCodyRule(translation.content))
    .map((translation) => translation.locale.locale)

  if (offending.length > 0) {
    throw fastify.httpErrors.unprocessableEntity(
      `A primeira atividade teórica de uma lição precisa usar a persona Cody (idioma: ${offending.join(', ')}). ` +
      'Mude a persona dessa atividade para Cody antes de salvar, remover ou reordenar.'
    )
  }
}
