import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
	DimensionValue,
	Keyboard,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LessonHeader, Progressbar } from "./LessonHeader";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import NextButton from "./NextButton";
import ThemedView from "../../../components/themed/ThemedView";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import useFontSizeStore from "../../../stores/FontSizeStore";

/** Marca da lacuna no `code` (a mesma do `code_blank` — ver o contrato). */
const BLANK = "___";
/** Azul da marca: `colors.primary` deste app é quase a cor de fundo. */
const BRAND = "#5469D3";

/**
 * Compara o que foi digitado com as respostas aceitas, ignorando espaços nas
 * pontas e, com `ignoreCase`, maiúsculas e minúsculas.
 */
export function isFillBlankCorrect(
	typed: string,
	answers: string[],
	ignoreCase = false
): boolean {
	const normalize = (value: string) =>
		ignoreCase ? value.trim().toLowerCase() : value.trim();
	const value = normalize(typed);
	return value.length > 0 && answers.some((answer) => normalize(answer) === value);
}

interface Props {
	question: string;
	highlight: string[];
	codeLanguage: string;
	/** Trecho com exatamente uma lacuna `___`. */
	code: string;
	/** Respostas aceitas; a primeira é a principal. */
	answers: string[];
	ignoreCase?: boolean;
	tutorial?: boolean;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

/**
 * Completar código digitando: o aluno vê o trecho com uma lacuna e escreve a
 * palavra que falta. É o par "de lembrar" do `code_blank` (que é "de
 * reconhecer", por blocos).
 *
 * O campo fica abaixo do código, e não dentro dele: no React Native um
 * `TextInput` não flui no meio de uma linha de texto. Em troca, o próprio
 * `CodeSnippet` mostra o que está sendo digitado no lugar da lacuna, então o
 * aluno vê a resposta encaixada no código enquanto escreve.
 *
 * As respostas são curtas e sem símbolos (só letras, números e hífen — o
 * dashboard valida), e o teclado vem sem autocorreção, sugestões nem
 * maiúscula automática — sem isso, o celular trocaria `const` por `Const` ou
 * "corrigiria" `px` para uma palavra do dicionário.
 */
export default function FillBlankExercise({
	question,
	highlight = [""],
	codeLanguage,
	code,
	answers,
	ignoreCase = false,
	tutorial = false,
	progress,
	onProceed,
	onClose,
}: Props) {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const fontSize = useFontSizeStore((s) => s.fontSize);
	const [tutorialVisible, setTutorialVisible] = useState(tutorial);
	const [modalVisible, setModalVisible] = useState(false);
	const [typed, setTyped] = useState("");
	const [focused, setFocused] = useState(false);

	const value = typed.trim();
	const shownCode = code.replace(BLANK, value.length > 0 ? value : BLANK);
	const correct = isFillBlankCorrect(typed, answers, ignoreCase);

	const check = () => {
		if (value.length === 0) return;
		// Fecha o teclado antes do modal: aberto, ele cobriria o botão "Seguinte".
		Keyboard.dismiss();
		setModalVisible(true);
	};

	return (
		<>
			<ThemedView theme="card" style={styles.container}>
				<Progressbar progress={progress} />
				<ScrollView style={styles.scroller} keyboardShouldPersistTaps="handled">
					<LessonHeader
						onClose={onClose}
						setTutorialVisible={() => setTutorialVisible(!tutorialVisible)}
					/>
					<ResizableHighlighter
						style={styles.question}
						highlight={highlight}
						text={question}
						defaultSize={23}
					/>
					<CodeSnippet code={shownCode} codeLanguage={codeLanguage} />

					<View style={styles.inputArea}>
						<ResizableText style={styles.hint} defaultSize={15}>
							{t("fillBlank.hint", { next: t("next") })}
						</ResizableText>
						<TextInput
							value={typed}
							onChangeText={setTyped}
							onSubmitEditing={check}
							onFocus={() => setFocused(true)}
							onBlur={() => setFocused(false)}
							placeholder={t("fillBlank.placeholder")}
							placeholderTextColor="#8A97A5"
							accessibilityLabel={t("fillBlank.inputLabel")}
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="off"
							spellCheck={false}
							// Android: sem barra de sugestões do teclado.
							keyboardType="visible-password"
							returnKeyType="done"
							maxLength={30}
							style={[
								styles.input,
								{
									color: colors.text,
									backgroundColor: colors.background,
									borderColor: focused ? BRAND : "#5A6B7B",
									fontSize: 18 + fontSize,
								},
							]}
						/>
					</View>
				</ScrollView>
				<NextButton onPress={check} />
			</ThemedView>
			<ValidationModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				correct={correct}
				onProceed={onProceed}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
	},
	scroller: {
		marginBottom: "25%",
	},
	question: {
		margin: 20,
		fontFamily: "Roboto",
		color: "white",
		fontWeight: "bold",
	},
	inputArea: {
		marginHorizontal: 10,
		marginTop: 4,
	},
	hint: {
		marginHorizontal: 2,
		marginBottom: 8,
		color: "#9AA9B8",
	},
	input: {
		minHeight: 52,
		borderWidth: 2,
		borderRadius: 14,
		paddingHorizontal: 14,
		fontFamily: "monospace",
	},
});
