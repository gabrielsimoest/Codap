import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_TOKEN_KEY = "accessToken";
const ACCESS_TOKEN_EXPIRES_AT_KEY = "accessTokenExpiresAt";

export interface StoredSession {
	refreshToken: string;
	accessToken: string | null;
	accessTokenExpiresAt: string | null;
}

export interface SessionTokens {
	accessToken: string;
	accessTokenExpiresAt: string;
	refreshToken: string;
}

/** "Logado" localmente = existe um refresh token no SecureStore. Nunca depende de rede. */
export async function getStoredSession(): Promise<StoredSession | null> {
	const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
	if (!refreshToken) {
		return null;
	}

	const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
	const accessTokenExpiresAt = await SecureStore.getItemAsync(
		ACCESS_TOKEN_EXPIRES_AT_KEY
	);

	return { refreshToken, accessToken, accessTokenExpiresAt };
}

export async function saveSession(tokens: SessionTokens): Promise<void> {
	await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
	await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
	await SecureStore.setItemAsync(
		ACCESS_TOKEN_EXPIRES_AT_KEY,
		tokens.accessTokenExpiresAt
	);
}

export async function clearSession(): Promise<void> {
	await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
	await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
	await SecureStore.deleteItemAsync(ACCESS_TOKEN_EXPIRES_AT_KEY);
}
