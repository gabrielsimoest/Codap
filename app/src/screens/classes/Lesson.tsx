import { useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import Icon from "../../components/Icon";
import ThemedView from "../../components/themed/ThemedView";
import ActivityPlayer, { filterPlayable } from "./components/ActivityPlayer";
import LessonComingSoon from "./components/LessonComingSoon";
import LessonComplete from "./components/LessonComplete";
import LessonLocked from "./components/LessonLocked";
import ModuleListSkeleton from "./components/ModuleListSkeleton";
import useModulesQuery from "../../hooks/queries/useModulesQuery";
import useCollectionQuery from "../../hooks/queries/useCollectionQuery";
import useNavigate from "../../hooks/useNavigate";
import useLanguageStore from "../../stores/LanguageStore";
import useUserStore from "../../stores/UserStore";
import { recordLessonCompletion } from "../../services/SyncService";
import { evaluateAfterLesson } from "../../services/AchievementService";
import { buildLessonSession } from "../../utils/buildLessonSession";
import { isLessonUnlocked, lessonXpReward } from "../../utils/lessonAccess";
import { levelForXp } from "../../utils/levels";
import type { LessonCompletionResult } from "../../types/entities";
import type { RootStackParamList } from "../../types/navigation";

/**
 * Tela de uma lição: percorre as atividades vindas da API. Recebe só ids e
 * redescobre a lição no cache de `useModulesQuery` (mesma key da tela de
 * aulas), então não dispara requisição nova — e continua funcionando quando
 * aberta direto por deep link, com o cache ainda vazio.
 */
export default function Lesson() {
	const { params } = useRoute<RouteProp<RootStackParamList, "Lesson">>();
	const { areaId, moduleId, lessonId } = params;

	const navigation = useNavigate();
	const language = useLanguageStore((s) => s.language);
	const user = useUserStore((s) => s.user);
	const { data: modules, isPending } = useModulesQuery(areaId, language);
	// Uma aula do baú não está no catálogo (que é igual para todos): vem da
	// coleção de quem a revelou.
	const { data: collection, isLoading: collectionLoading } = useCollectionQuery(
		user?.remoteId,
		language
	);

	const lesson =
		modules
			?.find((module) => module.id === moduleId)
			?.lessons.find((item) => item.id === lessonId) ??
		collection?.lessons.find((item) => item.id === lessonId);

	// Sorteio da sessão (teoria fixa + prática sorteada/embaralhada) congelado
	// por lição e idioma: um refetch que devolve a mesma lição não re-sorteia
	// no meio do caminho. Fica antes dos returns antecipados (regra dos hooks).
	const activities = useMemo(
		() => (lesson ? buildLessonSession(filterPlayable(lesson.activities)) : []),
		[lesson?.id, language]
	);

	// O que a conclusão rendeu — enquanto existir, a tela de conclusão ocupa o
	// lugar das atividades. Fica antes dos returns antecipados (regra dos hooks).
	const [completion, setCompletion] = useState<LessonCompletionResult | null>(
		null
	);

	const goBack = () => navigation.goBack();

	const finish = () => {
		// Grava a conclusão e enfileira o sync (a própria função dispara o
		// flush). Usar SyncService, nunca DatabaseClient.completeLesson direto,
		// senão o envio para /sync não é agendado.
		if (user?.remoteId) {
			// Uma aula de aprofundamento paga o XP próprio; a trilha, o padrão.
			const result = recordLessonCompletion(
				user.remoteId,
				lessonId,
				lesson ? lessonXpReward(lesson) : undefined
			);
			// Concluir uma lição é o único momento em que uma conquista pode
			// ser desbloqueada — confere a área desta lição (e a Tríade Web).
			evaluateAfterLesson(user.remoteId, areaId);
			setCompletion(result);
			return;
		}
		goBack();
	};

	if (completion) {
		return <LessonComplete result={completion} onContinue={goBack} />;
	}

	// Sem a lição no catálogo, ainda pode estar na coleção que está chegando.
	if (isPending || (!lesson && collectionLoading)) {
		return (
			<ThemedView style={styles.container}>
				<ModuleListSkeleton />
			</ThemedView>
		);
	}

	// Aula de aprofundamento ainda bloqueada para o nível da pessoa (a lista já
	// não deixa tocar nela; isto cobre um deep link). Não roda nada nem paga XP.
	if (lesson && !isLessonUnlocked(lesson, levelForXp(user?.xp ?? 0))) {
		return (
			<ThemedView style={styles.container}>
				<TouchableOpacity onPress={goBack} style={styles.closeButton}>
					<Icon
						type="ionicon"
						name="close-outline"
						color={"#33526E"}
						size={60}
					/>
				</TouchableOpacity>
				<LessonLocked minLevel={lesson.minLevel ?? 0} />
			</ThemedView>
		);
	}

	// Lição inexistente (deep link antigo ou id digitado à mão) ou sem nenhuma
	// atividade que este app saiba renderizar.
	if (activities.length === 0) {
		return (
			<ThemedView style={styles.container}>
				{/* Sem o botão de voltar o usuário ficaria preso aqui: esta
				    tela é a raiz da pilha quando aberta por deep link. */}
				<TouchableOpacity onPress={goBack} style={styles.closeButton}>
					<Icon
						type="ionicon"
						name="close-outline"
						color={"#33526E"}
						size={60}
					/>
				</TouchableOpacity>
				<LessonComingSoon />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ActivityPlayer
				key={`${lessonId}-${language}`}
				activities={activities}
				onFinish={finish}
				onClose={goBack}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	closeButton: {
		width: 60,
	},
});
