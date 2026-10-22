import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import EdgeFade, { HEADER_FADE } from "../../components/layout/EdgeFade";
import { HEADER_ROW_HEIGHT, useHeaderTopPadding } from "../../components/layout/ScreenHeader";
import AreaModules from "./components/AreaModules";
import AreaSelector from "./components/AreaSelector";
import ClassHeader from "./components/ClassHeader";
import ModuleListSkeleton from "./components/ModuleListSkeleton";
import ThemedSkeleton from "../../components/themed/ThemedSkeleton";
import ThemedView from "../../components/themed/ThemedView";
import useAreasQuery from "../../hooks/queries/useAreasQuery";
import useContentAnnouncement from "../../hooks/useContentAnnouncement";
import areaMetadata, { getAreaIndex } from "./areaMetadata";
import ContentUpdateModal from "./components/ContentUpdateModal";

export default function Class() {
	const headerHeight = useHeaderTopPadding() + HEADER_ROW_HEIGHT;
	const [visibleModal, setVisibleModal] = useState(false);
	const [pickedAreaId, setPickedAreaId] = useState<number>();

	const { data: areas, isPending: areasPending } = useAreasQuery();

	// Aviso de "conteúdo atualizado". Mora nesta aba, e não junto da
	// sincronização, porque é aqui que ele nunca interrompe uma lição — ver
	// `useContentAnnouncement`.
	const { announcement, dismiss: dismissAnnouncement } =
		useContentAnnouncement();

	// Área padrão = a primeira retornada por GET /areas (HTML, sempre a
	// primeira criada pelo seeder). Derivado, não sincronizado por useEffect:
	// com o prefetch do boot (App.tsx) as áreas normalmente já estão em cache
	// no primeiro render, e um efeito só definiria isso um render depois.
	// Fica `undefined` só no primeiro boot de cada instalação, enquanto
	// GET /areas ainda está em voo — daí o ModuleListSkeleton abaixo.
	const selectedAreaId = pickedAreaId ?? areas?.[0]?.id;

	const selectedAreaIndex = getAreaIndex(areas, selectedAreaId);
	const selectedArea =
		selectedAreaIndex >= 0 ? areas?.[selectedAreaIndex] : undefined;
	const selectedMetadata =
		selectedAreaIndex >= 0 ? areaMetadata[selectedAreaIndex] : undefined;

	const onSelectArea = (areaId: number) => {
		setPickedAreaId(areaId);
		setVisibleModal(false);
	};

	return (
		<ThemedView style={styles.container}>
			{areasPending ? (
				<ThemedSkeleton height={headerHeight} borderRadius={0} theme="card" />
			) : (
				<TouchableOpacity
					onPress={() => setVisibleModal(true)}
					accessibilityRole="button"
					accessibilityLabel={selectedArea?.name}
				>
					<ClassHeader
						screenName={selectedArea?.name ?? ""}
						iconName={selectedMetadata?.headerIcon ?? ""}
					/>
				</TouchableOpacity>
			)}
			<AreaSelector
				visible={visibleModal}
				areas={areas}
				selectedId={selectedAreaId}
				onSelect={onSelectArea}
				onDismiss={() => setVisibleModal(false)}
			/>
			<View style={styles.body}>
				{selectedAreaId === undefined ? (
					<ModuleListSkeleton />
				) : (
					<AreaModules areaId={selectedAreaId} />
				)}
				<EdgeFade edge="top" height={HEADER_FADE} />
			</View>
			{announcement !== null ? (
				<ContentUpdateModal
					entries={announcement.entries}
					onDismiss={dismissAnnouncement}
				/>
			) : null}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#141f29",
		height: "100%",
	},
	body: {
		flex: 1,
	},
});
