import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ScrollView, DimensionValue, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LessonHeader, Progressbar } from "./LessonHeader";
import CustomSyntaxHighlighter from "../../../components/CustomSyntaxHighlighter";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import NextButton from "./NextButton";
import ThemedView from "../../../components/themed/ThemedView";
import ValidationModal from "./ValidationModal";
import DarkMode from "../../../theme/DarkMode";
import useFontSizeStore from "../../../stores/FontSizeStore";

interface Props {
	question: string;
	highlight: string[];
	codeLanguage: string;
	/** Linhas na ordem correta, com a indentação do código montado. */
	lines: string[];
	/** Linhas que não entram no código (podem ser `[]`). */
	distractors: string[];
	tutorial?: boolean;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

/** `defaultSize` do highlighter das linhas postas (30 caracteres cabem até na fonte máxima). */
const CODE_SIZE = 13;

/** Uma peça do banco: o texto como foi escrito (com indentação) e se é linha real. */
interface Chip {
	text: string;
	isLine: boolean;
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
 * Embaralha o banco sem deixar as linhas reais já na ordem certa (com 3 ou mais
 * linhas, uma embaralhada "de graça" seria resposta pronta). Compara por texto,
 * não por posição, para que `}` repetidos também contem como a mesma ordem.
 */
function buildBank(lines: string[], distractors: string[]): Chip[] {
	const all: Chip[] = [
		...lines.map((text) => ({ text, isLine: true })),
		...distractors.map((text) => ({ text, isLine: false })),
	];
	const expected = lines.map((line) => line.trimEnd()).join("\n");
	let bank = shuffled(all);
	for (let attempt = 0; attempt < 50 && lines.length >= 3; attempt++) {
		const order = bank
			.filter((chip) => chip.isLine)
			.map((chip) => chip.text.trimEnd())
			.join("\n");
		if (order !== expected) break;
		bank = shuffled(all);
	}
	return bank;
}

/**
 * "Montar o código" (Parsons problem; o "monte a frase" do Duolingo aplicado a
 * código): o aluno toca nas linhas do banco para empilhá-las, de cima para
 * baixo, na ordem em que o código funciona. Tocar numa linha já posta a devolve
 * ao banco e as de baixo sobem — a pilha nunca tem buraco. Sem arrastar de
 * propósito: toque funciona igual em qualquer tamanho de tela e de fonte.
 *
 * Os chips do banco mostram o texto sem a indentação, senão ela entregaria a
 * estrutura; depois de postas, as linhas aparecem com a indentação delas.
 *
 * Como no `CodeBlankExercise`, as peças são identificadas pela posição no banco
 * (duas peças com o mesmo texto continuam independentes), mas a correção compara
 * o texto: dois `}` podem trocar de lugar sem erro.
 */
export default function ReorderExercise({
	question,
	highlight = [""],
	codeLanguage,
	lines,
	distractors = [],
	tutorial = false,
	progress,
	onProceed,
	onClose,
}: Props) {
	const theme = useTheme();
	const { colors } = theme;
	const isDarkMode = theme === DarkMode;
	const { t } = useTranslation();
	const fontSize = useFontSizeStore((s) => s.fontSize);
	// Altura que o highlighter ocupa de fato: texto de `CODE_SIZE + fontSize` com
	// linha de +5 (ver `NativeSyntaxHighlighter`) e o padding de 0.5em (8px) do
	// tema hljs em cima e embaixo. Fixá-la, com `overflow: hidden`, impede que o
	// highlighter (dois ScrollViews aninhados) deixe uma sobra embaixo e empurre
	// o código para cima do número do gutter, que é centralizado na linha.
	const codeHeight = CODE_SIZE + fontSize + 5 + 16;
	const [tutorialVisible, setTutorialVisible] = useState(tutorial);
	const [modalVisible, setModalVisible] = useState(false);

	// Embaralhado uma vez por atividade: o `ActivityPlayer` remonta este
	// componente a cada atividade (`key`), então a ordem não muda no meio.
	const [chips] = useState(() => buildBank(lines, distractors));
	// placed[k] = posição em `chips` da peça posta na linha k. Sempre compacto:
	// as posições vazias são as que vêm depois de `placed.length`.
	const [placed, setPlaced] = useState<number[]>([]);

	const placeChip = (chipIndex: number) => {
		if (placed.length >= lines.length || placed.includes(chipIndex)) return;
		setPlaced([...placed, chipIndex]);
	};

	const removeAt = (position: number) => {
		setPlaced(placed.filter((_, k) => k !== position));
	};

	const allFilled = placed.length === lines.length;
	const correct =
		allFilled &&
		placed.every(
			(chipIndex, k) => chips[chipIndex].text.trimEnd() === lines[k].trimEnd()
		);

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

					<View style={[styles.box, isDarkMode ? styles.dark : styles.light]}>
						{lines.map((_, k) => {
							const chipIndex = k < placed.length ? placed[k] : null;
							const value = chipIndex !== null ? chips[chipIndex].text : null;
							return (
								<TouchableOpacity
									key={k}
									accessibilityRole="button"
									accessibilityLabel={
										value === null
											? t("reorder.emptyLine", { n: k + 1 })
											: t("reorder.placedLine", { n: k + 1, value: value.trim() })
									}
									accessibilityState={{ disabled: value === null }}
									disabled={value === null}
									onPress={() => removeAt(k)}
									style={[
										styles.row,
										k < lines.length - 1
											? {
													borderBottomWidth: StyleSheet.hairlineWidth,
													borderBottomColor: isDarkMode ? "#304D66" : "#A5A5A5",
												}
											: null,
									]}
								>
									<ResizableText style={styles.gutter} defaultSize={13}>
										{`${k + 1}`}
									</ResizableText>
									{value !== null ? (
										// `pointerEvents="none"`: o highlighter é um ScrollView
										// horizontal, e sem isso ele competiria com o toque da linha.
										<View style={[styles.code, { height: codeHeight }]} pointerEvents="none">
											<CustomSyntaxHighlighter
												language={codeLanguage}
												code={value.trimEnd()}
												defaultSize={CODE_SIZE}
											/>
										</View>
									) : (
										<View
											style={[
												styles.placeholder,
												{ borderColor: isDarkMode ? "#304D66" : "#A5A5A5" },
											]}
										/>
									)}
								</TouchableOpacity>
							);
						})}
					</View>

					<ResizableText style={styles.hint} defaultSize={15}>
						{t("reorder.hint")}
					</ResizableText>

					<View style={styles.bank}>
						{chips.map((chip, index) => {
							const used = placed.includes(index);
							return (
								<TouchableOpacity
									key={index}
									accessibilityRole="button"
									accessibilityLabel={
										used
											? t("reorder.chipUsed", { value: chip.text.trim() })
											: t("reorder.chip", { value: chip.text.trim() })
									}
									accessibilityState={{ disabled: used }}
									disabled={used}
									onPress={() => placeChip(index)}
									style={[
										styles.chip,
										{ backgroundColor: colors.background },
										used ? styles.chipUsed : null,
									]}
								>
									<ResizableText style={styles.chipText} defaultSize={15}>
										{chip.text.trim()}
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
	// Mesmas cores do `CodeSnippet`, para a área de resposta parecer o mesmo
	// bloco de código que o aluno viu na teoria.
	box: {
		marginHorizontal: 10,
		marginBottom: 10,
		borderWidth: 3,
		borderRadius: 12,
		overflow: "hidden",
	},
	dark: {
		backgroundColor: "#282c34",
		borderColor: "#304D66",
	},
	light: {
		backgroundColor: "#fafafa",
		borderColor: "#A5A5A5",
	},
	row: {
		minHeight: 48,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 6,
	},
	gutter: {
		width: 22,
		textAlign: "center",
		fontFamily: "monospace",
		opacity: 0.5,
	},
	code: {
		flex: 1,
		overflow: "hidden",
	},
	placeholder: {
		flex: 1,
		height: 28,
		marginHorizontal: 8,
		borderWidth: 1.5,
		borderStyle: "dashed",
		borderRadius: 8,
		opacity: 0.6,
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
		maxWidth: "100%",
		paddingHorizontal: 16,
		paddingVertical: 6,
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
		fontWeight: "bold",
	},
});
