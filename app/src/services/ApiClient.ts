import axios from "axios";
import * as SecureTokenStore from "./SecureTokenStore";
import useAuthStore from "../stores/AuthStore";
import type { RefreshResponse } from "codap-api/src/types/contracts";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCESS_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

/**
 * Teto para o /auth/refresh.
 *
 * O `apiClient` não define `timeout` (padrão do axios: `0`, sem limite), e
 * toda requisição autenticada espera esta renovação (ver
 * ensureFreshAccessToken). Numa rede que aceita a conexão e não responde, sem
 * teto, a sincronização e a checagem de versão ficariam penduradas até o
 * sistema derrubar a conexão — minutos. Estourar o teto conta como falta de
 * rede: segue com o token em cache, sem deslogar.
 *
 * Generoso de propósito, ao contrário dos 4 s de ContentVersionService:
 * desistir enquanto o servidor ainda processa é pior que esperar. Se a API
 * completa a rotação depois que o app já desistiu, o par novo se perde, o app
 * fica com o refresh token antigo (já revogado) e a próxima tentativa é
 * tratada como reuso — revoga a família e desloga o usuário. O teto precisa
 * ficar bem acima do pior caso legítimo da API (inclui o banco serverless
 * acordando de uma suspensão).
 */
const REFRESH_REQUEST_TIMEOUT_MS = 15 * 1000;

export const apiClient = axios.create({ baseURL: API_BASE_URL });

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
