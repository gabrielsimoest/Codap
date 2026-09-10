import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./ApiClient";
import type { ContentVersionResponse } from "codap-api/src/types/contracts";

/**
 * Versões de conteúdo já baixadas, por idioma: `{"pt":"0.1.4","en":"0.0.0"}`.
 *
 * Fica em AsyncStorage, não no SQLite, por quatro motivos — o último é o que
 * realmente decide:
 *
 * 1. É um escalar por idioma: sem relação, sem consulta, sem join.
 * 2. É a mesma classe de dado que já mora lá (`CurrentLanguage`, tema, fonte).
 *    O SQLite guarda progresso relacional (`UserLessons`, `SyncQueue`).
 * 3. Uma tabela nova exigiria um passo no runner de `migrations.ts` e bump do
 *    `PRAGMA user_version` — maquinaria de migração para guardar duas strings.
 * 4. **Fica na mesma storage que o cache que ela protege.** O cache do React
 *    Query é persistido em AsyncStorage (`queryPersister.ts`), então versão e
 *    cache somem juntos se a storage for limpa. No SQLite, um `clear()` da
 *    AsyncStorage apagaria o cache e deixaria a versão para trás — o app
 *    concluiria que está atualizado sem ter conteúdo nenhum.
 */
const STORAGE_KEY = "ContentVersions";

type StoredVersions = Record<string, string>;

/**
 * Teto para a consulta de versão.
 *
 * O `apiClient` não define `timeout`, e o padrão do axios é `0` — sem limite.
 * Numa rede que **aceita a conexão e não responde** (portal cativo de wifi
 * público, servidor pendurado), a promise ficaria viva pelo resto da vida do
 * app. Não dá para confiar só em checar conectividade antes: "conectado" não é
 * o mesmo que "alcançável", e `isInternetReachable` chega indeterminado nos
 * primeiros instantes. Um teto curto cobre todos os modos de falha com um
 * mecanismo só — sem rede, recusada, DNS morto, servidor mudo.
 *
 * Curto de propósito: a resposta tem ~100 bytes, então qualquer coisa além
 * disso é rede ruim, e desistir é melhor que esperar. Vale só para esta
 * consulta — o catálogo (~150 KB) pode legitimamente demorar mais numa rede
 * lenta e não deve herdar este limite.
 */
const VERSION_REQUEST_TIMEOUT_MS = 4000;

/**
 * Versão publicada do conteúdo de um idioma, ou `null` se ainda não houver
 * nenhuma.
 *
 * Nunca lança: sem rede, com a API fora do ar, na estourada do timeout ou com
 * resposta inesperada, o chamador precisa apenas seguir em frente com o cache
 * que já tem. Conteúdo desatualizado é muito melhor que app travado.
 */
export async function getRemoteContentVersion(
	locale: string
): Promise<ContentVersionResponse | null> {
	try {
		const { data } = await apiClient.get<ContentVersionResponse[]>(
			"/content-version",
			{ params: { locale }, timeout: VERSION_REQUEST_TIMEOUT_MS }
		);
		return data[0] ?? null;
	} catch {
		return null;
	}
}

export async function getStoredContentVersion(
	locale: string
): Promise<string | null> {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return null;
		}
		const stored = JSON.parse(raw) as StoredVersions;
		return stored[locale] ?? null;
	} catch {
		// JSON corrompido na storage tem o mesmo efeito de "nunca baixei nada":
		// o app rebusca e regrava. Não vale derrubar o boot por isso.
		return null;
	}
}

/**
 * Grava a versão de um idioma preservando a dos outros.
 *
 * Lê antes de escrever de propósito: um idioma pode estar defasado em relação
 * ao outro (é o ponto de versionar por idioma), então sobrescrever o mapa
 * inteiro apagaria o que se sabe sobre os demais.
 */
export async function saveStoredContentVersion(
	locale: string,
	version: string
): Promise<void> {
	let stored: StoredVersions = {};
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (raw) {
			stored = JSON.parse(raw) as StoredVersions;
		}
	} catch {
		stored = {};
	}

	stored[locale] = version;
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}
