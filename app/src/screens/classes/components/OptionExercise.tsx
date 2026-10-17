import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	DimensionValue,
} from "react-native";
import { LessonHeader, Progressbar } from "./LessonHeader";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import NextButton from "./NextButton";
import ThemedView from "../../../components/themed/ThemedView";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import CodeOption from "./CodeOption";

const textSize = 23;

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
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

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
	progress,
	onClose,
	onProceed,
}: Props) {
	const [tutorialVisible, setTutorialVisible] = useState(tutorial);

	const [selectedOption, setSelectedOption] = useState<number>();

	const [modalVisible, setModalVisible] = useState(false);

	const Validate = () => {
		if (selectedOption !== undefined) {
			setModalVisible(true);
		}
	};

	return (
		<>
			<ThemedView theme="card" style={styles.container}>
				<Progressbar progress={progress} />
				<ScrollView style={styles.scroller}>
					<LessonHeader
						onClose={onClose}
						setTutorialVisible={() =>
							setTutorialVisible(!tutorialVisible)
						}
					/>
					{aditionalParagraph !== undefined ? (
						<ResizableHighlighter
							style={styles.text}
							highlight={highlight}
							text={aditionalParagraph}
							defaultSize={textSize}
						/>
					) : null}
					<ResizableHighlighter
						style={styles.text}
						highlight={highlight}
						text={question}
						defaultSize={textSize}
					/>
					{code !== undefined ? (
						<CodeSnippet code={code} codeLanguage={codeLanguage} />
					) : null}
					<>
						{options.map((option, index) => (
							<OptionButton
								key={index}
								selectedOption={selectedOption}
								onSelect={() => setSelectedOption(index)}
								option={option}
								index={index}
								asCode={optionsAsCode}
								codeLanguage={codeLanguage}
							/>
						))}
					</>
				</ScrollView>
				<NextButton onPress={() => Validate()} />
			</ThemedView>
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
	selectedOption?: number;
	onSelect: () => void;
	index: number;
	option: string;
	asCode: boolean;
	codeLanguage: string;
}

const OptionButton = ({
	selectedOption,
	onSelect,
	index,
	option,
	asCode,
	codeLanguage,
}: OptionButtonProps) => {
	const { colors } = useTheme();

	if (asCode) {
		// A moldura do botão é que fica verde ao selecionar; o bloco de código
		// mantém o próprio fundo (as cores do highlight não têm contraste
		// garantido sobre verde), então o estado continua claro nos dois temas.
		return (
			<TouchableOpacity
				style={[
					{ backgroundColor: colors.background },
					styles.button,
					styles.codeButton,
					selectedOption === index ? { backgroundColor: "green" } : {},
				]}
				onPress={onSelect}
				accessibilityRole="button"
				accessibilityLabel={option}
				accessibilityState={{ selected: selectedOption === index }}
			>
				<CodeOption code={option} codeLanguage={codeLanguage} />
			</TouchableOpacity>
		);
	}

	return (
		<TouchableOpacity
			style={[
				{ backgroundColor: colors.background },
				styles.button,
				selectedOption === index ? { backgroundColor: "green" } : {},
			]}
			onPress={onSelect}
		>
			<ResizableText style={[styles.text]} defaultSize={20}>
				{option}
			</ResizableText>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		// minHeight, não height: alternativa longa (ou fonte aumentada pelo
		// ResizableText) quebra em mais linhas, e com altura fixa a segunda
		// linha era cortada.
		minHeight: 70,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 5,
		marginBottom: 7,
		borderRadius: 20,
		elevation: 10,
	},
	// Alternativa em código: a altura acompanha as linhas do trecho (sem o
	// `minHeight` do botão de texto) e a moldura de 8 é o que fica verde ao
	// selecionar.
	codeButton: {
		flexDirection: "column",
		alignItems: "stretch",
		minHeight: 0,
		padding: 8,
	},
	container: {
		height: "100%",
	},
	text: {
		margin: 20,
		flexGrow: 1,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 23,
		fontWeight: "bold",
	},
	scroller: {
		marginBottom: "25%",
	},
});
