import { create } from "zustand";

interface ProgressState {
	/**
	 * Sobe a cada vez que o progresso da nuvem é aplicado ao SQLite com algo novo.
	 * As telas que leem o progresso local (a lista de lições) a observam para
	 * reler — o SQLite não avisa ninguém quando muda por baixo delas.
	 */
	revision: number;
	bump: () => void;
}

const useProgressStore = create<ProgressState>((set) => ({
	revision: 0,
	bump: () => set((state) => ({ revision: state.revision + 1 })),
}));

export default useProgressStore;
