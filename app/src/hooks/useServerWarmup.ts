import { useEffect } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { msSinceServerSeen, startWarmup } from "../services/ServerWarmup";

/** Voltar do segundo plano depois de tanto tempo sem sinal do servidor: ele pode ter dormido. */
const BACKGROUND_REWARM_AFTER_MS = 8 * 60 * 1000;

/**
 * Acorda a API no boot, ao voltar do segundo plano e ao recuperar a rede (ver
 * `ServerWarmup`). Montado uma vez, em `App`, **fora de qualquer tela**: o
 * aquecimento não pode morrer porque uma tela fechou, e vale para quem abre o
 * app já logado ("lembrar-me") tanto quanto para o login e o cadastro.
 */
const useServerWarmup = () => {
	useEffect(() => {
		void startWarmup();

		const appState = AppState.addEventListener("change", (state) => {
			if (state === "active" && msSinceServerSeen() > BACKGROUND_REWARM_AFTER_MS) {
				void startWarmup(true);
			}
		});

		let wasConnected: boolean | null = null;
		const unsubscribeNet = NetInfo.addEventListener((state) => {
			const connected = Boolean(state.isConnected && state.isInternetReachable);
			if (connected && wasConnected === false) {
				void startWarmup(true);
			}
			wasConnected = connected;
		});

		return () => {
			appState.remove();
			unsubscribeNet();
		};
	}, []);
};

export default useServerWarmup;
