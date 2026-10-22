import React, { useEffect, useRef, useState } from "react";
import { DimensionValue, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import ValidationModal from "./ValidationModal";
import { ActivityChip, ActivityHint, ActivityQuestion, type ChipTone } from "./theory/ActivityParts";
import LessonScreen from "./theory/LessonScreen";
import { useTheoryPalette } from "./theory/theoryTheme";

/** Quanto tempo o par errado fica vermelho antes de a seleção voltar ao normal. */
const WRONG_FLASH_MS = 600;

interface Props {
	question: string;
	highlight: string[];
	/** De 3 a 4 pares; cada lado é embaralhado de forma independente. */
	pairs: { left: string; right: string }[];
	/** Coluna da esquerda em monoespaçado (tags, propriedades, métodos). */
	leftAsCode?: boolean;
	tutorial?: boolean;
	/** Título da lição (cabeçalho), posição na sessão e tamanho dela. */
	title?: string;
	step: number;
	total: number;
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
	title,
	step,
	total,
	progress,
	onProceed,
	onClose,
}: Props) {
	const palette = useTheoryPalette();
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
		const isWrong = wrong !== null && wrong[side] === index;
		// Certo e errado ganham da seleção: o par errado ainda está marcado quando pisca.
		const tone: ChipTone = done
			? "right"
			: isWrong
				? "wrong"
				: selected === index
					? "selected"
					: "idle";

		return (
			<ActivityChip
				key={`${side}-${index}`}
				palette={palette}
				label={text}
				tone={tone}
				mono={side === "left" && leftAsCode}
				disabled={done}
				accessibilityLabel={done ? t("matching.paired", { value: text }) : text}
				onPress={() => onPress(index)}
				style={styles.item}
			/>
		);
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
				onHelp={() => setTutorialVisible(!tutorialVisible)}
				onNext={() => allMatched && setModalVisible(true)}
			>
				<ActivityQuestion palette={palette} highlight={highlight} question={question} />

				<ActivityHint palette={palette}>
					{allMatched ? t("matching.done", { next: t("next") }) : t("matching.hint")}
				</ActivityHint>

				<View style={styles.columns}>
					<View style={styles.column} accessibilityLabel={t("matching.leftColumn")}>
						{order.left.map((index) => renderItem("left", index, selectedLeft, pressLeft))}
					</View>
					<View style={styles.column} accessibilityLabel={t("matching.rightColumn")}>
						{order.right.map((index) => renderItem("right", index, selectedRight, pressRight))}
					</View>
				</View>
			</LessonScreen>
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
	columns: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
	},
	column: {
		flex: 1,
		gap: 10,
	},
	// O lado direito vai até 40 caracteres e quebra em várias linhas (a fonte
	// aumentada também): o cartão cresce, não corta.
	item: {
		minHeight: 56,
		paddingHorizontal: 10,
	},
});
