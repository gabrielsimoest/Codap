import { useAppColors } from "../../../../theme/appColors";
import { useEffect, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import AppModal from "../../../../components/AppModal";
import ResizableText from "../../../../components/ResizableText";
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

// Mesmas medidas do cartão do `AppModal`: margem de 20 dp, no máximo 440 dp, borda de 1 dp e 20 dp de respiro.
const CARD_MARGIN = 20;
const CARD_MAX_WIDTH = 440;
const CARD_CHROME = 20 * 2 + 2;
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

	const tileWidth = (Math.min(CARD_MAX_WIDTH, width - CARD_MARGIN * 2) - CARD_CHROME - GRID_GAP) / 2;
	const emblemSize = tileWidth - 8;

	return (
		<>
			<AppModal visible={visible} onDismiss={onDismiss} title={t("achievements")} scroll>
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
											shownUnlocked ? [styles.nameUnlocked, { color: app.isDark ? "#637aff" : app.brandText }] : styles.nameLocked,
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
			</AppModal>

			<AchievementSpotlight
				achievement={spotlight}
				onClose={() => setSpotlight(null)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
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
