import React, { useState } from "react";
import { DimensionValue, View } from "react-native";
import type { TheoryActivityContent } from "codap-api/src/types/contracts";
import CodeSection from "./CodeSection";
import LessonScreen, { useLessonLayout } from "./theory/LessonScreen";
import { TheoryClosing, TheorySection } from "./theory/TheorySections";
import { useTheoryPalette } from "./theory/theoryTheme";

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
 * estreitas a margem e o recuo diminuem. O cabeçalho, a rolagem, os degradês e
 * o botão "Seguinte" fixo no rodapé são da `LessonScreen`, compartilhada com as
 * atividades de seleção.
 *
 * A persona da introdução (`introduction.persona`) é uma característica do
 * **texto** (tom caloroso ou direto): a tela é a mesma nos dois casos, sem
 * avatar nem ilustração.
 */
export default function TheoryView({ content, title, step, total, progress, onProceed, onClose }: Props) {
	const palette = useTheoryPalette();
	const { textInset } = useLessonLayout();
	// O botão "?" já existia e alternava este estado (o tutorial em si está
	// desligado); o comportamento foi preservado.
	const [isTutorialVisible, setTutorialVisible] = useState(content.tutorial ?? false);

	const highlight = content.highlight ?? [];
	const { introduction, explanation, closing } = content;

	return (
		<LessonScreen
			palette={palette}
			title={title}
			progress={progress}
			step={step}
			total={total}
			onClose={onClose}
			onHelp={() => setTutorialVisible(!isTutorialVisible)}
			onNext={onProceed}
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
		</LessonScreen>
	);
}
