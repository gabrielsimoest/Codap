import axios from "axios";
import type {
	CollectionResponse,
	PurchaseResponse,
	ShopItem,
} from "codap-api/src/types/contracts";
import DatabaseClient from "./DatabaseClient";
import { getShop, purchase, spendInstantHint } from "./ShopService";
import { flushQueue } from "./SyncService";
import queryClient from "./queryClient";
import useShopStore from "../stores/ShopStore";
import useUserStore from "../stores/UserStore";

export type BuyResult =
	| { ok: true; response: PurchaseResponse }
	| {
			ok: false;
			reason:
				| "offline"
				| "pending_sync"
				| "insufficient_bits"
				| "boost_active"
				| "error";
			/** Saldo do servidor, só em `insufficient_bits`. */
			bits?: number;
	  };

export type SpendHintResult =
	| { ok: true; instantHints: number }
	| { ok: false; reason: "offline" | "no_hints" | "error" };

function currentUserId(): string | null {
	return useUserStore.getState().user?.remoteId ?? null;
}

/** Erro sem resposta do servidor (sem conexão, tempo esgotado). */
function isNetworkFailure(error: unknown): boolean {
	return axios.isAxiosError(error) && !error.response;
}

function responseOf(error: unknown): { status: number; message?: string; bits?: number } | null {
	if (!axios.isAxiosError(error) || !error.response) return null;
	const data = error.response.data as { message?: string; bits?: number } | undefined;
	return { status: error.response.status, message: data?.message, bits: data?.bits };
}

/**
 * Compra um item. Tudo é validado no servidor; o app só atualiza o que viu de
 * volta. Antes de comprar, envia a fila de sync: os Bits das lições feitas
 * offline só existem para o servidor depois disso, e uma compra recusada por
 * "saldo insuficiente" com o saldo local cobrindo seria incompreensível. Se
 * ainda sobrar evento pendente (sem conexão, por exemplo), recusa a compra.
 */
export async function buyItem(item: ShopItem, language?: string): Promise<BuyResult> {
	const userId = currentUserId();
	if (!userId) return { ok: false, reason: "error" };

	await flushQueue();
	const database = new DatabaseClient();
	if (database.hasUnsyncedEvents(userId)) {
		return { ok: false, reason: "pending_sync" };
	}

	try {
		// O idioma só vale para o baú (o nome da aula revelada).
		const response = await purchase(item, item === "chest" ? language : undefined);

		// O saldo é o que o servidor devolveu. A fila está vazia (conferido
		// acima), então não há Bits locais à frente do servidor para perder.
		const updated = database.setLocalBits(userId, response.bits);
		const { user, setUser } = useUserStore.getState();
		if (updated && user?.remoteId === userId) {
			setUser({ ...user, bits: updated.bits });
		}
		database.setDoubleXpEndsAt(userId, response.doubleXpEndsAt);
		useShopStore.getState().patch({
			bits: response.bits,
			instantHints: response.instantHints,
			doubleXpEndsAt: response.doubleXpEndsAt,
		});

		// Uma aula nova na coleção: a consulta guardada (por idioma) está velha.
		if (response.chest?.kind === "lesson") {
			queryClient.invalidateQueries({ queryKey: ["collection", userId] });
		}
		// As contagens do baú ("Coleção: X de Y") mudaram: relê o estado.
		if (item === "chest") void refreshShop();

		return { ok: true, response };
	} catch (error) {
		if (isNetworkFailure(error)) return { ok: false, reason: "offline" };
		const failure = responseOf(error);
		if (failure?.status === 402) {
			return { ok: false, reason: "insufficient_bits", bits: failure.bits };
		}
		if (failure?.status === 409 && failure.message === "boost_active") {
			// A janela pode ter sido comprada em outro aparelho: o estado local não a conhece.
			void refreshShop();
			return { ok: false, reason: "boost_active" };
		}
		return { ok: false, reason: "error" };
	}
}

/** Usa uma dica instantânea do estoque (o servidor decrementa). */
export async function spendHint(): Promise<SpendHintResult> {
	try {
		const { instantHints } = await spendInstantHint();
		useShopStore.getState().patch({ instantHints });
		return { ok: true, instantHints };
	} catch (error) {
		if (isNetworkFailure(error)) return { ok: false, reason: "offline" };
		if (responseOf(error)?.status === 409) {
			useShopStore.getState().patch({ instantHints: 0 });
			return { ok: false, reason: "no_hints" };
		}
		return { ok: false, reason: "error" };
	}
}

/**
 * Recarrega o estado da loja. Falha de rede é engolida: a tela segue com o
 * último estado conhecido (ou sem ele, e então não oferece compra). A janela de
 * Dobro de XP do servidor também vai para o SQLite, que é o que o
 * `completeLesson` lê para dobrar o XP offline.
 */
export async function refreshShop(): Promise<void> {
	const userId = currentUserId();
	if (!userId) return;

	try {
		const state = await getShop();
		useShopStore.getState().setState(userId, state);
		const database = new DatabaseClient();
		database.setDoubleXpEndsAt(userId, state.doubleXpEndsAt);

		// O servidor é a autoridade do saldo. Se uma compra foi cobrada e a resposta se
		// perdeu na rede, só aqui o app descobre. Com eventos ainda por enviar o saldo
		// local está à frente do servidor de propósito, então não se mexe nele.
		if (!database.hasUnsyncedEvents(userId)) {
			const updated = database.setLocalBits(userId, state.bits);
			const { user, setUser } = useUserStore.getState();
			if (updated && user?.remoteId === userId) {
				setUser({ ...user, bits: updated.bits });
			}
		}

		// Uma aula revelada que a coleção guardada não tem (resposta perdida, ou outro
		// aparelho): a consulta é infinita, então só uma invalidação a corrige.
		const revealed = state.chest.areas.reduce((sum, area) => sum + area.revealed, 0);
		const stale = queryClient
			.getQueriesData<CollectionResponse>({ queryKey: ["collection", userId] })
			.some(([, data]) => data !== undefined && data.lessons.length !== revealed);
		if (stale) queryClient.invalidateQueries({ queryKey: ["collection", userId] });
	} catch {
		// Sem conexão ou servidor indisponível: o estado anterior continua valendo.
	}
}
