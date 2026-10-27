import React, { useState } from "react";
import { DimensionValue } from "react-native";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import { ActivityQuestion, BLANK, BlankBank } from "./theory/ActivityParts";
import LessonScreen from "./theory/LessonScreen";
import { useTheoryPalette } from "./theory/theoryTheme";

interface Props {
	question: string;
	highlight: string[];
	codeLanguage: string;
	code: string;
	answers: string[];
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
	title,
	step,
	total,
	progress,
	onProceed,
	onClose,
}: Props) {
	const palette = useTheoryPalette();
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
			<LessonScreen
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				tutorial="code_blank"
				tutorialOpen={tutorial}
				onNext={() => allFilled && setModalVisible(true)}
			>
				<ActivityQuestion palette={palette} highlight={highlight} question={question} />
				<CodeSnippet code={filledCode} codeLanguage={codeLanguage} palette={palette} />

				<BlankBank
					palette={palette}
					chips={chips}
					slots={slots}
					onClear={clearSlot}
					// Com uma lacuna só, tocar noutro bloco troca a resposta, em vez de exigir desfazer antes.
					onPick={(index) => (blankCount === 1 ? setSlots([index]) : placeChip(index))}
				/>
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
