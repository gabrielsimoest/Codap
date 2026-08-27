import { Dimensions, ScrollView, StyleSheet } from "react-native";
import ThemedSkeleton from "../../../components/themed/ThemedSkeleton";
import ThemedView from "../../../components/themed/ThemedView";

const windowHeight = Dimensions.get("window").height;

// Toda área tem sempre 4 módulos (ver api/prisma/seed.ts) — usado só para
// saber quantos placeholders desenhar enquanto os módulos ainda carregam.
const MODULE_SKELETON_COUNT = 4;

/**
 * Placeholder da lista de módulos, no mesmo tamanho/margens de um `ModuleCard`
 * real para não pular o layout quando o conteúdo chega.
 *
 * Compartilhado por dois estados de carregamento diferentes, de propósito:
 * `AreaModules` usa enquanto `useModulesQuery` está `isPending`, e `Classes`
 * usa antes disso, enquanto nem a área ainda foi resolvida (`GET /areas` em
 * voo no primeiro boot). Sem esse segundo uso, `Classes` teria que montar
 * `AreaModules` com `areaId` indefinido só para exibir o placeholder — o que
 * registrava uma entrada de cache órfã `["modules", undefined, <lang>]`.
 */
export default function ModuleListSkeleton() {
	return (
		<ScrollView style={styles.scroller}>
			<ThemedView style={styles.container}>
				{Array.from({ length: MODULE_SKELETON_COUNT }).map((_, index) => (
					<ThemedSkeleton
						key={index}
						height={windowHeight * 0.19}
						theme="primary"
						style={styles.cardSkeleton}
					/>
				))}
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
	cardSkeleton: {
		marginLeft: 20,
		marginRight: 20,
		marginTop: 15,
		marginBottom: 15,
		borderRadius: 20,
	},
});
