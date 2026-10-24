import { create } from "zustand";
import type { AppVersionResponse } from "codap-api/src/types/contracts";

interface AppUpdateState {
	/** Histórico de versões do idioma atual, da mais nova para a mais antiga. Vazio até haver rede ou cache. */
	history: AppVersionResponse[];
	/** Última versão de que a pessoa já foi avisada e dispensou. */
	seenVersion: string | null;
	/** Dispensou o aviso nesta abertura do app (vale para o aviso de atualização importante). */
	dismissedThisSession: boolean;
	setHistory: (history: AppVersionResponse[]) => void;
	setSeenVersion: (version: string | null) => void;
	dismissForSession: () => void;
}

/**
 * Estado do aviso de nova versão do app (ver `AppVersionService`). Em memória: o
 * que persiste (histórico e versão vista) mora em AsyncStorage e é carregado por
 * `useAppVersionSync`; `dismissedThisSession` recomeça a cada abertura do app.
 */
const useAppUpdateStore = create<AppUpdateState>((set) => ({
	history: [],
	seenVersion: null,
	dismissedThisSession: false,
	setHistory: (history) => set({ history }),
	setSeenVersion: (seenVersion) => set({ seenVersion }),
	dismissForSession: () => set({ dismissedThisSession: true }),
}));

export default useAppUpdateStore;
