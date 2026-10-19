import { apiClient } from "./ApiClient";
import DatabaseClient from "./DatabaseClient";
import { getCachedProfile } from "./AuthService";
import useUserStore from "../stores/UserStore";
import type {
	SyncEventInput,
	SyncEventType,
	SyncResponseBody,
} from "codap-api/src/types/contracts";
import type { LessonCompletionResult, User } from "../types/entities";

let isFlushing = false;

/** Teto da consulta de perfil com a fila vazia (um lote com eventos não tem teto, como sempre foi). */
const PROFILE_REQUEST_TIMEOUT_MS = 8000;

/** Reflete XP e Bits na UserStore (a tela lê dela) — só se a store é do mesmo usuário. */
function reflectInUserStore(updated: User) {
	const { user, setUser } = useUserStore.getState();
	if (user?.remoteId === updated.remoteId) {
		setUser({ ...user, xp: updated.xp, bits: updated.bits });
	}
}

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

		// Eventos presos em `syncing` (app encerrado com o envio em voo) voltam
		// para `pending`: sem isso `hasUnsyncedEvents` ficaria verdadeiro para
		// sempre e o app nunca mais adotaria o valor do servidor.
		database.releaseSyncingEvents(currentUser.remoteId);

		const pending = database.getPendingSyncEvents(currentUser.remoteId);

		// Sem nada para enviar, ainda pergunta ao servidor (`events: []`): é o que
		// corrige o XP/Bits de quem já tinha XP antes de o app calculá-lo
		// localmente, e traz progresso de outro dispositivo. O `apiClient` não tem
		// timeout; esta consulta tem, porque um servidor que não responde seguraria
		// o lock e bloquearia os envios seguintes.
		database.markSyncEventsSyncing(pending.map((event) => event.id));

		const events: SyncEventInput[] = pending.map((event) => ({
			clientEventId: event.clientEventId,
			type: event.type as SyncEventType,
			occurredAt: event.occurredAt,
			payload: JSON.parse(event.payload),
		}));

		let serverProfile: SyncResponseBody["profile"];
		try {
			const { data } = await apiClient.post<SyncResponseBody>(
				"/sync",
				{ events },
				events.length === 0 ? { timeout: PROFILE_REQUEST_TIMEOUT_MS } : undefined
			);

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
			serverProfile = data.profile;
		} catch (error) {
			// Falha de rede/transporte (offline, timeout, sem sessão válida etc.) —
			// nunca marca como failed aqui, só um erro de negócio explícito do
			// servidor deve fazer isso. Volta para pending e tenta de novo depois.
			database.resetSyncEventsToPending(pending.map((event) => event.id));
		}

		// O servidor é a autoridade sobre XP e Bits. Só adota o valor dele quando
		// nada mais espera para ser enviado (checado DEPOIS da resposta: uma lição
		// concluída durante a requisição entrou na fila e o servidor ainda não a
		// conhece). Evento `failed` é terminal e não impede. Fica fora do try
		// acima de propósito: uma falha aqui nunca pode devolver para `pending`
		// eventos que já foram marcados como `synced`.
		if (serverProfile && !database.hasUnsyncedEvents(currentUser.remoteId)) {
			const adopted = database.applyServerProfile(
				currentUser.remoteId,
				serverProfile
			);
			if (adopted) {
				reflectInUserStore(adopted);
			}
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
 * gatilho). Devolve o que a lição rendeu (XP, Bits, nível) e já reflete o novo
 * XP/Bits na UserStore.
 */
export function recordLessonCompletion(
	userId: string,
	lessonId: number
): LessonCompletionResult {
	const database = new DatabaseClient();
	const result = database.completeLesson(userId, lessonId);

	if (result.firstTime) {
		const { user, setUser } = useUserStore.getState();
		if (user?.remoteId === userId) {
			setUser({ ...user, xp: result.xpAfter, bits: result.bitsAfter });
		}
	}

	flushQueue();
	return result;
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
