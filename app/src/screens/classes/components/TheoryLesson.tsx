import React, { useState } from "react";
import { DimensionValue, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import type { TheoryActivityContent } from "codap-api/src/types/contracts";
import CodeSection from "./CodeSection";
import TheoryHeader from "./theory/TheoryHeader";
import { TheoryClosing, TheorySection } from "./theory/TheorySections";
import TheoryNextButton, { THEORY_BUTTON_HEIGHT, THEORY_BUTTON_MARGIN } from "./theory/TheoryNextButton";
import { useTheoryPalette } from "./theory/theoryTheme";
import { useInsets } from "./theory/useInsets";
import { LinearGradient } from "expo-linear-gradient";

// Cor de fundo da tela de teoria. O degradê sob o cabeçalho usa a mesma cor (com
// alfa 00 no fim, e não "transparent": no Android ele interpola por preto).
const SCREEN_BACKGROUND = "#111724";
/** Altura do trecho que esmaece acima do botão "Seguinte". */
const BOTTOM_FADE = 36;

interface Props {
	/** Já no modelo novo — o `activityRegistry` passa pelo `normalizeTheoryContent`. */
	content: TheoryActivityContent;
	/** Título da lição, mostrado no cabeçalho. */
	title?: string;
	/** Posição da atividade na sessão (1-based) e tamanho da sessão. */
	step: number;
	total: number;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

/**
 * Tela de teoria: cabeçalho, introdução, explicação, editor de código e card
 * complementar, nessa ordem, sobre o fundo #111724. Só `introduction` é
 * obrigatória: sem `explanation` a tela vai da introdução ao código, e sem
 * `closing` termina no código.
 *
 * Geometria do Figma: os **cards** (editor, complementar, botão) ficam a 20 dp
 * da borda, e os **textos** ficam mais para dentro (mais 20 dp, 40 no total);
 * um divisor de borda a borda separa a introdução da explicação. Em telas
 * estreitas a margem e o recuo diminuem. O botão "Seguinte" fica fixo no
 * rodapé e a rolagem reserva o espaço dele, para nunca cobrir texto nem código.
 *
 * A persona da introdução (`introduction.persona`) é uma característica do
 * **texto** (tom caloroso ou direto): a tela é a mesma nos dois casos, sem
 * avatar nem ilustração.
 */
export default function TheoryView({ content, title, step, total, progress, onProceed, onClose }: Props) {
	const palette = useTheoryPalette();
	const { width, height } = useWindowDimensions();
	const { bottom } = useInsets();
	// O botão "?" já existia e alternava este estado (o tutorial em si está
	// desligado); o comportamento foi preservado.
	const [isTutorialVisible, setTutorialVisible] = useState(content.tutorial ?? false);

	const narrow = width < 340;
	const horizontal = narrow ? 14 : 20;
	const textInset = narrow ? 6 : 20;
	const gap = height < 700 ? 18 : 22;
	const highlight = content.highlight ?? [];
	// Do botão (e da área segura embaixo) até BOTTOM_FADE acima do topo dele.
	const bottomFadeHeight = bottom + THEORY_BUTTON_MARGIN + THEORY_BUTTON_HEIGHT + BOTTOM_FADE;
	const { introduction, explanation, closing } = content;

	return (
		<View style={[styles.screen, { backgroundColor: SCREEN_BACKGROUND }]}>
			<TheoryHeader
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				onHelp={() => setTutorialVisible(!isTutorialVisible)}
			/>
			<View style={styles.scroll}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={{
					paddingHorizontal: horizontal,
					paddingTop: gap + 4,
					paddingBottom: THEORY_BUTTON_HEIGHT + THEORY_BUTTON_MARGIN * 2 + bottom + gap,
					gap,
				}}
			>
				<View style={{ paddingHorizontal: textInset }}>
					<TheorySection
						palette={palette}
						highlight={highlight}
						title={introduction.title}
						text={introduction.text}
					/>
				</View>

				{explanation ? (
					<>
						{/* Divisor de borda a borda: o negativo desfaz o padding da rolagem. */}
						<View
							style={{
								height: 2,
								width: "100%",
								backgroundColor: palette.border,
							}}
						/>
						<View style={{ paddingHorizontal: textInset }}>
							<TheorySection
								palette={palette}
								highlight={highlight}
								title={explanation.title}
								text={explanation.text}
							/>
						</View>
					</>
				) : null}

				<CodeSection
					onlyCode={content.onlyCode ?? false}
					codeLanguage={content.codeLanguage}
					code={content.code}
					additionalCode={content.additionalCode}
					noTerminal={content.noTerminal ?? false}
					terminalCode={content.terminalCode}
				/>

				{closing ? <TheoryClosing palette={palette} text={closing} /> : null}
			</ScrollView>
			{/* O texto que sobe para baixo do cabeçalho some num degradê em vez de ser cortado seco. */}
			<LinearGradient
				pointerEvents="none"
				colors={[SCREEN_BACKGROUND, `${SCREEN_BACKGROUND}00`]}
				style={styles.headerFade}
			/>
			{/* E o que desce para baixo do botão "Seguinte": o degradê cobre a faixa do botão e começa um pouco acima dele. */}
			<LinearGradient
				pointerEvents="none"
				colors={[`${SCREEN_BACKGROUND}00`, SCREEN_BACKGROUND, SCREEN_BACKGROUND]}
				locations={[0, BOTTOM_FADE / bottomFadeHeight, 1]}
				style={[styles.bottomFade, { height: bottomFadeHeight }]}
			/>
			</View>
			<TheoryNextButton palette={palette} horizontalPadding={horizontal} onPress={onProceed} />
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
