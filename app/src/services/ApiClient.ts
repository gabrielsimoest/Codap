import axios from "axios";
import * as SecureTokenStore from "./SecureTokenStore";
import useAuthStore from "../stores/AuthStore";
import type { RefreshResponse } from "codap-api/src/types/contracts";
import { isOnline, markServerAwake, whenAwake } from "./ServerWarmup";

declare module "axios" {
	interface AxiosRequestConfig {
		/** Não espera o servidor acordar antes de enviar (logout e outras chamadas "melhor esforço"). */
		noWait?: boolean;
		/** Quantas vezes repetir se a requisição falhar por rede/tempo/5xx de infraestrutura. Só para chamadas seguras de repetir. */
		retries?: number;
		/** Pausa antes da primeira repetição, em ms; dobra a cada nova tentativa. */
		retryDelayMs?: number;
	}
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCESS_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

/**
 * Teto para o /auth/refresh.
 *
 * Estourar o teto conta como falta de rede: segue com o token em cache, sem
 * deslogar. Antes, esse teto precisava ser enorme, porque se a API concluísse a
 * rotação depois que o app desistiu, o app ficava com um token já trocado e a
 * tentativa seguinte era lida como roubo — revogava a família e deslogava a
 * pessoa. Isso não acontece mais: a API tolera por 5 minutos um token recém
 * rotacionado (`REFRESH_REUSE_GRACE_MS`, ver api/src/routes/auth/refresh.ts) e
 * devolve um par novo, e o app só manda o refresh depois que o servidor acordou
 * (ver `whenAwake`). Mantenha o teto abaixo do tempo de espera por tentativa, e
 * a tolerância da API acima dele.
 */
const REFRESH_REQUEST_TIMEOUT_MS = 30 * 1000;

/** Padrão das demais requisições: generoso para o catálogo (~150 KB) numa rede lenta. */
const DEFAULT_REQUEST_TIMEOUT_MS = 45 * 1000;

/**
 * Quanto uma requisição espera o servidor acordar antes de ir assim mesmo (e
 * falhar ou funcionar por conta própria). Um pouco acima do pior acordar do
 * Render gratuito.
 */
const WAIT_FOR_SERVER_MS = 100 * 1000;

/** Respostas de infraestrutura enquanto o servidor sobe ou reinicia — não são "resposta da API". */
const GATEWAY_STATUSES = [502, 503, 504];

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: DEFAULT_REQUEST_TIMEOUT_MS,
});

let ensureInFlight: Promise<string | null> | null = null;

/**
 * Garante um access token utilizável, renovando via /auth/refresh quando
 * ausente/perto de expirar. Nunca lança por falta de rede — offline, apenas
 * devolve o que já está em cache (mesmo vencido), deixando a chamada
 * autenticada falhar naturalmente em vez de bloquear o app.
 *
 * Só uma execução por vez: chamadas concorrentes (no boot, a hidratação da
 * sessão, o flush da SyncQueue e as queries de conteúdo disparam juntas)
 * recebem a mesma promise. Sem isso, cada uma leria o mesmo refresh token e
 * chamaria /auth/refresh — a segunda conta como reuso para a API, que revoga
 * a família inteira e desloga o usuário. A promise compartilhada cobre a
 * função inteira, inclusive a leitura do SecureStore: assim a próxima chamada
 * só lê depois que a anterior já salvou o par novo.
 */
export function ensureFreshAccessToken(): Promise<string | null> {
	ensureInFlight ??= ensureFreshAccessTokenNow().finally(() => {
		ensureInFlight = null;
	});
	return ensureInFlight;
}

async function ensureFreshAccessTokenNow(): Promise<string | null> {
	const session = await SecureTokenStore.getStoredSession();
	if (!session) {
		return null;
	}

	const expiresAt = session.accessTokenExpiresAt
		? new Date(session.accessTokenExpiresAt).getTime()
		: 0;
	const isFresh =
		Boolean(session.accessToken) &&
		expiresAt - Date.now() > ACCESS_TOKEN_REFRESH_MARGIN_MS;
	if (isFresh) {
		return session.accessToken;
	}

	try {
		const { data } = await apiClient.post<RefreshResponse>(
			"/auth/refresh",
			{ refreshToken: session.refreshToken },
			{ timeout: REFRESH_REQUEST_TIMEOUT_MS }
		);
		await SecureTokenStore.saveSession(data);
		return data.accessToken;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			// Refresh token realmente inválido/revogado (não é falta de rede) — encerra a sessão local.
			// A AuthStore precisa saber também: é ela que faz App.tsx levar o
			// usuário ao Login com o aviso de sessão expirada.
			await SecureTokenStore.clearSession();
			useAuthStore.getState().expireSession();
			return null;
		}
		return session.accessToken;
	}
}

/**
 * Rotas de `/auth/*` chamadas pela pessoa **logada**, que exigem o Bearer token
 * (as demais — login, registro, refresh, logout, "esqueci a senha" — não usam).
 */
const AUTHENTICATED_AUTH_ROUTES = [
	"/auth/me",
	"/auth/resend-verification",
	"/auth/request-password-change",
	"/auth/change-email",
];

apiClient.interceptors.request.use(async (config) => {
	// Rotas de /auth/* não usam Bearer token — evita recursão em /auth/refresh —,
	// exceto as de conta logada listadas acima.
	if (
		config.url?.startsWith("/auth/") &&
		!AUTHENTICATED_AUTH_ROUTES.includes(config.url)
	) {
		return config;
	}

	const token = await ensureFreshAccessToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

/**
 * Espera o servidor acordar antes de enviar. Registrado **depois** do
 * interceptor do token de propósito: o axios roda os de request do último para o
 * primeiro, e a espera precisa vir antes de qualquer tentativa de renovar o token.
 */
apiClient.interceptors.request.use(async (config) => {
	// Sem nenhuma conexão não há o que enviar: falha na hora, como uma falha de rede
	// de verdade, em vez de esperar o tempo limite (até 45 s com a rede "engolindo"
	// os pacotes, como no modo avião).
	if (!isOnline()) {
		throw new axios.AxiosError("Network Error", axios.AxiosError.ERR_NETWORK, config);
	}
	if (!config.noWait) {
		await whenAwake(WAIT_FOR_SERVER_MS);
	}
	return config;
});

apiClient.interceptors.response.use(
	(response) => {
		markServerAwake();
		return response;
	},
	async (error: unknown) => {
		if (!axios.isAxiosError(error)) {
			throw error;
		}

		const status = error.response?.status;
		// Qualquer resposta que não seja de gateway (inclusive 4xx e 500 da própria
		// API) prova que o servidor está de pé.
		if (status !== undefined && !GATEWAY_STATUSES.includes(status)) {
			markServerAwake();
		}

		const config = error.config;
		const infrastructureFailure =
			status === undefined || GATEWAY_STATUSES.includes(status);
		// Sem rede no aparelho não adianta repetir: falha na hora e a pessoa vê o aviso.
		if (config && (config.retries ?? 0) > 0 && infrastructureFailure && isOnline()) {
			const wait = config.retryDelayMs ?? 5000;
			config.retries = (config.retries ?? 0) - 1;
			config.retryDelayMs = wait * 2;
			await new Promise<void>((resolve) => setTimeout(resolve, wait));
			return apiClient.request(config);
		}

		throw error;
	}
);
