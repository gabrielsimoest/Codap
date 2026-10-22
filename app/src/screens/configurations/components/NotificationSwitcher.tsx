import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";
import ListRow from "../../../components/ListRow";
import useNotificationStore from "../../../stores/NotificationStore";
import useAlertStore from "../../../stores/AlertStore";
import { useAppColors } from "../../../theme/appColors";
import {
	areNotificationsAvailable,
	ensureNotificationPermission,
} from "../../../services/NotificationService";

const NotificationSwitcher = () => {
	const { t } = useTranslation();
	const app = useAppColors();
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
		<ListRow
			title={t("notifications")}
			icon={{ type: "ionicon", name: "notifications-outline" }}
			onPress={toggleNotifications}
			right={
				<Switch
					accessibilityLabel={t("notifications")}
					value={enabled === true}
					color={app.action}
					onChange={toggleNotifications}
				/>
			}
		/>
	);
};

export default NotificationSwitcher;
