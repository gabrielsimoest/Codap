import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./ApiClient";
import type { ContentVersionResponse } from "codap-api/src/types/contracts";

/**
 * Estado do conteúdo já baixado, por idioma.
 *
 * Fica em AsyncStorage, não no SQLite, por quatro motivos — o último é o que
 * realmente decide:
 *
 * 1. São poucos escalares por idioma: sem relação, sem consulta, sem join.
 * 2. É a mesma classe de dado que já mora lá (`CurrentLanguage`, tema, fonte).
 *    O SQLite guarda progresso relacional (`UserLessons`, `SyncQueue`).
 * 3. Uma tabela nova exigiria um passo no runner de `migrations.ts` e bump do
 *    `PRAGMA user_version` — maquinaria de migração para guardar dois números.
 * 4. **Fica na mesma storage que o cache que ela protege.** O cache do React
 *    Query é persistido em AsyncStorage (`queryPersister.ts`), então estado e
 *    cache somem juntos se a storage for limpa. No SQLite, um `clear()` da
 *    AsyncStorage apagaria o cache e deixaria o estado para trás — o app
 *    concluiria que está atualizado sem ter conteúdo nenhum.
 */
const STORAGE_KEY = "ContentVersions";

/** Uma publicação que o aluno ainda não viu, já filtrada para as anunciadas. */
export interface ContentAnnouncement {
	id: number;
	version: string;
	changelog: string;
}

/**
 * Dois marcos separados de propósito: **conteúdo atualizado** (`syncedId`) e
 * **aluno avisado** (`seenId`).
 *
 * Mantê-los num número só obrigaria a avisar no exato momento da atualização —
 * que acontece em segundo plano, possivelmente no meio de uma lição. Separados,
 * o conteúdo troca quando chega e o aviso espera a próxima vez que a pessoa
 * abrir a aba de aulas. Também sobrevive ao app ser fechado antes do aviso: o
 * que está entre os dois marcos continua pendente.
 */
export interface LocaleContentState {
	/** `id` da publicação cujo conteúdo o cache reflete. */
	syncedId: number;
	/** String da versão sincronizada — exibição e depuração, nunca comparação. */
	version: string;
	/** `id` da última publicação de que o aluno já foi avisado. */
	seenId: number;
	/**
	 * Notas já buscadas na API, válidas até `upToId`. Guardadas localmente para
	 * o aviso abrir instantâneo e funcionar offline: quem mostra não depende de
	 * rede no momento de mostrar.
	 */
	announcements?: { upToId: number; entries: ContentAnnouncement[] };
}

/**
 * Formato antigo da chave: só a string da versão (`{"pt":"0.0.29"}`), de antes
 * de existir o aviso. Lido para não rebuscar à toa, e regravado no formato novo
 * na primeira sincronização — tratado como primeira instalação, sem aviso.
 */
export interface LegacyContentState {
	legacyVersion: string;
}

export type StoredContentState = LocaleContentState | LegacyContentState;

type StoredMap = Record<string, LocaleContentState | string>;

export function isLegacyState(
	state: StoredContentState
): state is LegacyContentState {
	return "legacyVersion" in state;
}

/**
 * Teto para as consultas de versão.
 *
 * O `apiClient` não define `timeout`, e o padrão do axios é `0` — sem limite.
 * Numa rede que **aceita a conexão e não responde** (portal cativo de wifi
 * público, servidor pendurado), a promise ficaria viva pelo resto da vida do
 * app. Não dá para confiar só em checar conectividade antes: "conectado" não é
 * o mesmo que "alcançável", e `isInternetReachable` chega indeterminado nos
 * primeiros instantes. Um teto curto cobre todos os modos de falha com um
 * mecanismo só — sem rede, recusada, DNS morto, servidor mudo.
 *
 * Curto de propósito: as respostas têm poucas centenas de bytes, então
 * qualquer coisa além disso é rede ruim, e desistir é melhor que esperar. Vale
 * só para estas consultas — o catálogo (~150 KB) pode legitimamente demorar
 * mais numa rede lenta e não deve herdar este limite.
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

/**
 * Todas as publicações do idioma posteriores a `sinceId`, da mais nova para a
 * mais antiga — ou `null` se a consulta falhar. Mesmo contrato de nunca lançar.
 */
export async function getContentVersionsSince(
	locale: string,
	sinceId: number
): Promise<ContentVersionResponse[] | null> {
	try {
		const { data } = await apiClient.get<ContentVersionResponse[]>(
			"/content-version",
			{ params: { locale, sinceId }, timeout: VERSION_REQUEST_TIMEOUT_MS }
		);
		return Array.isArray(data) ? data : null;
	} catch {
		return null;
	}
}

async function readMap(): Promise<StoredMap> {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return {};
		}
		const parsed: unknown = JSON.parse(raw);
		return parsed !== null && typeof parsed === "object"
			? (parsed as StoredMap)
			: {};
	} catch {
		// JSON corrompido na storage tem o mesmo efeito de "nunca baixei nada":
		// o app rebusca e regrava. Não vale derrubar o boot por isso.
		return {};
	}
}

function toState(
	value: LocaleContentState | string | undefined
): StoredContentState | null {
	if (typeof value === "string") {
		return { legacyVersion: value };
	}
	if (
		value !== null &&
		typeof value === "object" &&
		typeof value.syncedId === "number" &&
		typeof value.seenId === "number"
	) {
		return value;
	}
	return null;
}

export async function getStoredContentState(
	locale: string
): Promise<StoredContentState | null> {
	return toState((await readMap())[locale]);
}

