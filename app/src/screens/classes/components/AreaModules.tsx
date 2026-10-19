import { ScrollView, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import ClassButton from "./ClassButton";
import LessonComingSoon from "./LessonComingSoon";
import ModuleCard from "./ModuleCard";
import ModuleListSkeleton from "./ModuleListSkeleton";
import ThemedLine from "../../../components/themed/ThemedLine";
import ThemedView from "../../../components/themed/ThemedView";
import useAreasQuery from "../../../hooks/queries/useAreasQuery";
import useModulesQuery from "../../../hooks/queries/useModulesQuery";
import useCollectionQuery from "../../../hooks/queries/useCollectionQuery";
import useNavigate from "../../../hooks/useNavigate";
import useLanguageStore from "../../../stores/LanguageStore";
import useUserStore from "../../../stores/UserStore";
import DatabaseClient from "../../../services/DatabaseClient";
import areaMetadata, { getAreaIndex } from "../areaMetadata";
import { levelForXp } from "../../../utils/levels";
import { isLessonUnlocked, isOptionalLesson } from "../../../utils/lessonAccess";

interface Props {
	// Sempre definido: `Classes` só monta este componente depois de resolver a
	// área (mostra ModuleListSkeleton até lá), justamente para nunca disparar
	// useModulesQuery com um areaId indefinido.
	areaId: number;
}

export default function AreaModules({ areaId }: Props) {
	const navigation = useNavigate();
	const language = useLanguageStore((s) => s.language);
	const user = useUserStore((s) => s.user);
	const { data: areas } = useAreasQuery();
	// As aulas do baú que a pessoa já revelou: não vêm no catálogo (que é igual
	// para todos), então são encaixadas aqui, ao fim do módulo delas.
	const { data: collection } = useCollectionQuery(user?.remoteId, language);
	const { data: modules, isPending: modulesPending } = useModulesQuery(
		areaId,
		language
	);

	// Lições concluídas ficam só no SQLite local (a API não devolve progresso
	// junto do catálogo). Relido a cada foco para o check aparecer assim que a
	// tela de lição devolve o usuário para cá.
	const [completed, setCompleted] = useState<number[]>([]);
	useFocusEffect(
		useCallback(() => {
			const remoteId = user?.remoteId;
			if (!remoteId) {
				setCompleted([]);
				return;
			}
			const database = new DatabaseClient();
			setCompleted(
				database.getClasses(remoteId).map((row) => row.lessonId)
			);
		}, [user?.remoteId])
	);

	// O nível vem do XP local, então a lista reage na hora (e funciona offline).
	const level = levelForXp(user?.xp ?? 0);

	const areaIndex = getAreaIndex(areas, areaId);
	const metadata = areaIndex >= 0 ? areaMetadata[areaIndex] : undefined;

	if (!metadata) return null;

	if (modulesPending) {
		return <ModuleListSkeleton />;
	}

	return (
		<ScrollView style={styles.scroller}>
			<ThemedView style={styles.container}>
				{modules?.map((module) => {
					const moduleMetadata = metadata.modules[module.index];
					if (!moduleMetadata) return null;
					const chestLessons = (collection?.lessons ?? []).filter(
						(lesson) => lesson.moduleId === module.id
					);

					return (
						<ModuleCard
							key={module.id}
							image={moduleMetadata.image}
							title={module.name}
							subtitle={module.subtitle}
						>
							{module.lessons.length > 0 || chestLessons.length > 0 ? (
								[
								...module.lessons.map((lesson) => {
									const optional = isOptionalLesson(lesson);
									const unlocked = isLessonUnlocked(lesson, level);

									return (
										<ClassButton
											key={lesson.id}
											title={lesson.name}
											checked={completed.includes(lesson.id)}
											// A lição de desafio do módulo ("Testando seus
											// conhecimentos") é a que tem um `code_editor`.
											challenge={lesson.activities.some((activity) => activity.type === "code_editor")}
											// Aula de aprofundamento: opcional, abre a partir de um
											// nível. Bloqueada fica apagada e sem toque.
											deepening={optional && unlocked}
											lockedLevel={
												optional && !unlocked ? lesson.minLevel ?? undefined : undefined
											}
											onPress={() =>
												navigation.navigate("Lesson", {
													areaId,
													moduleId: module.id,
													lessonId: lesson.id,
												})
											}
										/>
									);
								}),
								...chestLessons.map((lesson) => (
									<ClassButton
										key={lesson.id}
										title={lesson.name}
										checked={completed.includes(lesson.id)}
										// Aula exclusiva do baú: já revelada, então sempre aberta.
										chest
										onPress={() =>
											navigation.navigate("Lesson", {
												areaId,
												moduleId: module.id,
												lessonId: lesson.id,
											})
										}
									/>
								)),
								]
							) : (
								<LessonComingSoon />
							)}
							<ThemedLine
								height={2}
								theme="primary"
								style={styles.line}
							/>
						</ModuleCard>
					);
				})}
			</ThemedView>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scroller: {
		marginHorizontal: 10,
		height: "81%",
	},
	container: {
		flex: 1,
		backgroundColor: "#141f29",
	},
	line: {
		marginTop: 10,
		marginBottom: 10,
		marginHorizontal: 15,
	},
});
