import { apiClient } from "./ApiClient";
import { reloadAchievements } from "./AchievementService";
import { getCachedProfile } from "./AuthService";
import DatabaseClient from "./DatabaseClient";
import { refreshShop } from "./ShopActions";
import useProgressStore from "../stores/ProgressStore";
import useUserStore from "../stores/UserStore";
import type { ProgressResponse } from "codap-api/src/types/contracts";

/**
 * Progresso na nuvem → aparelho.
 *
 * O app é offline-first e escreve o progresso no SQLite, enviando-o à API pela
 * fila (`SyncService`). Esse é o caminho de **ida**. Sem o de **volta**, quem
 * entrasse na conta num aparelho novo (ou reinstalasse o app) veria o XP e os
 * Bits certos — que vêm no login — mas nenhuma lição marcada e nenhum emblema.
 * Esta restauração é o caminho de volta: busca tudo o que o servidor tem
 * (`GET /sync/progress`) e grava no SQLite o que ainda não está aqui.
 *
 * A restauração só **soma**: o que foi feito offline e ainda espera na fila fica
 * intacto, e nada é enviado de volta (ver `DatabaseClient.restoreProgress`).
 */

let inFlight: Promise<void> | null = null;

async function restoreProgressNow(): Promise<void> {
	const profile = await getCachedProfile();
	if (!profile) {
		return;
	}
	const userId = profile.remoteId;

	let progress: ProgressResponse;
	try {
		// Ler é seguro de repetir: tenta de novo sozinho (5 s, depois 10 s) se o
		// servidor ainda estiver acordando.
		const { data } = await apiClient.get<ProgressResponse>("/sync/progress", {
			retries: 2,
			retryDelayMs: 5000,
		});
		progress = data;
	} catch {
		// Sem rede, servidor fora do ar ou sessão sem renovar: o app segue com o
		// que tem e a próxima ocasião (boot, rede de volta, voltar do segundo plano) tenta de novo.
		return;
	}

	// A pessoa pode ter saído da conta (ou trocado de conta) enquanto a resposta vinha.
	if (useUserStore.getState().user?.remoteId !== userId) {
		return;
	}

	const { lessonsAdded, achievementsAdded } = new DatabaseClient().restoreProgress(
		userId,
		progress
	);

	if (lessonsAdded > 0 || achievementsAdded > 0) {
		reloadAchievements(userId);
		useProgressStore.getState().bump();
	}

	// O estado da loja (inclusive a janela de Dobro de XP, que o SQLite precisa
	// para dobrar o XP offline) também nasce vazio num aparelho novo.
	void refreshShop();
}

/** Uma execução por vez; chamadas concorrentes recebem a mesma promise. Nunca lança. */
export function restoreProgress(): Promise<void> {
	inFlight ??= restoreProgressNow()
		.catch(() => undefined)
		.finally(() => {
			inFlight = null;
		});
	return inFlight;
}
