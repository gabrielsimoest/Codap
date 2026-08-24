import { useEffect, useState } from "react";
import * as SecureTokenStore from "../services/SecureTokenStore";
import { getCachedProfile, refreshAccessTokenIfNeeded } from "../services/AuthService";
import useUserStore from "../stores/UserStore";

/**
 * Hidrata o estado de sessão a partir do SecureStore na inicialização do
 * app, no mesmo padrão de useCustomTheme/useLanguage/useFontSize (retorna
 * `undefined` enquanto carrega). "Logado" é decidido só pela presença do
 * refresh token local — nunca depende de uma chamada de rede ter sucesso.
 * Também popula a UserStore a partir do perfil em cache (AsyncStorage), já
 * que MainNavigation pode ir direto para "Home" sem nunca montar a tela de
 * Login (que antes era quem populava a UserStore).
 */
const useAuthSession = () => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>();
	const setUser = useUserStore((s) => s.setUser);

	useEffect(() => {
		const hydrate = async () => {
			try {
				const session = await SecureTokenStore.getStoredSession();
				setIsLoggedIn(session !== null);

				if (session !== null) {
					const cachedProfile = await getCachedProfile();
					if (cachedProfile) {
						setUser(cachedProfile);
					}
					// Renovação em background, sem bloquear a hidratação nem o boot do app.
					refreshAccessTokenIfNeeded();
				}
			} catch (error) {
				console.error(error);
				setIsLoggedIn(false);
			}
		};

		hydrate();
	}, []);

	return isLoggedIn;
};

export default useAuthSession;
