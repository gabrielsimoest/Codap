import { useEffect } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { restoreProgress } from "../services/ProgressService";
import useAuthStore from "../stores/AuthStore";

/** Voltar do segundo plano só reconsulta se a última consulta tiver mais que isto (a conta pode ter sido usada em outro aparelho). */
const RECHECK_AFTER_MS = 10 * 60 * 1000;

/**
 * Traz da nuvem as lições concluídas e as conquistas (ver `ProgressService`).
 * Roda quando a pessoa **entra** numa conta (login, ou abrir o app já logado),
 * ao recuperar a conexão e ao voltar do segundo plano depois de um tempo.
 * Fire-and-forget: nunca bloqueia a interface, e sem rede simplesmente não faz
 * nada. A consulta passa pelo `apiClient`, que espera o servidor acordar.
 */
const useProgressSync = () => {
	const loggedIn = useAuthStore((state) => state.isLoggedIn);

	useEffect(() => {
		if (!loggedIn) {
			return;
		}

		let lastRun = Date.now();
		const run = () => {
			lastRun = Date.now();
			void restoreProgress();
		};
		run();

		const appState = AppState.addEventListener("change", (state) => {
			if (state === "active" && Date.now() - lastRun > RECHECK_AFTER_MS) {
				run();
			}
		});

		let wasConnected: boolean | null = null;
		const unsubscribeNet = NetInfo.addEventListener((state) => {
			const connected = Boolean(state.isConnected && state.isInternetReachable);
			if (connected && wasConnected === false) {
				run();
			}
			wasConnected = connected;
		});

		return () => {
			appState.remove();
			unsubscribeNet();
		};
	}, [loggedIn]);
};

export default useProgressSync;