/**
 * Fila das escritas na chave.
 *
 * Duas partes do app escrevem aqui: a sincronização (`syncedId`, notas) e o
 * aviso (`seenId`). Cada escrita é ler-alterar-gravar o mapa inteiro, então
 * duas intercaladas apagariam uma a outra — o aviso fechado bem na hora em que
 * a sincronização termina regravaria um `syncedId` antigo. Encadeando, cada
 * uma lê o resultado da anterior.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

/**
 * Atualiza o estado de um idioma, preservando os demais.
 *
 * `update` recebe o valor atual (lido dentro da fila) e devolve o novo, ou
 * `null` para não escrever nada.
 */
export function updateStoredContentState(
	locale: string,
	update: (current: StoredContentState | null) => LocaleContentState | null
): Promise<void> {
	const run = writeQueue.then(async () => {
		const map = await readMap();
		const next = update(toState(map[locale]));
		if (next === null) {
			return;
		}
		map[locale] = next;
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	});
	// Uma escrita que falha não pode travar as seguintes.
	writeQueue = run.catch(() => undefined);
	return run;
}

/**
 * Se o catálogo precisa ser rebuscado para chegar à publicação `remote`.
 *
 * Compara por **diferença**, não por "maior": cobre rollback (que é uma linha
 * nova) e evita comparar semver no cliente. Pelo `id` no formato novo; pela
 * string no formato antigo, que ainda não tem `id` — assim quem atualiza o app
 * não rebusca o catálogo inteiro só por causa da troca de formato.
 */
export function needsRefetch(
	stored: StoredContentState | null,
	remote: Pick<ContentVersionResponse, "id" | "version">
): boolean {
	if (stored === null) {
		return true;
	}
	if (isLegacyState(stored)) {
		return stored.legacyVersion !== remote.version;
	}
	return stored.syncedId !== remote.id;
}

/**
 * Estado a gravar depois de o catálogo refletir `remote`.
 *
 * Sem estado anterior (primeira instalação, primeira vez neste idioma) ou no
 * formato antigo, já nasce **visto**: um aviso de novidades para quem nunca viu
 * o conteúdo anterior é ruído, não informação.
 */
export function nextSyncedState(
	current: StoredContentState | null,
	remote: Pick<ContentVersionResponse, "id" | "version">
): LocaleContentState {
	if (current === null || isLegacyState(current)) {
		return { syncedId: remote.id, version: remote.version, seenId: remote.id };
	}
	return { ...current, syncedId: remote.id, version: remote.version };
}

/**
 * Busca e guarda as notas do que o aluno ainda não viu.
 *
 * Separada da sincronização de propósito: falhar aqui não desfaz a
 * atualização do conteúdo, e a próxima sincronização tenta de novo. Não faz
 * nada quando não há pendência ou quando as notas até a versão atual já foram
 * buscadas — por isso é barato chamá-la a cada sincronização.
 */
export async function refreshPendingAnnouncements(
	locale: string
): Promise<void> {
	const state = await getStoredContentState(locale);
	if (state === null || isLegacyState(state)) {
		return;
	}
	if (state.seenId >= state.syncedId) {
		return;
	}
	if (state.announcements?.upToId === state.syncedId) {
		return;
	}

	const upToId = state.syncedId;
	const rows = await getContentVersionsSince(locale, state.seenId);
	if (rows === null) {
		return;
	}

	// Uma publicação mais nova que `upToId` pode ter saído entre as duas
	// consultas; o conteúdo dela ainda não foi rebuscado, então fica para a
	// próxima sincronização.
	const entries = rows
		.filter((row) => row.announce && row.id <= upToId)
		.map(({ id, version, changelog }) => ({ id, version, changelog }));

	await updateStoredContentState(locale, (current) => {
		if (current === null || isLegacyState(current)) {
			return null;
		}
		// O aviso foi fechado enquanto a consulta estava em voo.
		if (current.seenId >= upToId) {
			return null;
		}

		const { announcements: _previous, ...rest } = current;
		if (entries.length === 0) {
			// Tudo no intervalo foi publicado sem aviso: não há o que mostrar.
			return { ...rest, seenId: upToId };
		}
		return { ...rest, announcements: { upToId, entries } };
	});
}

/**
 * O que o aviso deve mostrar agora, ou `null` se não há nada.
 *
 * Pura e exportada para poder ser conferida isolada. Só devolve notas mais
 * novas que `seenId`: se a pessoa já viu parte delas (o aviso foi fechado e
 * novas publicações chegaram depois), as já vistas não voltam.
 */
export function selectPendingAnnouncements(
	state: StoredContentState | null
): { upToId: number; entries: ContentAnnouncement[] } | null {
	if (state === null || isLegacyState(state) || !state.announcements) {
		return null;
	}

	const { upToId, entries } = state.announcements;
	if (state.seenId >= upToId) {
		return null;
	}

	const unseen = entries.filter((entry) => entry.id > state.seenId);
	return unseen.length > 0 ? { upToId, entries: unseen } : null;
}

export async function getPendingAnnouncements(
	locale: string
): Promise<{ upToId: number; entries: ContentAnnouncement[] } | null> {
	return selectPendingAnnouncements(await getStoredContentState(locale));
}

/**
 * Marca como visto tudo até `upToId` e descarta as notas guardadas.
 *
 * `Math.max` porque `seenId` só anda para frente: um aviso antigo fechado
 * depois de outro mais novo não pode trazer de volta o que já foi visto.
 */
export function markAnnouncementsSeen(
	locale: string,
	upToId: number
): Promise<void> {
	return updateStoredContentState(locale, (current) => {
		if (current === null || isLegacyState(current)) {
			return null;
		}

		const seenId = Math.max(current.seenId, upToId);
		const { announcements, ...rest } = current;
		const keep =
			announcements !== undefined && announcements.upToId > seenId
				? { announcements }
				: {};

		return { ...rest, seenId, ...keep };
	});
}
