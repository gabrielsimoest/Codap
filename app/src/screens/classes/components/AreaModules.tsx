import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import ClassList from "./ClassList";
import LessonComingSoon from "./LessonComingSoon";
import ModuleCard from "./ModuleCard";
import ModuleListSkeleton from "./ModuleListSkeleton";
import ThemedLine from "../../../components/themed/ThemedLine";
import ThemedView from "../../../components/themed/ThemedView";
import useAreasQuery from "../../../hooks/queries/useAreasQuery";
import useModulesQuery from "../../../hooks/queries/useModulesQuery";
import useLanguageStore from "../../../stores/LanguageStore";
import areaMetadata, { getAreaIndex } from "../areaMetadata";

interface Props {
	// Sempre definido: `Classes` só monta este componente depois de resolver a
	// área (mostra ModuleListSkeleton até lá), justamente para nunca disparar
	// useModulesQuery com um areaId indefinido.
	areaId: number;
}

// Área/módulo com o conteúdo de teste hardcoded (ver ClassList) — índice 0 =
// primeiro módulo da área HTML (índice 0 = primeira área, ver areaMetadata.ts).
const TEST_LESSON_AREA_INDEX = 0;
const TEST_LESSON_MODULE_INDEX = 0;

export default function AreaModules({ areaId }: Props) {
	const { t } = useTranslation();
	const language = useLanguageStore((s) => s.language);
	const { data: areas } = useAreasQuery();
	const { data: modules, isPending: modulesPending } = useModulesQuery(
		areaId,
		language
	);

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

					const isTestLesson =
						areaIndex === TEST_LESSON_AREA_INDEX &&
						module.index === TEST_LESSON_MODULE_INDEX;

					return (
						<ModuleCard
							key={module.id}
							image={moduleMetadata.image}
							title={module.name}
							subtitle={t(moduleMetadata.subtitleKey)}
						>
							{isTestLesson ? (
								<ClassList topic="HTML" moduleType="basic" />
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
