import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Title } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import LevelBar from "../../../components/LevelBar";
import ScreenHeader from "../../../components/layout/ScreenHeader";
import ThemedIcon from "../../../components/themed/ThemedIcon";
import useUserStore from "../../../stores/UserStore";
import { useAppColors } from "../../../theme/appColors";
import { progressInLevel } from "../../../utils/levels";

/**
 * Título, Bits e, logo abaixo, o nível com a barra até o próximo. XP e Bits vêm
 * da UserStore, que o app mantém em dia (a conclusão de uma lição e a
 * sincronização atualizam a store) — nada aqui consulta a rede. Texto de cromo,
 * como nos outros cabeçalhos: não acompanha o tamanho de fonte do app.
 */
function UserHeader() {
	const { colors } = useTheme();
	const app = useAppColors();
	const { t } = useTranslation();

	const user = useUserStore((s) => s.user);
	const progress = progressInLevel(user?.xp ?? 0);

	return (
		<ScreenHeader
			footer={
				<View style={styles.level}>
					<View style={styles.levelRow}>
						<Text style={[styles.levelName, { color: colors.text }]}>
							{t("levels.level", { level: progress.level })}
						</Text>
						<Text style={[styles.levelXp, { color: app.muted }]}>
							{progress.isMax
								? t("levels.maxLevel")
								: t("levels.xpProgress", {
										current: progress.xpIntoLevel,
										needed: progress.xpForNextLevel,
								  })}
						</Text>
					</View>
					<LevelBar fill={progress.fraction} style={styles.bar} />
				</View>
			}
		>
			<Title
				style={{
					color: colors.text,
					fontFamily: "Roboto",
					marginLeft: 30,
				}}
			>
				{t("account")}
			</Title>
			<View style={styles.bits}>
				<Text style={[styles.bitsText, { color: colors.text }]}>{user?.bits ?? 0} </Text>
				<ThemedIcon type={"octicons"} name="cpu" size={21} />
			</View>
		</ScreenHeader>
	);
}

export default UserHeader;

const styles = StyleSheet.create({
	bits: {
		marginHorizontal: 16,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	bitsText: {
		fontFamily: "Roboto",
		fontSize: 19,
		fontWeight: "bold",
	},
	level: {
		paddingHorizontal: 30,
		paddingTop: 4,
		paddingBottom: 6,
	},
	levelRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
	},
	levelName: {
		fontFamily: "Roboto",
		fontSize: 17,
		fontWeight: "bold",
	},
	levelXp: {
		fontFamily: "Roboto",
		fontSize: 14,
	},
	bar: {
		marginTop: 8,
		height: 10,
		borderRadius: 5,
	},
});
