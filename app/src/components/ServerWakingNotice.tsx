import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { useServerStatusStore } from "../services/ServerWarmup";
import { useAppColors } from "../theme/appColors";

/**
 * "O servidor está acordando": aparece enquanto a API (num plano gratuito que
 * dorme) demora para responder. Só informa e tranquiliza — o app tenta sozinho,
 * a pessoa não precisa fazer nada. Some assim que o servidor responde.
 */
export default function ServerWakingNotice() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const app = useAppColors();
	const status = useServerStatusStore((state) => state.status);

	if (status !== "waking") {
		return null;
	}

	return (
		<View
			style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}
			accessibilityRole="alert"
			accessibilityLiveRegion="polite"
		>
			<ActivityIndicator color={app.action} />
			<Text style={[styles.text, { color: colors.text }]}>{t("server.waking")}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		width: "100%",
		maxWidth: 440,
		padding: 14,
		borderRadius: 16,
		borderWidth: 1,
	},
	text: {
		flex: 1,
		fontSize: 14,
		lineHeight: 20,
	},
});
