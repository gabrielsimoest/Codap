import React, { useState } from "react";
import { DimensionValue, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import CustomSyntaxHighlighter from "../../../components/CustomSyntaxHighlighter";
import { codapDark, codapLight } from "../../../components/codapCodeTheme";
import ResizableText from "../../../components/ResizableText";
import ValidationModal from "./ValidationModal";
import useFontSizeStore from "../../../stores/FontSizeStore";
import { ActivityChip, ActivityHint, ActivityQuestion } from "./theory/ActivityParts";
import LessonScreen from "./theory/LessonScreen";
import { useTheoryPalette } from "./theory/theoryTheme";

interface Props {
	question: string;
	highlight: string[];
	codeLanguage: string;
	/** Linhas na ordem correta, com a indentação do código montado. */
	lines: string[];
	/** Linhas que não entram no código (podem ser `[]`). */
	distractors: string[];
	tutorial?: boolean;
	/** Título da lição (cabeçalho), posição na sessão e tamanho dela. */
	title?: string;
	step: number;
	total: number;
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
	// Altura que o highlighter ocupa de fato: texto de `CODE_SIZE + fontSize` com
	// linha de +5 (ver `NativeSyntaxHighlighter`); o tema de código da teoria já
	// vem sem padding. Fixá-la, com `overflow: hidden`, impede que o highlighter
	// (dois ScrollViews aninhados) deixe uma sobra embaixo e empurre o código para
	// cima do número do gutter, que é centralizado na linha.
	const codeHeight = CODE_SIZE + fontSize + 5;
	const codeTheme = palette.isDark ? codapDark : codapLight;
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
			<LessonScreen
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				onHelp={() => setTutorialVisible(!tutorialVisible)}
				onNext={() => allFilled && setModalVisible(true)}
			>
				<ActivityQuestion palette={palette} highlight={highlight} question={question} />

				<View style={[styles.box, { backgroundColor: palette.codeArea, borderColor: palette.border }]}>
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
										? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border }
										: null,
								]}
							>
								<ResizableText useCustomColor style={[styles.gutter, { color: palette.icon }]} defaultSize={13}>
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
											themeStyle={codeTheme}
										/>
									</View>
								) : (
									<View style={[styles.placeholder, { borderColor: palette.border }]} />
								)}
							</TouchableOpacity>
						);
					})}
				</View>

				<ActivityHint palette={palette}>{t("reorder.hint")}</ActivityHint>

				<View style={styles.bank}>
					{chips.map((chip, index) => (
						<ActivityChip
							key={index}
							palette={palette}
							mono
							label={chip.text.trim()}
							used={placed.includes(index)}
							accessibilityLabel={
								placed.includes(index)
									? t("reorder.chipUsed", { value: chip.text.trim() })
									: t("reorder.chip", { value: chip.text.trim() })
							}
							onPress={() => placeChip(index)}
						/>
					))}
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
	// A área de resposta é o mesmo editor da teoria: fundo de código, borda da paleta.
	box: {
		borderWidth: 2,
		borderRadius: 14,
		overflow: "hidden",
	},
	row: {
		minHeight: 48,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
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
		marginLeft: 8,
	},
	placeholder: {
		flex: 1,
		height: 28,
		marginHorizontal: 8,
		borderWidth: 1.5,
		borderStyle: "dashed",
		borderRadius: 8,
		opacity: 0.8,
	},
	bank: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 10,
	},
});
