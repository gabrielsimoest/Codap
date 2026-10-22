import useThemeStore from "../stores/ThemeStore";
import LightMode from "./LightMode";

/**
 * O que o tema do React Navigation (`DarkMode`/`LightMode`: background, text,
 * primary, card, border, notification) não cobre, resolvido pelo tema ativo.
 *
 * Existe porque várias telas tinham a cor da marca e o branco fixos no código —
 * certos sobre o fundo escuro, mas sem contraste no claro (texto preto sobre o
 * botão índigo, ícones apagados, campos sem borda). Cada token tem os dois
 * valores: o do escuro é **exatamente** o literal que já estava no código, para
 * o tema escuro não mudar; o do claro foi calculado contra o fundo em que o
 * token é usado.
 *
 * Contrastes do tema claro (WCAG 2.x, contra `#F3F6FB`, a tela, salvo indicação):
 * `muted` 5,0:1 · `brandText` 5,7:1 · `tabIdle` 4,3:1 · `fieldBorder` 3,4:1 no
 * branco · `onBrand` (branco sobre `#5469D3`) 4,84:1.
 */
export interface AppColors {
	isDark: boolean;
	/** Marca índigo como fundo de realce. Igual nos dois temas. */
	brand: string;
	/**
	 * Fundo dos botões de ação. No escuro é o índigo vivo `#637aff`; no claro volta
	 * para a marca, porque o branco sobre `#637aff` dá só 3,65:1.
	 */
	action: string;
	/** Texto e ícone sobre `brand`/`action`. */
	onBrand: string;
	/** A marca como texto ou ícone sobre a superfície do tema (título de seção, link). */
	brandText: string;
	/** Texto secundário (legenda, dica, rótulo apagado). */
	muted: string;
	/** Linha fina de separação entre blocos de texto (regra). */
	rule: string;
	/** Ícone inativo da barra de abas e ícone ativo. */
	tabIdle: string;
	tabActive: string;
	/** Contorno e fundo de campo de texto: precisa de 3:1 contra a superfície onde fica. */
	fieldBorder: string;
	fieldBackground: string;
	fieldText: string;
	/** Telas de login e cadastro: fundo, folha e véu da folha, cor de realce e dos placeholders. */
	canvas: string;
	sheet: string;
	shade: string;
	authAccent: string;
	authPlaceholder: string;
	/** Véu atrás de modal (`scrim`) e a segunda camada que o modal empilha por cima (`scrimInner`). */
	scrim: string;
	scrimInner: string;
}

const DARK: AppColors = {
	isDark: true,
	brand: "#5469D3",
	action: "#637aff",
	onBrand: "#F1F1F1",
	brandText: "#5469D3",
	muted: "#9AA9B8",
	rule: "#F1F1F1",
	tabIdle: "#637aff99",
	tabActive: "#637aff",
	fieldBorder: "#5A6B7B",
	fieldBackground: "#141f29",
	fieldText: "#FFFFFF",
	canvas: "#0b1016",
	sheet: "#141f29",
	shade: "rgba(0, 0, 0, 0.3)",
	authAccent: "#7977FD",
	authPlaceholder: "#7977FD",
	scrim: "rgba(0,0,0,0.8)",
	scrimInner: "rgba(0,0,0,0.85)",
};

const LIGHT: AppColors = {
	isDark: false,
	brand: "#5469D3",
	action: "#5469D3",
	onBrand: "#FFFFFF",
	brandText: "#4357C7",
	muted: "#5B6B80",
	rule: "#B7C3D8",
	tabIdle: "#66758B",
	tabActive: "#5469D3",
	fieldBorder: "#7F8DA6",
	fieldBackground: "#FFFFFF",
	fieldText: "#141F29",
	canvas: "#E3EAF6",
	sheet: "#FFFFFF",
	shade: "transparent",
	authAccent: "#5469D3",
	authPlaceholder: "#5B6B80",
	scrim: "rgba(20,31,41,0.5)",
	scrimInner: "transparent",
};

export function useAppColors(): AppColors {
	const theme = useThemeStore((s) => s.theme);
	return theme === LightMode ? LIGHT : DARK;
}
