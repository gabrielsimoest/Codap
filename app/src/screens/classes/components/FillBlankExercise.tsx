import React, { useState } from "react";
import { DimensionValue, Keyboard, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import useFontSizeStore from "../../../stores/FontSizeStore";
import { ActivityHint, ActivityQuestion } from "./theory/ActivityParts";
import LessonScreen from "./theory/LessonScreen";
import { TEXT_SIZE, useTheoryPalette } from "./theory/theoryTheme";

/** Marca da lacuna no `code` (a mesma do `code_blank` — ver o contrato). */
const BLANK = "___";

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
	/** Título da lição (cabeçalho), posição na sessão e tamanho dela. */
	title?: string;
	step: number;
	total: number;
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
	title,
	step,
	total,
	progress,
	onProceed,
	onClose,
}: Props) {
	const palette = useTheoryPalette();
	const { t } = useTranslation();
	const fontSize = useFontSizeStore((s) => s.fontSize);
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
			<LessonScreen
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				tutorial="fill_blank"
				tutorialOpen={tutorial}
				onNext={check}
				keyboardShouldPersistTaps="handled"
			>
				<ActivityQuestion palette={palette} highlight={highlight} question={question} />
				<CodeSnippet code={shownCode} codeLanguage={codeLanguage} palette={palette} />

				<View style={styles.inputArea}>
					<ActivityHint palette={palette}>{t("fillBlank.hint", { next: t("next") })}</ActivityHint>
					<TextInput
						value={typed}
						onChangeText={setTyped}
						onSubmitEditing={check}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						placeholder={t("fillBlank.placeholder")}
						placeholderTextColor={palette.icon}
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
								color: palette.text,
								backgroundColor: palette.gradientTo,
								borderColor: focused ? palette.accent : palette.border,
								fontSize: TEXT_SIZE.body + 2 + fontSize,
							},
						]}
					/>
				</View>
			</LessonScreen>
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
	inputArea: {
		gap: 8,
	},
	input: {
		minHeight: 52,
		borderWidth: 2,
		borderRadius: 14,
		paddingHorizontal: 16,
		fontFamily: "monospace",
	},
});
