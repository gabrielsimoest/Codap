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
	/** Destaque: botão, aba ativa, barra de progresso, palavras destacadas. */
	accent: string;
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
	isDark: boolean;
}

const DARK: TheoryPalette = {
	screen: "#111724",
	codeArea: "#0E121B",
	border: "#1B2F4E",
	accent: "#5368D6",
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
	isDark: true,
};

const LIGHT: TheoryPalette = {
	screen: "#F4F6FB",
	codeArea: "#FFFFFF",
	border: "#C9D3EA",
	accent: "#5368D6",
	tabIdle: "#DCE3F5",
	icon: "#4A5A82",
	text: "rgba(17,23,36,0.95)",
	cardBg: "rgba(83,104,214,0.10)",
	cardBorder: "rgba(83,104,214,0.45)",
	cardText: "#2A3A66",
	gradientFrom: "#E7ECF9",
	gradientTo: "#EEF2FB",
	terminalBg: "#EEF1F8",
	codeText: "#1B2236",
	isDark: false,
};

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
