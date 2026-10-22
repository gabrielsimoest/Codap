// Curva de nível, XP por lição e Bits por nível.
//
// DUPLICADO em `api/src/utils/levels.ts`: o app importa `codap-api` só como
// tipo (`import type`) e não consegue compartilhar código executável. Mesma
// regra dos ids de conquista — mudou um, mude o outro.
//
// Pontos de referência da curva (XP para ALCANÇAR o nível): 1 = 0, 2 = 54,
// 10 = 519, 19 = 1105, 30 = 1911, 50 = 3630. Com 10 XP por lição, a trilha de
// HTML (550 XP) fecha no nível 10, HTML + CSS (1160) no 19 e a trilha toda
// (1920) no 30.

export const MAX_LEVEL = 50;
export const LESSON_XP_REWARD = 10;

const BITS_PER_LEVEL = 10;

export interface LevelProgress {
	level: number;
	xpIntoLevel: number;
	xpForNextLevel: number | null;
	fraction: number;
	isMax: boolean;
}

/** XP necessário para alcançar `level` (recortado em 1..MAX_LEVEL). */
export function thresholdForLevel(level: number): number {
	const safe = Number.isFinite(level) ? Math.trunc(level) : 1;
	const n = Math.min(Math.max(safe, 1), MAX_LEVEL);
	return Math.round(0.41 * (n - 1) ** 2 + 54 * (n - 1));
}

/** Nível de quem tem `xp`. XP negativo ou `NaN` conta como nível 1; acima do limiar 50, nível 50. */
export function levelForXp(xp: number): number {
	if (!(xp > 0)) return 1;
	for (let level = MAX_LEVEL; level > 1; level--) {
		if (xp >= thresholdForLevel(level)) return level;
	}
	return 1;
}

export function progressInLevel(xp: number): LevelProgress {
	const safeXp = xp > 0 ? xp : 0;
	const level = levelForXp(safeXp);
	const xpIntoLevel = safeXp - thresholdForLevel(level);

	if (level === MAX_LEVEL) {
		return { level, xpIntoLevel, xpForNextLevel: null, fraction: 1, isMax: true };
	}

	const xpForNextLevel = thresholdForLevel(level + 1) - thresholdForLevel(level);
	return {
		level,
		xpIntoLevel,
		xpForNextLevel,
		fraction: xpIntoLevel / xpForNextLevel,
		isMax: false,
	};
}

/** Bits pagos ao alcançar `level`: 10 × nível a partir do nível 2. */
export function bitsForLevel(level: number): number {
	return level >= 2 ? BITS_PER_LEVEL * level : 0;
}

/** Soma os Bits de cada nível cruzado ao ir de `xpBefore` a `xpAfter`. Zero se não houve subida. */
export function bitsEarnedBetween(xpBefore: number, xpAfter: number): number {
	let bits = 0;
	for (let level = levelForXp(xpBefore) + 1; level <= levelForXp(xpAfter); level++) {
		bits += bitsForLevel(level);
	}
	return bits;
}
