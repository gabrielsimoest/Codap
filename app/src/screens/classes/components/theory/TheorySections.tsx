import { StyleSheet, View } from "react-native";
import Icon from "../../../../components/Icon";
import ResizableHighlighter from "../../../../components/ResizableHighlighter";
import useFontSizeStore from "../../../../stores/FontSizeStore";
import { TEXT_SIZE, type TheoryPalette } from "./theoryTheme";

interface SectionProps {
	palette: TheoryPalette;
	highlight: string[];
	title?: string;
	text: string;
}

/** Entrelinha de ~1,28 do tamanho da fonte (a do Figma é ~1,2), recalculada quando a fonte do app cresce. */
function useLineHeight(base: number): number {
	const offset = useFontSizeStore((s) => s.fontSize);
	return Math.round((base + offset) * 1.28);
}

/**
 * Título (18, bold) e texto (14, medium) de uma seção editorial. Os dois usam o
 * `ResizableHighlighter`, então acompanham a fonte do app e destacam as
 * palavras de `highlight`. Sempre alinhados à esquerda — nada justificado.
 *
 * Serve à introdução e à explicação: **a persona (Cody ou neutra) é só uma
 * característica do texto**, sem imagem nem avatar — a tela é a mesma.
 */
export function TheorySection({ palette, highlight, title, text }: SectionProps) {
	const titleLine = useLineHeight(TEXT_SIZE.sectionTitle);
	const bodyLine = useLineHeight(TEXT_SIZE.body);
	// O título mantém o destaque na cor de acento; no texto descritivo as palavras
	// destacadas usam uma cor própria, mais clara, em Roboto medium.
	const titleHighlight = { color: palette.accent };
	const bodyHighlight = { color: palette.emphasis, fontFamily: "Roboto", fontWeight: "500" as const };

	return (
		<View style={styles.textColumn}>
			{title ? (
				<ResizableHighlighter
					text={title}
					highlight={highlight}
					defaultSize={TEXT_SIZE.sectionTitle}
					color={palette.text}
					highlightStyle={titleHighlight}
					style={[styles.title, { lineHeight: titleLine }]}
				/>
			) : null}
			<ResizableHighlighter
				text={text}
				highlight={highlight}
				defaultSize={TEXT_SIZE.body}
				color={palette.text}
				highlightStyle={bodyHighlight}
				style={[styles.body, { lineHeight: bodyLine }]}
			/>
		</View>
	);
}

interface ClosingProps {
	palette: TheoryPalette;
	text: string;
}

/**
 * Card complementar depois do código. A opacidade está só nas cores de fundo e
 * borda (`rgba` na paleta): o texto e o ícone continuam opacos. Como no Figma,
 * o texto é corrido: as palavras de `highlight` não ganham destaque aqui.
 */
export function TheoryClosing({ palette, text }: ClosingProps) {
	const line = useLineHeight(TEXT_SIZE.card);

	return (
		<View style={[styles.card, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
			<Icon type="ionicon" name="information-circle" color={palette.accent} size={22} />
			<View style={styles.cardText}>
				<ResizableHighlighter
					text={text}
					highlight={[]}
					defaultSize={TEXT_SIZE.card}
					color={palette.cardText}
					style={[styles.body, { lineHeight: line }]}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	textColumn: {
		gap: 8,
	},
	title: {
		fontFamily: "Roboto",
		fontWeight: "700",
		textAlign: "left",
	},
	body: {
		fontFamily: "Roboto",
		fontWeight: "500",
		textAlign: "left",
	},
	card: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
		padding: 14,
		borderWidth: 1,
		borderRadius: 12,
	},
	cardText: {
		flex: 1,
	},
});
