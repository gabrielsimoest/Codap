import axios from "axios";
import * as SecureTokenStore from "./SecureTokenStore";
import type { RefreshResponse } from "codap-api/src/types/contracts";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCESS_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

export const apiClient = axios.create({ baseURL: API_BASE_URL });

/**
 * Garante um access token utilizável, renovando via /auth/refresh quando
 * ausente/perto de expirar. Nunca lança por falta de rede — offline, apenas
 * devolve o que já está em cache (mesmo vencido), deixando a chamada
 * autenticada falhar naturalmente em vez de bloquear o app.
 */
export async function ensureFreshAccessToken(): Promise<string | null> {
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
		const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", {
			refreshToken: session.refreshToken,
		});
		await SecureTokenStore.saveSession(data);
		return data.accessToken;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			// Refresh token realmente inválido/revogado (não é falta de rede) — encerra a sessão local.
			await SecureTokenStore.clearSession();
			return null;
		}
		return session.accessToken;
	}
}

apiClient.interceptors.request.use(async (config) => {
	// Rotas de /auth/* não usam Bearer token — evita recursão em /auth/refresh.
	if (config.url?.startsWith("/auth/")) {
		return config;
	}

	const token = await ensureFreshAccessToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
