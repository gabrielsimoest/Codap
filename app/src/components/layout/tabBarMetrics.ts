/** Medidas da barra de abas flutuante (ver `TabNavigation`). */
export const TAB_BAR_HEIGHT = 60;
export const TAB_BAR_BOTTOM = 16;

/**
 * Espaço que a rolagem de cada aba reserva embaixo (como `paddingBottom`), para
 * o último item parar acima da barra com um respiro, em vez de ficar escondido
 * atrás dela. A rolagem vai até a borda da tela: é por trás da barra que o
 * degradê de baixo faz o conteúdo sumir.
 */
export const TAB_BAR_CLEARANCE = TAB_BAR_BOTTOM + TAB_BAR_HEIGHT + 24;
