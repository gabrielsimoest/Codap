import { DimensionValue } from "react-native";
import { useState } from "react";
import type { PlayableActivity } from "../../../types/entities";
import { ACTIVITY_REGISTRY } from "./activityRegistry";

/**
 * Descarta as atividades de tipo que este app não sabe renderizar (fora do
 * `ACTIVITY_REGISTRY`) antes de entrarem no player.
 */
export function filterPlayable<T extends PlayableActivity>(activities: T[]): T[] {
	// `hasOwnProperty`, não `in`: um `type` "constructor" acharia o protótipo.
	return activities.filter((activity) =>
		Object.prototype.hasOwnProperty.call(ACTIVITY_REGISTRY, activity.type)
	);
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
 * cada uma para o componente do seu tipo (`ACTIVITY_REGISTRY`). Não decide
 * como é exibido: quem monta é a casca — a tela `Lesson` (rota dedicada) ou o
 * `ClassView` (modal do conteúdo de teste).
 */
export default function ActivityPlayer({
	activities,
	onFinish,
	onClose,
}: Props) {
	const [activityIndex, setActivityIndex] = useState(0);

	const current = activities[activityIndex];
	if (!current) return null;

	const render = ACTIVITY_REGISTRY[current.type];
	if (!render) return null;

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

	return render({
		content: current.content,
		activityKey: activityIndex,
		progress,
		onProceed: advance,
		onClose,
	});
}
