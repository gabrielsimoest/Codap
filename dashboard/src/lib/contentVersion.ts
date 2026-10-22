/**
 * Formato de uma versão de conteúdo: três segmentos numéricos (`0.1.4`).
 *
 * Espelha `VERSION_PATTERN` de `api/src/routes/content-version/content-version.schema.ts`
 * e, como lá, usa `[0-9]` e `[.]` em vez de `\d` e `\.`: sem barra invertida
 * não há como escapar errado, e um ponto sem escape aceitaria `1a2b3`.
 *
 * Se o padrão mudar de um lado, mude do outro na mesma tarefa — validar aqui e
 * não lá (ou o contrário) só troca um 400 da API por um erro de formulário.
 */
export const VERSION_PATTERN = /^[0-9]+[.][0-9]+[.][0-9]+$/
