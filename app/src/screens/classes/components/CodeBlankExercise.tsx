import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ScrollView, DimensionValue, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LessonHeader, Progressbar } from "./LessonHeader";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import NextButton from "./NextButton";
import ThemedView from "../../../components/themed/ThemedView";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";

/** Marca de uma lacuna no `code` (ver `CodeBlankActivityContent` no contrato). */
const BLANK = "___";

interface Props {
	question: string;
	highlight: string[];
	codeLanguage: string;
	code: string;
	answers: string[];
	distractors: string[];
	tutorial?: boolean;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

function shuffled<T>(items: readonly T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Completar código tocando em blocos (estilo Grasshopper): o aluno vê o trecho
 * com 1 a 3 lacunas e toca nos blocos, que preenchem a próxima lacuna vazia na
 * ordem do código. Tocar numa lacuna preenchida devolve o bloco. Sem teclado
 * de propósito — digitar `<`, `{` ou `;` no celular é a parte ruim de escrever
 * código, não a parte que se quer exercitar.
 *
 * Os blocos são identificados pela posição no banco, não pelo texto: dois
 * blocos com o mesmo texto (uma resposta repetida, por exemplo) continuam
 * independentes.
 */
export default function CodeBlankExercise({
	question,
	highlight = [""],
	codeLanguage,
	code,
	answers,
	distractors,
	tutorial = false,
	progress,
	onProceed,
	onClose,
}: Props) {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const [tutorialVisible, setTutorialVisible] = useState(tutorial);
	const [modalVisible, setModalVisible] = useState(false);

	// Embaralhado uma vez por atividade: o `ActivityPlayer` remonta este
	// componente a cada atividade (`key`), então a ordem não muda no meio.
	const [chips] = useState(() => shuffled([...answers, ...distractors]));
	const parts = code.split(BLANK);
	const blankCount = parts.length - 1;
	// slots[k] = posição em `chips` do bloco posto na lacuna k, ou null.
	const [slots, setSlots] = useState<(number | null)[]>(() =>
		Array.from({ length: blankCount }, () => null)
	);

	const filledCode = parts.reduce(
		(acc, part, index) =>
			index === 0
				? part
				: acc + (slots[index - 1] !== null ? chips[slots[index - 1] as number] : BLANK) + part,
		""
	);

	const placeChip = (chipIndex: number) => {
		const empty = slots.indexOf(null);
		if (empty === -1 || slots.includes(chipIndex)) return;
		setSlots(slots.map((slot, k) => (k === empty ? chipIndex : slot)));
	};

	const clearSlot = (slotIndex: number) => {
		setSlots(slots.map((slot, k) => (k === slotIndex ? null : slot)));
	};

	const allFilled = slots.every((slot) => slot !== null);
	const correct =
		allFilled &&
		slots.every((slot, k) => chips[slot as number].trim() === (answers[k] ?? "").trim());

	return (
		<>
			<ThemedView theme="card" style={styles.container}>
				<Progressbar progress={progress} />
				<ScrollView style={styles.scroller}>
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
					<CodeSnippet code={filledCode} codeLanguage={codeLanguage} />

					{blankCount > 1 ? (
						<View style={styles.slotRow}>
							{slots.map((slot, k) => (
								<TouchableOpacity
									key={k}
									accessibilityRole="button"
									accessibilityLabel={
										slot === null
											? t("codeBlank.emptySlot", { n: k + 1 })
											: t("codeBlank.filledSlot", { n: k + 1, value: chips[slot] })
									}
									disabled={slot === null}
									onPress={() => clearSlot(k)}
									style={[
										styles.slot,
										{ borderColor: colors.primary },
										slot !== null ? { backgroundColor: colors.primary } : null,
									]}
								>
									<ResizableText style={styles.slotText} defaultSize={16}>
										{`${k + 1}. ${slot === null ? BLANK : chips[slot]}`}
									</ResizableText>
								</TouchableOpacity>
							))}
						</View>
					) : null}

					<ResizableText style={styles.hint} defaultSize={15}>
						{blankCount > 1 ? t("codeBlank.hintMany") : t("codeBlank.hintOne")}
					</ResizableText>

					<View style={styles.bank}>
						{chips.map((chip, index) => {
							// Com várias lacunas, o bloco usado sai do banco (fica apagado);
							// com uma só, ele fica marcado em verde, como na múltipla escolha.
							const used = blankCount > 1 && slots.includes(index);
							return (
								<TouchableOpacity
									key={index}
									accessibilityRole="button"
									accessibilityState={{ disabled: used }}
									disabled={used}
									onPress={() =>
										// Com uma lacuna só, tocar noutro bloco troca a resposta,
										// em vez de exigir desfazer antes.
										blankCount === 1 ? setSlots([index]) : placeChip(index)
									}
									style={[
										styles.chip,
										{ backgroundColor: colors.background },
										used ? styles.chipUsed : null,
										blankCount === 1 && slots[0] === index
											? { backgroundColor: "green" }
											: null,
									]}
								>
									<ResizableText style={styles.chipText} defaultSize={18}>
										{chip}
									</ResizableText>
								</TouchableOpacity>
							);
						})}
					</View>
				</ScrollView>
				<NextButton onPress={() => allFilled && setModalVisible(true)} />
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
	slotRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginHorizontal: 10,
		marginBottom: 6,
	},
	slot: {
		borderWidth: 2,
		borderRadius: 14,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	slotText: {
		fontFamily: "monospace",
		color: "white",
	},
	hint: {
		marginHorizontal: 12,
		marginBottom: 8,
		color: "#9AA9B8",
	},
	bank: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 10,
		marginHorizontal: 10,
	},
	chip: {
		minHeight: 52,
		minWidth: 64,
		paddingHorizontal: 16,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 16,
		elevation: 6,
	},
	chipUsed: {
		opacity: 0.3,
		elevation: 0,
	},
	chipText: {
		fontFamily: "monospace",
		color: "white",
		fontWeight: "bold",
	},
});
