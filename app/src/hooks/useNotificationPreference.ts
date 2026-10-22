import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NOTIFICATIONS_ENABLED_KEY } from "../stores/NotificationStore";

// undefined = ainda lendo; null = nunca decidiu; boolean = escolha gravada.
const useNotificationPreference = () => {
	const [preference, setPreference] = useState<boolean | null>();

	useEffect(() => {
		const getPreferenceFromStorage = async () => {
			try {
				const stored = await AsyncStorage.getItem(
					NOTIFICATIONS_ENABLED_KEY
				);
				setPreference(stored === null ? null : stored === "true");
			} catch (error) {
				console.log(error);
				setPreference(null);
			}
		};

		getPreferenceFromStorage();
	}, []);

	return preference;
};

export default useNotificationPreference;
