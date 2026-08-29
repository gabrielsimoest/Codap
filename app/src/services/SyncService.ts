import { apiClient } from "./ApiClient";
import DatabaseClient from "./DatabaseClient";
import { getCachedProfile } from "./AuthService";
import type {
	SyncEventInput,
	SyncEventType,
	SyncResponseBody,
} from "codap-api/src/types/contracts";

let isFlushing = false;

/**
 * Drena a SyncQueue local para a API em lote, só os eventos do usuário
 * atualmente logado (o dispositivo pode ter guardado pendências de uma conta
 * anterior — elas ficam intocadas até essa conta logar de novo). Protegida
 * por um lock em memória para não disparar duas vezes em paralelo (ex.: boot
 * e evento de reconexão quase simultâneos). Nunca lança — falha de rede
 * apenas devolve os eventos para "pending" para tentar de novo no próximo
 * gatilho.
 */
export async function flushQueue(): Promise<void> {
	if (isFlushing) {
		return;
	}
	isFlushing = true;

	const database = new DatabaseClient();
	try {
		const currentUser = await getCachedProfile();
		if (!currentUser) {
			return;
		}

		const pending = database.getPendingSyncEvents(currentUser.remoteId);
		if (pending.length === 0) {
			return;
		}

		database.markSyncEventsSyncing(pending.map((event) => event.id));

		const events: SyncEventInput[] = pending.map((event) => ({
			clientEventId: event.clientEventId,
			type: event.type as SyncEventType,
			occurredAt: event.occurredAt,
			payload: JSON.parse(event.payload),
		}));

		try {
			const { data } = await apiClient.post<SyncResponseBody>("/sync", {
				events,
			});

			for (const result of data.results) {
				if (result.status === "applied" || result.status === "duplicate") {
					database.markSyncEventSynced(result.clientEventId);
				} else {
					database.markSyncEventFailed(
						result.clientEventId,
						result.error ?? "unknown_error"
					);
				}
			}
		} catch (error) {
			// Falha de rede/transporte (offline, timeout, sem sessão válida etc.) —
			// nunca marca como failed aqui, só um erro de negócio explícito do
			// servidor deve fazer isso. Volta para pending e tenta de novo depois.
			database.resetSyncEventsToPending(pending.map((event) => event.id));
		}
	} finally {
		isFlushing = false;
	}
}

/**
 * Grava a conclusão de uma lição localmente e já tenta sincronizar em
 * seguida (fire-and-forget — nunca bloqueia quem chamou). Com internet, o
 * evento costuma chegar ao servidor quase na hora; sem internet, cai no
 * mesmo fluxo de retry de sempre (fica pending, tenta de novo no próximo
 * gatilho). Ainda não é chamada por nenhuma tela — ver app/CLAUDE.md.
 */
export function recordLessonCompletion(userId: string, lessonId: number): void {
	const database = new DatabaseClient();
	database.completeLesson(userId, lessonId);
	flushQueue();
}

/** Mesma ideia de recordLessonCompletion, para conquistas desbloqueadas. */
export function recordAchievementUnlock(
	userId: string,
	achievementId: number
): void {
	const database = new DatabaseClient();
	database.unlockAchievement(userId, achievementId);
	flushQueue();
}
