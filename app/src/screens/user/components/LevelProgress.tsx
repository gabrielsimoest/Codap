import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";
import LevelBar from "../../../components/LevelBar";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import useUserStore from "../../../stores/UserStore";
import { progressInLevel } from "../../../utils/levels";

const BITS_COLOR = "#637aff";

/**
 * Cartão do perfil com o nível, a barra até o próximo nível, o XP total e os
 * Bits. XP e Bits vêm da UserStore, que o app mantém em dia (a conclusão de uma
 * lição e a sincronização atualizam a store) — nada aqui consulta a rede.
 */
export default function LevelProgress() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const user = useUserStore((s) => s.user);

	const xp = user?.xp ?? 0;
	const bits = user?.bits ?? 0;
	const progress = progressInLevel(xp);

	return (
		<View style={[styles.card, { backgroundColor: colors.background }]}>
			<RowView useSize justify="space-between" align="center">
				<ResizableText style={styles.level} defaultSize={22}>
					{t("levels.level", { level: progress.level })}
				</ResizableText>
				<RowView useSize align="center">
					<ResizableText style={styles.bits} defaultSize={20} useCustomColor>
						{`${bits} `}
					</ResizableText>
					<Icon color={BITS_COLOR} type="octicons" name="cpu" size={22} />
				</RowView>
			</RowView>

			<LevelBar fill={progress.fraction} style={styles.bar} />

			<ResizableText style={styles.progressText} defaultSize={16}>
				{progress.isMax
					? t("levels.maxLevel")
					: t("levels.xpProgress", {
							current: progress.xpIntoLevel,
							needed: progress.xpForNextLevel,
					  })}
			</ResizableText>
			<ResizableText style={styles.totalXp} defaultSize={14}>
				{t("levels.totalXp", { xp })}
			</ResizableText>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		marginHorizontal: 10,
		marginTop: 10,
		marginBottom: 5,
		padding: 18,
		borderRadius: 20,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 3,
	},
	level: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	bits: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		color: BITS_COLOR,
	},
	bar: {
		marginTop: 14,
	},
	progressText: {
		marginTop: 8,
		textAlign: "center",
	},
	totalXp: {
		marginTop: 2,
		textAlign: "center",
		opacity: 0.7,
	},
});
