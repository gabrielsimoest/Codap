import { create } from "zustand";

interface AchievementStore {
	/** Dono do mapa abaixo — trocar de conta faz o AchievementService recarregar do SQLite. */
	userId: string | null;
	/** achievementId → unlockedAt (ISO). Espelho em memória de `UserAchievements`. */
	unlocked: Record<number, string>;
	setUnlocked: (userId: string, unlocked: Record<number, string>) => void;
	markUnlocked: (achievementId: number, unlockedAt: string) => void;
}

/**
 * Cache em memória das conquistas do usuário logado. Quem escreve aqui é só o
 * `AchievementService` (carga inicial do SQLite e cada desbloqueio) — telas
 * apenas leem. Ver `AchievementService.ts` pelo porquê de não haver consulta
 * à API.
 */
const useAchievementStore = create<AchievementStore>((set) => ({
	userId: null,
	unlocked: {},
	setUnlocked: (userId, unlocked) => set(() => ({ userId, unlocked })),
	markUnlocked: (achievementId, unlockedAt) =>
		set((store) => ({
			unlocked: { ...store.unlocked, [achievementId]: unlockedAt },
		})),
}));

export default useAchievementStore;
