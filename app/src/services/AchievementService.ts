import type {
	AreaResponse,
	ModuleResponse,
} from "codap-api/src/types/contracts";
import DatabaseClient from "./DatabaseClient";
import queryClient from "./queryClient";
import { recordAchievementUnlock } from "./SyncService";
import { areasQueryOptions } from "../hooks/queries/useAreasQuery";
import { filterPlayable } from "../screens/classes/components/ActivityPlayer";
import useAchievementStore from "../stores/AchievementStore";
import useLanguageStore from "../stores/LanguageStore";

/**
 * Ids FIXOS — os mesmos de `ACHIEVEMENTS` em `api/prisma/seed.ts`. Ao contrário
 * de áreas/lições (autoincrement, mapeadas por posição), a conquista é decidida
 * aqui, offline, e viaja para `/sync` só pelo id: os dois lados precisam
 * concordar sobre ele sem consulta nenhuma. Mudou um, mude o outro.
 */
export const ACHIEVEMENT_IDS = {
	html: 1,
	css: 2,
	javascript: 3,
	webTriad: 4,
} as const;

/** Conquista de cada área, pela POSIÇÃO em `GET /areas` (0 = HTML…) — mesma regra de `areaMetadata.ts`. */
const AREA_ACHIEVEMENTS: number[] = [
	ACHIEVEMENT_IDS.html,
	ACHIEVEMENT_IDS.css,
	ACHIEVEMENT_IDS.javascript,
];

/*
 * Por que não há nenhuma requisição aqui:
 *
 * Uma conquista, uma vez obtida, nunca volta atrás — e quem decide o desbloqueio
 * é o próprio app. O SQLite local (`UserAchievements`) é a fonte da verdade; a
 * nuvem só *recebe* cada desbloqueio uma vez, pela fila de sync. Por cima do
 * SQLite fica a `AchievementStore` (memória), carregada uma única vez por
 * usuário e por sessão do app. A "invalidação" é o próprio desbloqueio: grava
 * no SQLite + enfileira o sync + atualiza a store, e quem lê re-renderiza.
 *
 * A checagem de "área concluída" também é local: lições concluídas vêm de
 * `UserLessons` e o catálogo vem do cache do React Query (persistido, staleTime
 * infinito) — nada aqui dispara rede.
 */

/**
 * Área concluída = todas as lições que este app consegue reproduzir estão em
 * `UserLessons`. Lição sem nenhuma atividade suportada (abre o "em breve") não
 * conta: o usuário não teria como concluí-la nesta versão do app.
 */
export function isAreaComplete(
	modules: ModuleResponse[],
	completedLessonIds: Set<number>
): boolean {
	const required = modules
		.flatMap((module) => module.lessons)
		.filter((lesson) => filterPlayable(lesson.activities).length > 0);
	return (
		required.length > 0 &&
		required.every((lesson) => completedLessonIds.has(lesson.id))
	);
}

/**
 * Módulos da área já em cache, de preferência no idioma atual. Qualquer idioma
 * serve — ids de lição não mudam com a tradução. Sem cache, a área nunca foi
 * aberta neste dispositivo, então também não pode ter sido concluída nele.
 */
function getCachedModules(areaId: number): ModuleResponse[] | undefined {
	const language = useLanguageStore.getState().language;
	const preferred = queryClient.getQueryData<ModuleResponse[]>([
		"modules",
		areaId,
		language,
	]);
	if (preferred && preferred.length > 0) {
		return preferred;
	}
	return queryClient
		.getQueriesData<ModuleResponse[]>({ queryKey: ["modules", areaId] })
		.map(([, data]) => data)
		.find((data) => data !== undefined && data.length > 0);
}

function unlock(userId: string, achievementId: number) {
	// SyncService, não DatabaseClient direto: é ele que agenda o flush para /sync.
	recordAchievementUnlock(userId, achievementId);
	useAchievementStore
		.getState()
		.markUnlocked(achievementId, new Date().toISOString());
}

/**
 * Confere as conquistas de área (todas, ou só a de `onlyAreaId`) e, em
 * seguida, a Tríade Web — que depende dos três emblemas, não das lições.
 */
function evaluate(userId: string, onlyAreaId?: number) {
	const areas = queryClient.getQueryData<AreaResponse[]>(
		areasQueryOptions().queryKey
	);
	const { unlocked } = useAchievementStore.getState();
	let completedLessonIds: Set<number> | null = null;

	areas?.slice(0, AREA_ACHIEVEMENTS.length).forEach((area, index) => {
		const achievementId = AREA_ACHIEVEMENTS[index];
		if (unlocked[achievementId] !== undefined) return;
		if (onlyAreaId !== undefined && area.id !== onlyAreaId) return;

		const modules = getCachedModules(area.id);
		if (!modules) return;

		completedLessonIds ??= new Set(
			new DatabaseClient().getClasses(userId).map((row) => row.lessonId)
		);
		if (isAreaComplete(modules, completedLessonIds)) {
			unlock(userId, achievementId);
		}
	});

	const current = useAchievementStore.getState().unlocked;
	if (
		current[ACHIEVEMENT_IDS.webTriad] === undefined &&
		AREA_ACHIEVEMENTS.every((id) => current[id] !== undefined)
	) {
		unlock(userId, ACHIEVEMENT_IDS.webTriad);
	}
}

/**
 * Carrega as conquistas do SQLite para a store — só na primeira vez por
 * usuário (chamadas seguintes são no-op). Nessa primeira carga roda também uma
 * conferência completa, retroativa: cobre quem já tinha concluído uma área
 * antes de as conquistas existirem.
 */
export function loadAchievements(userId: string) {
	if (useAchievementStore.getState().userId === userId) {
		return;
	}

	const rows = new DatabaseClient().getUnlockedAchievements(userId);
	useAchievementStore.getState().setUnlocked(
		userId,
		Object.fromEntries(rows.map((row) => [row.achievementId, row.unlockedAt]))
	);
	evaluate(userId);
}

/**
 * Chamado ao concluir uma lição — o único momento em que o status pode mudar.
 * Só confere a área daquela lição (e a Tríade). Síncrono, como o resto do
 * acesso ao SQLite: o evento entra na fila no mesmo tick que o da lição, e os
 * dois seguem para /sync no mesmo lote.
 */
export function evaluateAfterLesson(userId: string, areaId: number) {
	loadAchievements(userId);
	evaluate(userId, areaId);
}
