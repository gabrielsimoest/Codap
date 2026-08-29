import { Classes } from "../../../types/entities";
import { Modal, Portal } from "react-native-paper";
import { useMemo, useState } from "react";
import ClassButton from "./ClassButton";
import ActivityPlayer, { filterPlayable } from "./ActivityPlayer";

interface Props {
	classes: Classes[];
	title: string;
}

/**
 * Casca de modal do conteúdo de teste hardcoded (alcançável só pelo gesto
 * secreto em Configurações — ver SecretTestLesson). O conteúdo vindo da API usa
 * a tela `Lesson`; os dois compartilham o mesmo `ActivityPlayer`.
 */
export default function ClassView({ classes, title }: Props) {
	const [visible, setVisible] = useState(false);

	// O conteúdo hardcoded guarda o payload em `lesson`; o da API, em `content`.
	// O adaptador fica aqui, no caminho legado, e não na tela nova.
	const activities = useMemo(
		() => filterPlayable(classes.map(({ type, lesson }) => ({ type, content: lesson }))),
		[classes]
	);

	return (
		<>
			<Portal>
				<Modal
					visible={visible}
					onDismiss={() => setVisible(false)}
					contentContainerStyle={{ flex: 1 }}
					dismissableBackButton={false}
					dismissable={false}
				>
					{/* Montado só enquanto visível: fechar desmonta o player e
					    zera o progresso sozinho, sem reset manual de índice. */}
					{visible && (
						<ActivityPlayer
							activities={activities}
							onFinish={() => setVisible(false)}
							onClose={() => setVisible(false)}
						/>
					)}
				</Modal>
			</Portal>
			<ClassButton title={title} onPress={() => setVisible(true)} />
		</>
	);
}
