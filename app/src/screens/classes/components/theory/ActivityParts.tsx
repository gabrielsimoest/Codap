import type { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import Icon from "../../../../components/Icon";
import ResizableHighlighter from "../../../../components/ResizableHighlighter";
import ResizableText from "../../../../components/ResizableText";
import useFontSizeStore from "../../../../stores/FontSizeStore";
import { useLessonLayout } from "./LessonScreen";
import { TEXT_SIZE, type TheoryPalette } from "./theoryTheme";

/**
 * Peças que as atividades práticas compartilham no visual novo (a teoria tem as
 * dela em `TheorySections`): o enunciado, a dica e o cartão tocável. Tudo usa a
 * paleta e a tipografia da teoria — Roboto, título 18 bold, texto 14 medium.
 */

interface QuestionProps {
	palette: TheoryPalette;
	highlight: string[];
	question: string;
	/** Texto de contexto acima da pergunta (o enunciado de um verdadeiro/falso). */
	paragraph?: string;
}

/** Enunciado no estilo de seção da teoria: `paragraph` como texto, `question` como título. */
export function ActivityQuestion({ palette, highlight, question, paragraph }: QuestionProps) {
	const { textInset } = useLessonLayout();
	const fontOffset = useFontSizeStore((s) => s.fontSize);
	const questionLine = Math.round((TEXT_SIZE.sectionTitle + fontOffset) * 1.28);
	const paragraphLine = Math.round((TEXT_SIZE.body + fontOffset) * 1.28);

	return (
		<View style={[styles.textColumn, { paddingHorizontal: textInset }]}>
			{paragraph !== undefined ? (
				<ResizableHighlighter
					text={paragraph}
					highlight={highlight}
					defaultSize={TEXT_SIZE.body}
					color={palette.text}
					highlightStyle={{ color: palette.emphasis, fontFamily: "Roboto", fontWeight: "500" }}
					style={[styles.paragraph, { lineHeight: paragraphLine }]}
				/>
			) : null}
			<ResizableHighlighter
				text={question}
				highlight={highlight}
				defaultSize={TEXT_SIZE.sectionTitle}
				color={palette.text}
				highlightStyle={{ color: palette.accent }}
				style={[styles.question, { lineHeight: questionLine }]}
			/>
		</View>
	);
}

/** Dica curta ("toque num bloco…") abaixo do enunciado, no recuo dos textos. */
export function ActivityHint({ palette, children }: { palette: TheoryPalette; children: string }) {
	const { textInset } = useLessonLayout();

	return (
		<View style={{ paddingHorizontal: textInset }}>
			<ResizableText
				useCustomColor
				defaultSize={TEXT_SIZE.card + 1}
				style={[styles.hint, { color: palette.icon }]}
			>
				{children}
			</ResizableText>
		</View>
	);
}

/** Estado visual de um cartão tocável. */
export type ChipTone = "idle" | "selected" | "right" | "wrong";

interface ChipProps {
	palette: TheoryPalette;
	label: string;
	tone?: ChipTone;
	/** Peça já usada: some para o fundo, mas continua no lugar. */
	used?: boolean;
	disabled?: boolean;
	/** Texto em monoespaçado (código). */
	mono?: boolean;
	onPress: () => void;
	accessibilityLabel?: string;
	style?: StyleProp<ViewStyle>;
}

/**
 * Cartão tocável: fundo e borda de 2 que só mudam de cor entre os estados (nada
 * se desloca ao selecionar). `selected` é o acento roxo; `right` e `wrong` são
 * o feedback do ligar pares, em verde e vermelho da paleta, e o certo ganha um
 * ✓ para o estado não depender só da cor.
 */
export function ActivityChip({
	palette,
	label,
	tone = "idle",
	used = false,
	disabled = false,
	mono = false,
	onPress,
	accessibilityLabel,
	style,
}: ChipProps) {
	const colors = {
		idle: { backgroundColor: palette.gradientTo, borderColor: palette.border },
		selected: { backgroundColor: palette.cardBg, borderColor: palette.accent },
		right: { backgroundColor: palette.successBg, borderColor: palette.success },
		wrong: { backgroundColor: palette.dangerBg, borderColor: palette.danger },
	}[tone];

	return (
		<TouchableOpacity
			activeOpacity={0.8}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ selected: tone === "selected", disabled: disabled || used }}
			disabled={disabled || used}
			onPress={onPress}
			style={[styles.chip, colors, used ? styles.chipUsed : null, style]}
		>
			{tone === "right" ? (
				<Icon type="ionicon" name="checkmark-circle" color={palette.success} size={18} />
			) : null}
			<ResizableText
				useCustomColor
				defaultSize={TEXT_SIZE.body + 1}
				style={[mono ? styles.chipMono : styles.chipText, { color: palette.text }]}
			>
				{label}
			</ResizableText>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	textColumn: {
		gap: 8,
	},
	paragraph: {
		fontFamily: "Roboto",
		fontWeight: "500",
		textAlign: "left",
	},
	question: {
		fontFamily: "Roboto",
		fontWeight: "700",
		textAlign: "left",
	},
	hint: {
		fontFamily: "Roboto",
		fontWeight: "500",
		textAlign: "left",
	},
	// minHeight, não height: o texto quebra em mais linhas (e cresce com a fonte
	// aumentada do app), e altura fixa cortaria a segunda linha.
	chip: {
		minHeight: 52,
		minWidth: 64,
		maxWidth: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderWidth: 2,
		borderRadius: 14,
	},
	chipUsed: {
		opacity: 0.3,
	},
	chipText: {
		flexShrink: 1,
		fontFamily: "Roboto",
		fontWeight: "500",
		textAlign: "center",
	},
	chipMono: {
		flexShrink: 1,
		fontFamily: "monospace",
		fontWeight: "600",
		textAlign: "center",
	},
});
