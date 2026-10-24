import { useEffect } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import {
	fetchAppVersionHistory,
	getStoredAppVersionInfo,
} from "../services/AppVersionService";
import useAppUpdateStore from "../stores/AppUpdateStore";
import useLanguageStore from "../stores/LanguageStore";

/** Voltar do segundo plano só reconsulta se a última consulta tiver mais que isto. */
const RECHECK_AFTER_MS = 30 * 60 * 1000;

/**
 * Mantém em dia o que o app sabe sobre as versões publicadas.
 *
 * Carrega primeiro o que está guardado (o aviso e a tela "Versão do aplicativo"
 * funcionam offline, com a última vez que houve rede) e, com rede, consulta a API
 * em segundo plano: no boot, ao trocar de idioma, ao recuperar a conexão e ao
 * voltar do segundo plano depois de um tempo. Fire-and-forget — nunca bloqueia a
 * interface nem mostra erro. A consulta passa pelo `apiClient`, que espera o
 * servidor acordar antes de enviar.
 *
 * Quem **decide** mostrar o aviso é `useAppUpdateNotice`, na aba de aulas.
 */
const useAppVersionSync = () => {
	const language = useLanguageStore((state) => state.language);

	useEffect(() => {
		let cancelled = false;
		let lastCheck = 0;

		const refresh = async () => {
			lastCheck = Date.now();
			const history = await fetchAppVersionHistory(language);
			if (history !== null && !cancelled) {
				useAppUpdateStore.getState().setHistory(history);
			}
		};

		void getStoredAppVersionInfo(language).then(({ history, seenVersion }) => {
			if (cancelled) {
				return;
			}
			const store = useAppUpdateStore.getState();
			store.setHistory(history);
			store.setSeenVersion(seenVersion);
		});
		void refresh();

		const appState = AppState.addEventListener("change", (state) => {
			if (state === "active" && Date.now() - lastCheck > RECHECK_AFTER_MS) {
				void refresh();
			}
		});

		let wasConnected: boolean | null = null;
		const unsubscribeNet = NetInfo.addEventListener((state) => {
			const connected = Boolean(state.isConnected && state.isInternetReachable);
			if (connected && wasConnected === false) {
				void refresh();
			}
			wasConnected = connected;
		});

		return () => {
			cancelled = true;
			appState.remove();
			unsubscribeNet();
		};
	}, [language]);
};

export default useAppVersionSync;
