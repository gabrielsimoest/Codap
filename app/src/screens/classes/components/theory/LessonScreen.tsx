import type { ReactNode } from "react";
import { DimensionValue, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TheoryHeader from "./TheoryHeader";
import TheoryNextButton, { THEORY_BUTTON_HEIGHT, THEORY_BUTTON_MARGIN } from "./TheoryNextButton";
import type { TheoryPalette } from "./theoryTheme";
import { useInsets } from "./useInsets";

/** Altura do trecho que esmaece acima do botão "Seguinte". */
const BOTTOM_FADE = 36;

/**
 * Medidas da tela: os **cards** ficam a `horizontal` da borda e os **textos**
 * mais para dentro (`textInset`). Em telas estreitas a margem e o recuo
 * diminuem; em telas baixas o espaço entre os blocos também.
 */
export function useLessonLayout() {
	const { width, height } = useWindowDimensions();
	const narrow = width < 340;
	return {
		horizontal: narrow ? 14 : 20,
		textInset: narrow ? 6 : 20,
		gap: height < 700 ? 18 : 22,
	};
}

interface Props {
	palette: TheoryPalette;
	/** Título da lição, mostrado no cabeçalho. */
	title?: string;
	/** Posição da atividade na sessão (1-based) e tamanho da sessão. */
	step: number;
	total: number;
	progress: DimensionValue;
	onClose: () => void;
	onHelp: () => void;
	/** Toque no botão fixo do rodapé. */
	onNext: () => void;
	/** Para telas com campo de texto: tocar fora do teclado não pode engolir o toque dos botões. */
	keyboardShouldPersistTaps?: "never" | "always" | "handled";
	children: ReactNode;
}

/**
 * Casca das telas no visual novo: fundo da paleta, cabeçalho compacto, rolagem
 * com o botão "Seguinte" fixo no rodapé e os degradês que esmaecem o conteúdo
 * ao passar por baixo do cabeçalho e do botão. Serve à teoria e às atividades
 * de seleção; quem usa só decide o que vai dentro da rolagem. A rolagem reserva
 * o espaço do botão, para ele nunca cobrir conteúdo.
 */
export default function LessonScreen({
	palette,
	title,
	step,
	total,
	progress,
	onClose,
	onHelp,
	onNext,
	keyboardShouldPersistTaps,
	children,
}: Props) {
	const { bottom } = useInsets();
	const { horizontal, gap } = useLessonLayout();
	// Do botão (e da área segura embaixo) até BOTTOM_FADE acima do topo dele.
	const bottomFadeHeight = bottom + THEORY_BUTTON_MARGIN + THEORY_BUTTON_HEIGHT + BOTTOM_FADE;
	// O degradê usa a cor da tela com alfa 00 no fim, e não "transparent": no
	// Android ele interpola por preto.
	const screen = palette.screen;

	return (
		<View style={[styles.screen, { backgroundColor: screen }]}>
			<TheoryHeader
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				onHelp={onHelp}
			/>
			<View style={styles.scroll}>
				<ScrollView
					style={styles.scroll}
					keyboardShouldPersistTaps={keyboardShouldPersistTaps}
					contentContainerStyle={{
						paddingHorizontal: horizontal,
						paddingTop: gap + 4,
						paddingBottom: THEORY_BUTTON_HEIGHT + THEORY_BUTTON_MARGIN * 2 + bottom + gap,
						gap,
					}}
				>
					{children}
				</ScrollView>
				{/* O que sobe para baixo do cabeçalho some num degradê em vez de ser cortado seco. */}
				<LinearGradient
					pointerEvents="none"
					colors={[screen, `${screen}00`]}
					style={styles.headerFade}
				/>
				{/* E o que desce para baixo do botão: o degradê cobre a faixa do botão e começa um pouco acima dele. */}
				<LinearGradient
					pointerEvents="none"
					colors={[`${screen}00`, screen, screen]}
					locations={[0, BOTTOM_FADE / bottomFadeHeight, 1]}
					style={[styles.bottomFade, { height: bottomFadeHeight }]}
				/>
			</View>
			<TheoryNextButton palette={palette} horizontalPadding={horizontal} onPress={onNext} />
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	scroll: {
		flex: 1,
	},
	bottomFade: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
	},
	headerFade: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 28,
	},
});
