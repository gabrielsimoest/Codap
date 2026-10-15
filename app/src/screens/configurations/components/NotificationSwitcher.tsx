import { StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import useNotificationStore from "../../../stores/NotificationStore";
import useAlertStore from "../../../stores/AlertStore";
import {
	areNotificationsAvailable,
	ensureNotificationPermission,
} from "../../../services/NotificationService";

const NotificationSwitcher = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	const enabled = useNotificationStore((s) => s.enabled);
	const setEnabled = useNotificationStore((s) => s.setEnabled);
	const setAlertMessage = useAlertStore((s) => s.setAlertMessage);
	const setAlertVisible = useAlertStore((s) => s.setAlertVisible);

	// Agendar/cancelar os lembretes não é feito aqui: useInactivityReminder
	// (App.tsx) reage à mudança da store.
	const toggleNotifications = async () => {
		// Expo Go (Android) não tem o módulo nativo: nada a ligar, e não vale
		// mostrar "permissão negada" por uma limitação do ambiente.
		if (!areNotificationsAvailable()) {
			return;
		}
		if (enabled === true) {
			setEnabled(false);
			return;
		}

		const granted = await ensureNotificationPermission();
		if (!granted) {
			setEnabled(false);
			setAlertMessage({
				title: t("alert.notification.title"),
				message: t("alert.notification.message"),
				buttonText: "ok",
			});
			setAlertVisible(true);
			return;
		}
		setEnabled(true);
	};

	return (
		<TouchableOpacity
			style={[
				styles.button,
				{ backgroundColor: theme.colors.background },
			]}
			onPress={toggleNotifications}
		>
			<RowView align="center" justify="space-between">
				<ResizableText defaultSize={20}>
					{t("notifications")}
				</ResizableText>
				<Switch
					style={{ marginTop: 5 }}
					value={enabled === true}
					color={"#5469D3"}
					onChange={toggleNotifications}
				/>
			</RowView>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		height: 60,
		padding: 10,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 10,
		marginBottom: 15,
		borderRadius: 10,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 2,
	},
});

export default NotificationSwitcher;
