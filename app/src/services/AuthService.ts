import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient, ensureFreshAccessToken } from "./ApiClient";
import * as SecureTokenStore from "./SecureTokenStore";
import DatabaseClient from "./DatabaseClient";
import type {
	AuthResponse,
	LoginBody,
	RegisterBody,
} from "codap-api/src/types/contracts";
import type { User } from "../types/entities";

const CACHED_PROFILE_KEY = "CachedProfile";

/**
 * Persiste os tokens (SecureStore) e atualiza o cache local do perfil
 * (SQLite, via DatabaseClient.upsertLocalProfile) + AsyncStorage — é esse
 * cache que permite popular a UserStore no boot sem depender de rede.
 */
async function applySession(authResponse: AuthResponse): Promise<User> {
	await SecureTokenStore.saveSession(authResponse);

	const database = new DatabaseClient();
	database.initDefaultTables();
	const localUser = database.upsertLocalProfile({
		remoteId: authResponse.user.id,
		name: authResponse.user.name,
		email: authResponse.user.email,
		xp: authResponse.user.xp,
		dependabots: authResponse.user.dependabots,
	});

	await AsyncStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(localUser));
	return localUser;
}

export async function register(body: RegisterBody): Promise<void> {
	const { data } = await apiClient.post<AuthResponse>("/auth/register", body);

	// /auth/register também emite uma sessão (auto-login, útil para outros
	// clientes), mas este app força o usuário pela tela de Login em seguida
	// para que ele escolha "lembrar-me" — revoga essa sessão automática em
	// vez de deixar um refresh token válido e nunca usado parado no servidor.
	try {
		await apiClient.post("/auth/logout", { refreshToken: data.refreshToken });
	} catch (error) {
		console.warn(
			"Falha ao revogar a sessão automática do registro (best effort)",
			error
		);
	}
}

export async function login(body: LoginBody): Promise<User> {
	const { data } = await apiClient.post<AuthResponse>("/auth/login", body);
	return applySession(data);
}

export async function logout(): Promise<void> {
	const session = await SecureTokenStore.getStoredSession();
	// Limpeza local acontece incondicionalmente — o logout nunca pode ficar
	// bloqueado esperando o servidor (ou a rede).
	await SecureTokenStore.clearSession();
	await AsyncStorage.removeItem(CACHED_PROFILE_KEY);

	if (!session) {
		return;
	}

	try {
		await apiClient.post("/auth/logout", { refreshToken: session.refreshToken });
	} catch (error) {
		console.warn(
			"Falha ao revogar o refresh token no servidor durante o logout (best effort)",
			error
		);
	}
}

export async function refreshAccessTokenIfNeeded(): Promise<void> {
	await ensureFreshAccessToken();
}

export async function getCachedProfile(): Promise<User | null> {
	const raw = await AsyncStorage.getItem(CACHED_PROFILE_KEY);
	return raw ? JSON.parse(raw) : null;
}
