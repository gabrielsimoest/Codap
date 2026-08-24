import { create } from "zustand";

interface AuthStorage {
	isLoggedIn: boolean;
	setSession: (isLoggedIn: boolean) => void;
	clearSession: () => void;
}

const useAuthStore = create<AuthStorage>((set) => ({
	isLoggedIn: false,
	setSession: (isLoggedIn) => set(() => ({ isLoggedIn })),
	clearSession: () => set(() => ({ isLoggedIn: false })),
}));

export default useAuthStore;
