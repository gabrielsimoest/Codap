import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";

/**
 * Aquecimento do servidor.
 *
 * A API roda num plano gratuito que **dorme** depois de uns 15 minutos sem
 * tráfego e leva de 30 s a mais de 1 minuto para acordar. Uma requisição feita
 * nesse intervalo fica pendurada (ou estoura o tempo) e, no pior caso, a API a
 * executa depois que o app já desistiu — foi assim que um cadastro "travado"
 * acabou criando a conta. Por isso nada fala com a API antes de ela estar
 * acordada: o app a chama no boot, ao voltar do segundo plano e ao recuperar a
 * rede, e o `apiClient` espera por ela (`whenAwake`) antes de cada requisição.
 *
 * Nada aqui bloqueia a interface: o app inteiro continua funcionando offline, e
 * só as telas de login/cadastro mostram o aviso "servidor acordando".
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export type ServerStatus = "unknown" | "waking" | "awake";

interface ServerStatusState {
	status: ServerStatus;
	setStatus: (status: ServerStatus) => void;
}

/** O que as telas leem para decidir se mostram o aviso de "servidor acordando". */
export const useServerStatusStore = create<ServerStatusState>((set) => ({
	status: "unknown",
	setStatus: (status) => set({ status }),
}));

/** Cada sondagem espera até aqui: uma API acordando pode demorar. */
const PROBE_TIMEOUT_MS = 20 * 1000;
/** Pausa entre sondagens que falharam. */
const RETRY_DELAY_MS = 3 * 1000;
/** Desiste de acordar depois disto (o app segue funcionando offline). */
const MAX_WARMUP_MS = 3 * 60 * 1000;
/** Só depois disto o estado vira "acordando": respostas rápidas não mostram aviso nenhum. */
const SHOW_WAKING_AFTER_MS = 6 * 1000;
/** O Render dorme com 15 min de silêncio; passados 10 sem sinal de vida, sondamos de novo. */
const AWAKE_TTL_MS = 10 * 60 * 1000;

let inFlight: Promise<boolean> | null = null;
let awakeAt = 0;
// Atualizado pelo NetInfo. Começa verdadeiro: "indeterminado" nos primeiros
// instantes não pode contar como sem rede. Só `isConnected === false` (o aparelho
// sem nenhuma conexão: modo avião, sem sinal) conta como offline — olhar também
// `isInternetReachable` bloquearia o app inteiro em redes que impedem a sondagem
// do próprio NetInfo (portal cativo, rede corporativa) mesmo com a API acessível.
let online = true;

NetInfo.addEventListener((state) => {
	online = state.isConnected !== false;
});

const delay = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

/** `GET /` — a rota mais leve da API (`{"root":true}`, sem banco), numa instância do axios sem interceptors. */
async function probe(): Promise<boolean> {
	try {
		const response = await axios.get(`${API_BASE_URL}/`, {
			timeout: PROBE_TIMEOUT_MS,
			validateStatus: (status) => status >= 200 && status < 300,
		});
		return response.status === 200;
	} catch {
		return false;
	}
}

/** Qualquer resposta de verdade do servidor prova que ele está acordado. */
export function markServerAwake(): void {
	awakeAt = Date.now();
	if (useServerStatusStore.getState().status !== "awake") {
		useServerStatusStore.getState().setStatus("awake");
	}
}

function isFreshlyAwake(): boolean {
	return (
		useServerStatusStore.getState().status === "awake" &&
		Date.now() - awakeAt < AWAKE_TTL_MS
	);
}

async function run(): Promise<boolean> {
	const started = Date.now();
	const wakingTimer = setTimeout(() => {
		if (useServerStatusStore.getState().status !== "awake") {
			useServerStatusStore.getState().setStatus("waking");
		}
	}, SHOW_WAKING_AFTER_MS);

	try {
		while (Date.now() - started < MAX_WARMUP_MS) {
			if (!online) {
				// Sem rede não há o que acordar; o NetInfo recomeça quando voltar.
				return false;
			}
			if (await probe()) {
				markServerAwake();
				return true;
			}
			await delay(RETRY_DELAY_MS);
		}
		return false;
	} finally {
		clearTimeout(wakingTimer);
		if (useServerStatusStore.getState().status === "waking") {
			useServerStatusStore.getState().setStatus("unknown");
		}
	}
}

/**
 * Começa (ou reaproveita) o aquecimento. Uma execução por vez; `force` ignora o
 * "acordado há pouco" e sonda de novo (voltar do segundo plano, rede de volta).
 * Nunca lança.
 */
export function startWarmup(force = false): Promise<boolean> {
	if (!API_BASE_URL) {
		return Promise.resolve(true);
	}
	if (!force && isFreshlyAwake()) {
		return Promise.resolve(true);
	}
	inFlight ??= run().finally(() => {
		inFlight = null;
	});
	return inFlight;
}

/**
 * Espera o servidor acordar, no máximo `maxWaitMs`. Devolve `true` se ele
 * respondeu; `false` se estourou o tempo ou se não há rede — nos dois casos quem
 * chamou segue em frente e a requisição falha ou funciona por conta própria.
 */
export async function whenAwake(maxWaitMs: number): Promise<boolean> {
	if (!API_BASE_URL || isFreshlyAwake()) {
		return true;
	}
	if (!online) {
		return false;
	}
	return Promise.race([startWarmup(), delay(maxWaitMs).then(() => false)]);
}

/** O aparelho está com rede? (indeterminado conta como sim). */
export function isOnline(): boolean {
	return online;
}

/** Quanto tempo sem sinal de vida do servidor, em ms (`Infinity` se nunca houve). */
export function msSinceServerSeen(): number {
	return awakeAt === 0 ? Infinity : Date.now() - awakeAt;
}
