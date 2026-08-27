import { useState } from "react";
import {
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Icon from "../../components/Icon";
import AreaModules from "./components/AreaModules";
import ClassHeader from "./components/ClassHeader";
import ModuleListSkeleton from "./components/ModuleListSkeleton";
import { Modal, Portal } from "react-native-paper";
import ThemedSkeleton from "../../components/themed/ThemedSkeleton";
import ThemedText from "../../components/themed/ThemedText";
import ThemedView from "../../components/themed/ThemedView";
import ThemedTouchableOpacity from "../../components/themed/ThemedTouchableOpacity";
import useAreasQuery from "../../hooks/queries/useAreasQuery";
import areaMetadata, { getAreaIndex } from "./areaMetadata";

export default function Class() {
	const [visibleModal, setVisibleModal] = useState(false);
	const [pickedAreaId, setPickedAreaId] = useState<number>();

	const { data: areas, isPending: areasPending } = useAreasQuery();

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
				<ThemedSkeleton height={70} borderRadius={0} theme="card" />
			) : (
				<TouchableOpacity onPress={() => setVisibleModal(true)}>
					<ClassHeader
						screenName={selectedArea?.name ?? ""}
						iconName={selectedMetadata?.headerIcon ?? ""}
					/>
				</TouchableOpacity>
			)}
			<Portal>
				<Modal
					visible={visibleModal}
					onDismiss={() => setVisibleModal(false)}
					dismissableBackButton
					contentContainerStyle={{
						marginBottom: "auto",
						marginTop: 39,
					}}
					theme={{
						colors: {
							backdrop: "#00000050",
						},
					}}
				>
					<TouchableWithoutFeedback
						onPress={() => setVisibleModal(false)}
						style={{ flex: 1 }}
					>
						<View>
							{areas?.map((area, index) => {
								const metadata = areaMetadata[index];
								if (!metadata) return null;

								return (
									<ThemedTouchableOpacity
										key={area.id}
										style={styles.selector}
										onPress={() => onSelectArea(area.id)}
										theme="card"
									>
										<Icon
											type={metadata.icon.type}
											name={metadata.icon.name}
											size={30}
											color={metadata.color}
										/>
										<ThemedText style={styles.actionText}>
											{" "}
											{area.name}
										</ThemedText>
									</ThemedTouchableOpacity>
								);
							})}
						</View>
					</TouchableWithoutFeedback>
				</Modal>
			</Portal>
			<View>
				{selectedAreaId === undefined ? (
					<ModuleListSkeleton />
				) : (
					<AreaModules areaId={selectedAreaId} />
				)}
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#141f29",
		height: "100%",
	},
	selector: {
		zIndex: 99,
		padding: 20,
		borderWidth: 1,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#0E151C",
		shadowColor: "rgba(0,0,0, 0.3)",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 5,
		shadowOpacity: 0.28,
		shadowRadius: 4,
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	actionText: {
		fontFamily: "Roboto",
		color: "white",
		textAlign: "center",
		fontSize: 20,
		marginLeft: 5,
	},
});
