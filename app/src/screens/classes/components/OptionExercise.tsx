import React, { useState } from "react";
import { DimensionValue, StyleSheet, TouchableOpacity, View } from "react-native";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import useFontSizeStore from "../../../stores/FontSizeStore";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import CodeOption from "./CodeOption";
import LessonScreen, { useLessonLayout } from "./theory/LessonScreen";
import { TEXT_SIZE, useTheoryPalette, type TheoryPalette } from "./theory/theoryTheme";

interface Props {
	aditionalParagraph?: string;
	question: string;
	options: string[];
	correctOption: number;
	highlight: string[];
	/** Trecho de código mostrado entre o enunciado e as alternativas. */
	code?: string;
	codeLanguage?: string;
	/**
	 * Mostra cada alternativa como código ("ache o erro"), na linguagem de
	 * `codeLanguage`. Ausente = alternativas em texto, como sempre.
	 */
	optionsAsCode?: boolean;
	tutorial?: boolean;
	/** Título da lição (cabeçalho), posição na sessão e tamanho dela. */
	title?: string;
	step: number;
	total: number;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

/**
 * Atividade de seleção: múltipla escolha, verdadeiro/falso e "qual código está
 * correto" — todas são uma `option`. Mesmo visual da teoria (`LessonScreen`,
 * paleta, tipografia): o enunciado no estilo de título/texto da seção, o trecho
 * de código no editor da teoria e cada alternativa num cartão com uma bolinha,
 * que ganha borda e bolinha na cor de acento quando selecionada. Nenhum campo
 * novo: é o mesmo conteúdo, só com outra roupa.
 */
export default function OptionExercise({
	highlight = [""],
	tutorial = false,
	aditionalParagraph,
	question,
	code,
	codeLanguage = "JavaScript",
	optionsAsCode = false,
	options,
	correctOption,
	title,
	step,
	total,
	progress,
	onClose,
	onProceed,
}: Props) {
	const palette = useTheoryPalette();
	const { textInset } = useLessonLayout();
	const fontOffset = useFontSizeStore((s) => s.fontSize);
	// O botão "?" já existia e alternava este estado (o tutorial em si está
	// desligado); o comportamento foi preservado.
	const [tutorialVisible, setTutorialVisible] = useState(tutorial);

	const [selectedOption, setSelectedOption] = useState<number>();

	const [modalVisible, setModalVisible] = useState(false);

	const Validate = () => {
		if (selectedOption !== undefined) {
			setModalVisible(true);
		}
	};

	const questionLine = Math.round((TEXT_SIZE.sectionTitle + fontOffset) * 1.28);
	const paragraphLine = Math.round((TEXT_SIZE.body + fontOffset) * 1.28);

	return (
		<>
			<LessonScreen
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				onHelp={() => setTutorialVisible(!tutorialVisible)}
				onNext={Validate}
			>
				<View style={[styles.textColumn, { paddingHorizontal: textInset }]}>
					{aditionalParagraph !== undefined ? (
						<ResizableHighlighter
							text={aditionalParagraph}
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

				{code !== undefined ? (
					<CodeSnippet code={code} codeLanguage={codeLanguage} palette={palette} />
				) : null}

				<View style={styles.options} accessibilityRole="radiogroup">
					{options.map((option, index) => (
						<OptionButton
							key={index}
							palette={palette}
							selected={selectedOption === index}
							onSelect={() => setSelectedOption(index)}
							option={option}
							asCode={optionsAsCode}
							codeLanguage={codeLanguage}
						/>
					))}
				</View>
			</LessonScreen>
			<ValidationModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				correct={selectedOption === correctOption - 1}
				onProceed={onProceed}
			/>
			{/* <TutorialOption
					visible={TutorialVisible}
					setModalVisible={setTutorialVisible}
				/>
				<Timer navigation={navigation} seconds={sec} />
				<SaveClass AulaId={aulaSalvar} Salvar={Salvar} /> */}
		</>
	);
}

interface OptionButtonProps {
	palette: TheoryPalette;
	selected: boolean;
	onSelect: () => void;
	option: string;
	asCode: boolean;
	codeLanguage: string;
}

/**
 * Cartão da alternativa: bolinha à esquerda e o texto (ou o código) ao lado.
 * A borda tem sempre 2 de largura, só muda de cor — selecionar não desloca nada.
 */
const OptionButton = ({
	palette,
	selected,
	onSelect,
	option,
	asCode,
	codeLanguage,
}: OptionButtonProps) => {
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			style={[
				styles.card,
				selected
					? { backgroundColor: palette.cardBg, borderColor: palette.accent }
					: { backgroundColor: palette.gradientTo, borderColor: palette.border },
			]}
			onPress={onSelect}
			accessibilityRole="radio"
			accessibilityLabel={option}
			accessibilityState={{ selected }}
		>
			<View
				style={[
					styles.radio,
					selected ? { borderColor: palette.accent } : { borderColor: palette.icon, opacity: 0.55 },
				]}
			>
				{selected ? <View style={[styles.radioDot, { backgroundColor: palette.accent }]} /> : null}
			</View>
			{asCode ? (
				<CodeOption code={option} codeLanguage={codeLanguage} palette={palette} />
			) : (
				<ResizableText
					useCustomColor
					defaultSize={TEXT_SIZE.body + 1}
					style={[styles.optionText, { color: palette.text }]}
				>
					{option}
				</ResizableText>
			)}
		</TouchableOpacity>
	);
};

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
	options: {
		gap: 10,
	},
	// minHeight, não height: alternativa longa (ou fonte aumentada pelo
	// ResizableText) quebra em mais linhas, e com altura fixa a segunda linha
	// era cortada.
	card: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		minHeight: 58,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderWidth: 2,
		borderRadius: 14,
	},
	radio: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
	},
	radioDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	optionText: {
		flex: 1,
		fontFamily: "Roboto",
		fontWeight: "500",
		textAlign: "left",
	},
});
