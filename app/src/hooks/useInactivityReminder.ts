import { useEffect } from "react";
import { AppState } from "react-native";
import useAuthStore from "../stores/AuthStore";
import useLanguageStore from "../stores/LanguageStore";
import useNotificationStore from "../stores/NotificationStore";
import {
	areNotificationsAvailable,
	armInactivityReminders,
	cancelInactivityReminders,
	ensureNotificationPermission,
} from "../services/NotificationService";

// Único lugar que decide se os lembretes de inatividade existem: tudo reage ao
// estado (logado + preferência ligada) em vez de cada tela agendar/cancelar.
// Por isso logout manual e sessão expirada — que já viram isLoggedIn=false —
// cancelam os lembretes sem tocar em User.tsx nem no efeito de sessão do App.
//
// `isReady` é o mesmo do App.tsx (splash escondida, não pede permissão com ela
// na tela). Além dele, `enabled === undefined` significa que a preferência
// ainda não foi hidratada: o efeito de hidratação do App roda no mesmo commit,
// então sem essa espera o primeiro login pediria permissão em cima de um
// valor gravado que ainda não chegou à store.
const useInactivityReminder = (isReady: boolean) => {
	const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
	const enabled = useNotificationStore((s) => s.enabled);
	const setEnabled = useNotificationStore((s) => s.setEnabled);
	const language = useLanguageStore((s) => s.language);

	// Preferência nunca decidida: o primeiro login pede a permissão do sistema.
	// Aceitou → ligado; negou → desligado (o switch de Configurações reflete).
	useEffect(() => {
		// (enabled undefined também cai aqui: ainda não hidratada.) Sem o módulo
		// nativo (Expo Go) não há o que pedir, e não se grava "desligado" por
		// causa de uma limitação do ambiente.
		if (
			!isReady ||
			!isLoggedIn ||
			enabled !== null ||
			!areNotificationsAvailable()
		) {
			return;
		}

		let cancelled = false;
		ensureNotificationPermission()
			.then((granted) => {
				if (!cancelled) {
					setEnabled(granted);
				}
			})
			.catch((error) => console.log(error));

		return () => {
			cancelled = true;
		};
	}, [isReady, isLoggedIn, enabled]);

	const active = isReady && isLoggedIn && enabled === true;

	// Re-arma ao abrir e a cada mudança de estado do app (ir para segundo
	// plano, voltar), então a contagem de 7/14/30 dias sempre parte do último
	// uso. `language` na dependência: o texto do lembrete é fixado no agendamento.
	useEffect(() => {
		if (!isReady || enabled === undefined) {
			return;
		}
		if (!active) {
			cancelInactivityReminders().catch((error) => console.log(error));
			return;
		}

		armInactivityReminders().catch((error) => console.log(error));
		const subscription = AppState.addEventListener("change", () => {
			armInactivityReminders().catch((error) => console.log(error));
		});

		return () => {
			subscription.remove();
		};
	}, [isReady, enabled === undefined, active, language]);
};

export default useInactivityReminder;
