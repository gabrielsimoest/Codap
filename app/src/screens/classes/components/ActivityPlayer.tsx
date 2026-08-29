import { DimensionValue } from "react-native";
import { useState } from "react";
import type {
	OptionActivityContent,
	TheoryActivityContent,
} from "codap-api/src/types/contracts";
import type { PlayableActivity } from "../../../types/entities";
import TheoryView from "./TheoryLesson";
import OptionExercise from "./OptionExercise";

/**
 * Tipos que este player sabe renderizar. Uma atividade de tipo fora desta
 * lista é filtrada antes de entrar (ver `filterPlayable`) — para estender,
 * basta adicionar o tipo aqui e um `case` no `switch` abaixo.
 */
const SUPPORTED_TYPES = new Set(["theory", "option"]);

export function filterPlayable<T extends PlayableActivity>(activities: T[]): T[] {
	return activities.filter((activity) => SUPPORTED_TYPES.has(activity.type));
}

interface Props {
	activities: PlayableActivity[];
	/** Última atividade concluída. */
	onFinish: () => void;
	/** Usuário saiu no meio. */
	onClose: () => void;
}

/**
 * Percorre as N atividades de uma lição, controlando progresso e despachando
 * cada uma para o componente do seu tipo. Não decide como é exibido: quem
 * monta é a casca — a tela `Lesson` (rota dedicada) ou o `ClassView` (modal do
 * conteúdo de teste).
 */
export default function ActivityPlayer({
	activities,
	onFinish,
	onClose,
}: Props) {
	const [activityIndex, setActivityIndex] = useState(0);

	const current = activities[activityIndex];
	if (!current) return null;

	const progress = `${(
		((activityIndex + 1) / activities.length) *
		100
	).toFixed(0)}%` as DimensionValue;

	const advance = () => {
		if (activityIndex + 1 > activities.length - 1) {
			onFinish();
		} else {
			setActivityIndex(activityIndex + 1);
		}
	};

	switch (current.type) {
		case "theory": {
			const content = current.content as TheoryActivityContent;
			return (
				<TheoryView
					firstParagraph={content.firstParagraph}
					secondParagraph={content.secondParagraph}
					thirdParagraph={content.thirdParagraph}
					endParagraph={content.endParagraph}
					highlight={content.highlight}
					codeLanguage={content.codeLanguage}
					code={content.code}
					onlyCode={content.onlyCode}
					tutorial={content.tutorial}
					progress={progress}
					onProceed={advance}
					onClose={onClose}
				/>
			);
		}
		case "option": {
			const content = current.content as OptionActivityContent;
			return (
				<OptionExercise
					question={content.question}
					aditionalParagraph={content.aditionalParagraph}
					options={content.options}
					correctOption={content.correctOption}
					highlight={content.highlight}
					tutorial={content.tutorial}
					progress={progress}
					onProceed={advance}
					onClose={onClose}
				/>
			);
		}
		default:
			return null;
	}
}
