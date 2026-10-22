import { useAppColors } from "../../../../theme/appColors";
import { useEffect, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from "react-native";
import { Modal, Portal } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/Icon";
import ResizableText from "../../../../components/ResizableText";
import ThemedView from "../../../../components/themed/ThemedView";
import AchievementEmblem from "./AchievementEmblem";
import AchievementSpotlight from "./AchievementSpotlight";
import achievementCatalog, { AchievementDisplay } from "./achievementCatalog";
import { loadAchievements } from "../../../../services/AchievementService";
import useAchievementStore from "../../../../stores/AchievementStore";
import useUserStore from "../../../../stores/UserStore";

interface Props {
	visible: boolean;
	onDismiss: () => void;
}

/** Segurar um emblema por 5 s inverte como ele aparece — só em dev, só visual. */
const DEV_TOGGLE_DELAY_MS = 5000;

const CARD_MARGIN = 20;
const CARD_PADDING = 16;
const GRID_GAP = 12;

export default function AchievementsModal({ visible, onDismiss }: Props) {
	const { t } = useTranslation();
	const app = useAppColors();
	const { width } = useWindowDimensions();
	const remoteId = useUserStore((s) => s.user?.remoteId);
	const storeUserId = useAchievementStore((s) => s.userId);
	const unlocked = useAchievementStore((s) => s.unlocked);

	// Overrides do toggle de dev: achievementId → como exibir. Vivem só neste
	// estado — nunca tocam no SQLite, na fila de sync nem na store.
	const [devOverrides, setDevOverrides] = useState<Record<number, boolean>>({});
	const [spotlight, setSpotlight] = useState<AchievementDisplay | null>(null);

	// No-op depois da primeira carga do usuário: o status vem da store, que
	// só muda quando uma conquista é desbloqueada (AchievementService).
	useEffect(() => {
		if (visible && remoteId) {
			loadAchievements(remoteId);
		}
	}, [visible, remoteId]);

	const isUnlocked = (id: number) =>
		storeUserId === remoteId && unlocked[id] !== undefined;
	const isShownUnlocked = (id: number) => devOverrides[id] ?? isUnlocked(id);

	// Voltar ao estado real descarta o override (e o selo "DEV" some junto).
	const toggleDevOverride = (id: number) =>
		setDevOverrides((current) => {
			const { [id]: _, ...rest } = current;
			const next = !isShownUnlocked(id);
			return next === isUnlocked(id) ? rest : { ...rest, [id]: next };
		});

	const tileWidth = (width - CARD_MARGIN * 2 - CARD_PADDING * 2 - GRID_GAP) / 2;
	const emblemSize = tileWidth - 8;

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				style={{ backgroundColor: app.scrim }}
				dismissableBackButton
			>
				<ThemedView style={styles.card}>
					<View style={styles.header}>
						<ResizableText style={styles.title} defaultSize={24}>
							{t("achievements")}
						</ResizableText>
						<TouchableOpacity
							onPress={onDismiss}
							accessibilityRole="button"
							accessibilityLabel={t("achievement.close")}
						>
							<Icon
								type="ionicon"
								name="close-outline"
								color={"#33526E"}
								size={48}
							/>
						</TouchableOpacity>
					</View>

					<View style={styles.grid}>
						{achievementCatalog.map((achievement) => {
							const shownUnlocked = isShownUnlocked(achievement.id);
							const name = t(`achievement.${achievement.key}.name`);
							const hint = t(`achievement.${achievement.key}.hint`);

							return (
								<Pressable
									key={achievement.id}
									style={({ pressed }) => [
										styles.tile,
										{ width: tileWidth },
										pressed && shownUnlocked && styles.tilePressed,
									]}
									// Bloqueada: toque rápido não faz nada, de propósito.
									onPress={
										shownUnlocked ? () => setSpotlight(achievement) : undefined
									}
									onLongPress={
										__DEV__ ? () => toggleDevOverride(achievement.id) : undefined
									}
									delayLongPress={DEV_TOGGLE_DELAY_MS}
									accessibilityRole={shownUnlocked ? "button" : "image"}
									accessibilityLabel={
										shownUnlocked ? name : `${name}. ${t("achievement.locked")}. ${hint}`
									}
								>
									<AchievementEmblem
										source={achievement.image}
										size={emblemSize}
										unlocked={shownUnlocked}
									/>
									<ResizableText
										useCustomColor
										style={[
											styles.name,
											shownUnlocked ? styles.nameUnlocked : styles.nameLocked,
										]}
										defaultSize={16}
									>
										{name}
									</ResizableText>
									{!shownUnlocked && (
										<ResizableText
											useCustomColor
											style={styles.hint}
											defaultSize={12}
										>
											{hint}
										</ResizableText>
									)}
									{__DEV__ && devOverrides[achievement.id] !== undefined && (
										<Text style={styles.devBadge}>DEV</Text>
									)}
								</Pressable>
							);
						})}
					</View>
				</ThemedView>
			</Modal>

			<AchievementSpotlight
				achievement={spotlight}
				onClose={() => setSpotlight(null)}
			/>
		</Portal>
	);
}

const styles = StyleSheet.create({
	card: {
		margin: CARD_MARGIN,
		padding: CARD_PADDING,
		borderRadius: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	title: {
		fontWeight: "bold",
		marginLeft: 4,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		rowGap: GRID_GAP,
	},
	tile: {
		alignItems: "center",
		paddingBottom: 8,
		borderRadius: 16,
	},
	tilePressed: {
		opacity: 0.8,
	},
	name: {
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 4,
	},
	nameUnlocked: {
		color: "#637aff",
	},
	nameLocked: {
		color: "#7d8b99",
	},
	hint: {
		color: "#7d8b99",
		textAlign: "center",
		marginTop: 2,
		paddingHorizontal: 4,
	},
	devBadge: {
		position: "absolute",
		top: 4,
		right: 4,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
		overflow: "hidden",
		backgroundColor: "#c2410c",
		color: "#fff",
		fontSize: 10,
		fontWeight: "bold",
	},
});
