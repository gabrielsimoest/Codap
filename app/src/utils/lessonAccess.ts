import { LESSON_XP_REWARD } from "./levels";

/*
 * Aula de aprofundamento: uma lição com `minLevel`. É opcional, abre a partir
 * desse nível e rende XP próprio. Uma lição SEM `minLevel` é da trilha
 * principal — e é assim que o app trata também um cache antigo do catálogo,
 * que ainda não traz o campo (ausente conta como nulo).
 */

/** É uma aula de aprofundamento (opcional)? */
export function isOptionalLesson(lesson: { minLevel?: number | null }): boolean {
	return lesson.minLevel != null;
}

/** A lição está aberta para quem está em `level`? A trilha principal está sempre. */
export function isLessonUnlocked(
	lesson: { minLevel?: number | null },
	level: number
): boolean {
	return lesson.minLevel == null || level >= lesson.minLevel;
}

/** XP pago na primeira conclusão: o da lição, ou o padrão (10) se ela não define. */
export function lessonXpReward(lesson: { xpReward?: number | null }): number {
	return lesson.xpReward ?? LESSON_XP_REWARD;
}
