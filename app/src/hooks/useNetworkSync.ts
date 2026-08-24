import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { refreshAccessTokenIfNeeded } from "../services/AuthService";
import { flushQueue } from "../services/SyncService";

/**
 * Dispara renovação de token + drenagem da SyncQueue ao recuperar
 * conectividade (transição offline -> online) e uma vez no boot, para pegar
 * o que ficou pendente enquanto o app estava fechado. Tudo fire-and-forget —
 * nunca bloqueia a UI nem impede o uso do app offline.
 */
const useNetworkSync = () => {
	useEffect(() => {
		let wasConnected: boolean | null = null;

		const unsubscribe = NetInfo.addEventListener((state) => {
			const isConnected = Boolean(
				state.isConnected && state.isInternetReachable
			);

			if (isConnected && wasConnected === false) {
				refreshAccessTokenIfNeeded().then(() => flushQueue());
			}

			wasConnected = isConnected;
		});

		flushQueue();

		return () => unsubscribe();
	}, []);
};

export default useNetworkSync;
