import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const NOTIFICATIONS_ENABLED_KEY = "NotificationsEnabled";

interface NotificationStore {
	// undefined = ainda não hidratada a partir do AsyncStorage (quem reage a
	// esta store deve esperar, senão decide em cima de um valor que ainda vai
	// mudar); null = a pessoa nunca decidiu (nunca foi pedida a permissão).
	enabled: boolean | null | undefined;
	// Hidrata a store a partir do AsyncStorage, sem regravar.
	hydrate: (enabled: boolean | null) => void;
	// Muda a preferência e a persiste. Quem chama (switch de Configurações e o
	// pedido de permissão do primeiro login) não precisa lembrar de gravar.
	setEnabled: (enabled: boolean) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
	enabled: undefined,
	hydrate: (enabled) => {
		set(() => ({ enabled }));
	},
	setEnabled: (enabled) => {
		set(() => ({ enabled }));
		AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled)).catch(
			(error) => console.log(error)
		);
	},
}));

export default useNotificationStore;
