import { create } from "zustand";

interface AuthStorage {
	isLoggedIn: boolean;
	// Sessão encerrada pelo servidor (refresh token rejeitado com 401), não
	// pelo usuário — App.tsx reage levando ao Login com o aviso e então
	// chama acknowledgeSessionExpired.
	sessionExpired: boolean;
	setSession: (isLoggedIn: boolean) => void;
	clearSession: () => void;
	expireSession: () => void;
	acknowledgeSessionExpired: () => void;
}

const useAuthStore = create<AuthStorage>((set) => ({
	isLoggedIn: false,
	sessionExpired: false,
	setSession: (isLoggedIn) => set(() => ({ isLoggedIn })),
	clearSession: () => set(() => ({ isLoggedIn: false })),
	expireSession: () => set(() => ({ isLoggedIn: false, sessionExpired: true })),
	acknowledgeSessionExpired: () => set(() => ({ sessionExpired: false })),
}));

export default useAuthStore;
