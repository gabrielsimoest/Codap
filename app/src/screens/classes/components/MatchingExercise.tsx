import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, StyleSheet, ScrollView, DimensionValue, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LessonHeader, Progressbar } from "./LessonHeader";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import NextButton from "./NextButton";
import ThemedView from "../../../components/themed/ThemedView";
import ValidationModal from "./ValidationModal";

/** Quanto tempo o par errado fica vermelho antes de a seleção voltar ao normal. */
const WRONG_FLASH_MS = 600;
/** Verde do `CodeBlankExercise` (o `OptionExercise` já migrou para o visual novo, com acento roxo). */
const RIGHT_COLOR = "green";
const WRONG_COLOR = "#c62828";
/** Azul da marca: `colors.primary` do tema é quase igual ao fundo, não serve de destaque. */
const SELECTED_COLOR = "#5469D3";

interface Props {
	question: string;
	highlight: string[];
	/** De 3 a 4 pares; cada lado é embaralhado de forma independente. */
	pairs: { left: string; right: string }[];
	/** Coluna da esquerda em monoespaçado (tags, propriedades, métodos). */
	leftAsCode?: boolean;
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
 * Ordem das duas colunas, como índices de `pairs`. Cada coluna é embaralhada
 * por conta própria, mas a da direita é refeita enquanto algum par cair na
 * mesma linha — um par já alinhado entrega a resposta. Se o sorteio não achar
 * uma ordem assim (improvável com 3 a 4 pares), a direita vira a esquerda
 * deslocada em uma posição, que nunca tem item no lugar.
 */
function shuffleColumns(count: number): { left: number[]; right: number[] } {
	const indices = Array.from({ length: count }, (_, i) => i);
	const left = shuffled(indices);
	for (let attempt = 0; attempt < 30; attempt++) {
		const right = shuffled(indices);
		if (right.every((pair, row) => pair !== left[row])) return { left, right };
	}
	return { left, right: [...left.slice(1), left[0]] };
}

/**
 * Ligar pares: duas colunas embaralhadas, e o aluno toca um item de cada lado.
 * O feedback é por par e imediato — par certo trava em verde nos dois lados,
 * par errado pisca em vermelho e a seleção é limpa para tentar de novo. Não há
 * pontuação de erros: o `NextButton` só libera quando todos os pares estão
 * feitos, e então o resultado é sempre `correct`.
 *
 * Os itens são identificados pelo índice do par em `pairs`, não pelo texto, e
 * "certo" é os dois lados terem o mesmo índice.
 */
export default function MatchingExercise({
	question,
	highlight = [""],
	pairs,
	leftAsCode = false,
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
	const [order] = useState(() => shuffleColumns(pairs.length));
	const [matched, setMatched] = useState<number[]>([]);
	const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
	const [selectedRight, setSelectedRight] = useState<number | null>(null);
	const [wrong, setWrong] = useState<{ left: number; right: number } | null>(null);
	const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// O timer do "piscar em vermelho" não pode disparar depois de a atividade sair.
	useEffect(
		() => () => {
			if (flashTimer.current) clearTimeout(flashTimer.current);
		},
		[]
	);

	const allMatched = matched.length === pairs.length;

	const resolve = (left: number, right: number) => {
		setSelectedLeft(null);
		setSelectedRight(null);
		if (left === right) {
			setMatched((current) => [...current, left]);
			return;
		}
		setWrong({ left, right });
		flashTimer.current = setTimeout(() => {
			setWrong(null);
			flashTimer.current = null;
		}, WRONG_FLASH_MS);
	};

	const pressLeft = (index: number) => {
		if (wrong !== null) return;
		if (selectedLeft === index) return setSelectedLeft(null);
		if (selectedRight !== null) return resolve(index, selectedRight);
		setSelectedLeft(index);
	};

	const pressRight = (index: number) => {
		if (wrong !== null) return;
		if (selectedRight === index) return setSelectedRight(null);
		if (selectedLeft !== null) return resolve(selectedLeft, index);
		setSelectedRight(index);
	};

	const renderItem = (
		side: "left" | "right",
		index: number,
		selected: number | null,
		onPress: (index: number) => void
	) => {
		const text = pairs[index][side];
		const done = matched.includes(index);
		const isSelected = selected === index;
		const isWrong = wrong !== null && wrong[side] === index;
		const colored = done || isSelected || isWrong;
		const asCode = side === "left" && leftAsCode;

		return (
			<TouchableOpacity
				key={`${side}-${index}`}
				accessibilityRole="button"
				accessibilityLabel={done ? t("matching.paired", { value: text }) : text}
				accessibilityState={{ selected: isSelected, disabled: done }}
				disabled={done}
				onPress={() => onPress(index)}
				style={[
					styles.item,
					{ backgroundColor: colors.background },
					isSelected ? { backgroundColor: SELECTED_COLOR } : null,
					done ? { backgroundColor: RIGHT_COLOR } : null,
					isWrong ? { backgroundColor: WRONG_COLOR } : null,
				]}
			>
				<ResizableText
					useCustomColor={colored}
					style={[
						asCode ? styles.codeText : styles.text,
						colored ? { color: "white" } : null,
					]}
					defaultSize={asCode ? 15 : 16}
				>
					{text}
				</ResizableText>
			</TouchableOpacity>
		);
	};

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

					<ResizableText style={styles.hint} defaultSize={15}>
						{allMatched ? t("matching.done", { next: t("next") }) : t("matching.hint")}
					</ResizableText>

					<View style={styles.columns}>
						<View style={styles.column} accessibilityLabel={t("matching.leftColumn")}>
							{order.left.map((index) => renderItem("left", index, selectedLeft, pressLeft))}
						</View>
						<View style={styles.column} accessibilityLabel={t("matching.rightColumn")}>
							{order.right.map((index) => renderItem("right", index, selectedRight, pressRight))}
						</View>
					</View>
				</ScrollView>
				<NextButton onPress={() => allMatched && setModalVisible(true)} />
			</ThemedView>
			<ValidationModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				correct={allMatched}
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
	hint: {
		marginHorizontal: 12,
		marginBottom: 12,
		color: "#9AA9B8",
	},
	columns: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
		marginHorizontal: 10,
	},
	column: {
		flex: 1,
		gap: 10,
	},
	item: {
		// minHeight, não height: o lado direito vai até 40 caracteres e quebra
		// em várias linhas (a fonte aumentada também), e altura fixa cortaria.
		minHeight: 56,
		paddingHorizontal: 10,
		paddingVertical: 8,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 16,
		elevation: 6,
	},
	text: {
		textAlign: "center",
		fontWeight: "600",
	},
	codeText: {
		textAlign: "center",
		fontFamily: "monospace",
		fontWeight: "bold",
	},
});
