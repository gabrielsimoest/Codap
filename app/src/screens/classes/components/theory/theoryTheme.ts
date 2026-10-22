import type { TextStyle } from "react-native";
import useThemeStore from "../../../../stores/ThemeStore";
import LightMode from "../../../../theme/LightMode";

/**
 * Cores da tela de teoria. O modo escuro é a especificação do novo design; o
 * claro é uma adaptação com a mesma estrutura de tokens, para a tela não ser a
 * única do app que ignora o tema escolhido.
 */
export interface TheoryPalette {
	/** Fundo da tela. */
	screen: string;
	/** Fundo da área de código. */
	codeArea: string;
	/** Borda do editor, dos separadores e da trilha da barra de progresso. */
	border: string;
	/** Destaque: botão, aba ativa, barra de progresso, palavras destacadas do título. */
	accent: string;
	/** Palavras destacadas dentro do texto descritivo: mais clara que `accent`, para ler bem sobre o fundo. */
	emphasis: string;
	/** Aba não selecionada. */
	tabIdle: string;
	/** Ícones de fechar, ajuda e copiar, e os textos "Copiar" e "2 de 5". */
	icon: string;
	/** Texto dos blocos editoriais. */
	text: string;
	/** Fundo, borda e texto do card complementar (opacidade só no fundo e na borda). */
	cardBg: string;
	cardBorder: string;
	cardText: string;
	/** Gradiente do cabeçalho da tela e do editor, da esquerda para a direita. */
	gradientFrom: string;
	gradientTo: string;
	/** Fundo do terminal integrado ao editor: mais escuro que a área de código. */
	terminalBg: string;
	/** Texto padrão do código e do terminal. */
	codeText: string;
	/** Feedback de acerto e de erro (ligar pares): cor da borda/ícone e o fundo translúcido do cartão. */
	success: string;
	successBg: string;
	danger: string;
	dangerBg: string;
	/** Aviso ("ainda não funcionou"). */
	warning: string;
	/**
	 * Dourado do desafio do módulo. `gold` é o tom vivo (bordas, ícones, realce); no
	 * claro um amarelo vivo não chega a 4,5:1 como texto, então o texto dourado é
	 * `goldInk` (mais fundo) e vive sobre uma etiqueta `goldBg`/`goldBorder`. No escuro
	 * os três são o mesmo dourado de antes e a etiqueta não existe.
	 */
	gold: string;
	goldInk: string;
	goldBg: string;
	goldBorder: string;
	isDark: boolean;
}

const DARK: TheoryPalette = {
	screen: "#111724",
	codeArea: "#0E121B",
	border: "#1B2F4E",
	accent: "#5368D6",
	emphasis: "#8FA2FF",
	tabIdle: "#1B2F4E",
	icon: "#AFC3ED",
	text: "rgba(255,255,255,0.95)",
	cardBg: "rgba(83,104,214,0.15)",
	cardBorder: "rgba(83,104,214,0.6)",
	cardText: "#C6D5F4",
	gradientFrom: "#1b253a",
	gradientTo: "#162031",
	terminalBg: "#080B12",
	codeText: "#E6ECF8",
	success: "#4CC38A",
	successBg: "rgba(76,195,138,0.16)",
	danger: "#F2555A",
	dangerBg: "rgba(242,85,90,0.16)",
	warning: "#E0A552",
	gold: "#E0B04C",
	goldInk: "#E0B04C",
	goldBg: "transparent",
	goldBorder: "transparent",
	isDark: true,
};

/**
 * Claro: mesma estrutura de tokens do escuro, com os tons de texto recalculados
 * contra as superfícies onde aparecem (WCAG 2.x): `emphasis` 6,3:1 e `icon`
 * 6,3:1 na tela, `cardText` 9,2:1, `success` 4,7:1, `danger` 4,9:1 e `warning`
 * e `goldInk` 5,4:1 sobre a etiqueta dourada; `gold` (vivo, só borda e ícone) 3,0:1 no branco. Os tons vivos do escuro
 * (verde, âmbar, dourado) ficam abaixo de 3:1 sobre o claro e não servem aqui.
 */
const LIGHT: TheoryPalette = {
	screen: "#F3F6FB",
	codeArea: "#FFFFFF",
	border: "#CCD6E6",
	accent: "#5368D6",
	emphasis: "#3B4FC2",
	tabIdle: "#DDE5F4",
	icon: "#4A5A82",
	text: "#141F29",
	cardBg: "rgba(83,104,214,0.10)",
	cardBorder: "rgba(83,104,214,0.45)",
	cardText: "#2A3A66",
	gradientFrom: "#E6ECF8",
	gradientTo: "#ECF1FA",
	terminalBg: "#EDF1F8",
	codeText: "#1B2236",
	success: "#177A4C",
	successBg: "rgba(23,122,76,0.10)",
	danger: "#C42D33",
	dangerBg: "rgba(196,45,51,0.08)",
	warning: "#7F5600",
	gold: "#C28A00",
	goldInk: "#7F5600",
	goldBg: "rgba(194,138,0,0.14)",
	goldBorder: "rgba(194,138,0,0.55)",
	isDark: false,
};

/**
 * Etiqueta dourada (aviso e selo do desafio): fundo e borda no tom vivo e o texto
 * em `goldInk`. Só existe no claro — no escuro o texto dourado já lê bem sozinho e
 * a tela não pode mudar —, por isso devolve `null` lá.
 */
export function goldLabel(palette: TheoryPalette): TextStyle | null {
	if (palette.isDark) return null;
	return {
		backgroundColor: palette.goldBg,
		borderWidth: 1,
		borderColor: palette.goldBorder,
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 5,
		alignSelf: "flex-start",
		overflow: "hidden",
	};
}

export function useTheoryPalette(): TheoryPalette {
	const theme = useThemeStore((s) => s.theme);
	return theme === LightMode ? LIGHT : DARK;
}

/** Tamanhos fixos (não acompanham a fonte do app) do cabeçalho, das abas e do "Copiar". */
export const FIXED_UI = {
	headerTitle: 14,
	progressText: 11,
	tab: 14,
	copy: 12,
} as const;

/** Tamanhos-base dos textos que acompanham a fonte do app (`ResizableText`). */
export const TEXT_SIZE = {
	sectionTitle: 18,
	body: 14,
	card: 12,
	button: 16,
} as const;
