/**
 * Move um item uma posição para cima (-1) ou para baixo (+1), devolvendo a nova
 * ordem completa de ids — que é exatamente o que os endpoints `.../reorder`
 * esperam em `orderedIds`.
 *
 * Devolve `null` quando o movimento sairia da lista, para o chamador não
 * disparar uma requisição que não muda nada. A API renumera `index` de
 * `0..n-1`, então a ordem enviada precisa ser sempre o conjunto completo — daí
 * esta função trabalhar sobre o array inteiro, e não sobre um par de índices.
 */
export function moveWithin (ids: number[], position: number, direction: -1 | 1): number[] | null {
  const target = position + direction

  if (target < 0 || target >= ids.length) {
    return null
  }

  const reordered = [...ids]
  const [moved] = reordered.splice(position, 1)
  reordered.splice(target, 0, moved)

  return reordered
}
