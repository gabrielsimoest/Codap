import type { ReactNode, Ref } from "react";
import { DimensionValue, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import TheoryHeader from "./TheoryHeader";
import ActivityTutorial from "../tutorial/ActivityTutorial";
import type { TutorialType } from "../tutorial/tutorials";
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
	/** Qual tutorial o "?" do cabeçalho abre. */
	tutorial: TutorialType;
	/** Abre o tutorial já na entrada da atividade (o campo `tutorial` do conteúdo). */
	tutorialOpen?: boolean;
	/** Toque no botão fixo do rodapé. */
	onNext: () => void;
	/** Para telas com campo de texto: tocar fora do teclado não pode engolir o toque dos botões. */
	keyboardShouldPersistTaps?: "never" | "always" | "handled";
	/**
	 * Rodapé próprio no lugar do botão "Seguinte" e do degradê de baixo (a barra de
	 * símbolos do editor, enquanto o teclado está aberto). Posicionado em relação à
	 * casca inteira; a rolagem deixa de reservar o espaço do botão.
	 */
	footer?: ReactNode;
	/** Espaço reservado embaixo da rolagem (o que o teclado cobre), além do rodapé. */
	bottomInset?: number;
	/** Refs da casca e da rolagem, para telas que medem o teclado ou rolam até um campo. */
	rootRef?: Ref<View>;
	/** A casca mudou de tamanho (a barra de navegação aparece com o teclado, por exemplo). */
	onRootLayout?: () => void;
	scrollRef?: Ref<ScrollView>;
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
	tutorial,
	tutorialOpen = false,
	onNext,
	keyboardShouldPersistTaps,
	footer,
	bottomInset = 0,
	rootRef,
	onRootLayout,
	scrollRef,
	children,
}: Props) {
	const { bottom } = useInsets();
	const { horizontal, gap } = useLessonLayout();
	const [tutorialVisible, setTutorialVisible] = useState(tutorialOpen);
	// Do botão (e da área segura embaixo) até BOTTOM_FADE acima do topo dele.
	const bottomFadeHeight = bottom + THEORY_BUTTON_MARGIN + THEORY_BUTTON_HEIGHT + BOTTOM_FADE;
	// O degradê usa a cor da tela com alfa 00 no fim, e não "transparent": no
	// Android ele interpola por preto.
	const screen = palette.screen;
	const hasFooter = footer !== undefined;

	return (
		<View ref={rootRef} collapsable={false} onLayout={onRootLayout} style={[styles.screen, { backgroundColor: screen }]}>
			<TheoryHeader
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				onHelp={() => setTutorialVisible(true)}
			/>
			<View style={[styles.scroll, { marginBottom: bottomInset }]}>
				<ScrollView
					ref={scrollRef}
					style={styles.scroll}
					keyboardShouldPersistTaps={keyboardShouldPersistTaps}
					contentContainerStyle={{
						paddingHorizontal: horizontal,
						paddingTop: gap + 4,
						paddingBottom: hasFooter ? gap : THEORY_BUTTON_HEIGHT + THEORY_BUTTON_MARGIN * 2 + bottom + gap,
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
				{hasFooter ? null : (
					<>
						{/* E o que desce para baixo do botão: o degradê cobre a faixa do botão e começa um pouco acima dele. */}
						<LinearGradient
							pointerEvents="none"
							colors={[`${screen}00`, screen, screen]}
							locations={[0, BOTTOM_FADE / bottomFadeHeight, 1]}
							style={[styles.bottomFade, { height: bottomFadeHeight }]}
						/>
					</>
				)}
			</View>
			{hasFooter ? footer : <TheoryNextButton palette={palette} horizontalPadding={horizontal} onPress={onNext} />}
			<ActivityTutorial
				visible={tutorialVisible}
				onClose={() => setTutorialVisible(false)}
				type={tutorial}
				palette={palette}
			/>
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
