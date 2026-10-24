import AsyncStorage from "@react-native-async-storage/async-storage";
import appConfig from "../../app.json";
import { apiClient } from "./ApiClient";
import type { AppVersionResponse } from "codap-api/src/types/contracts";
import { isNewerVersion } from "../utils/semver";

/**
 * Para onde o "Atualizar" leva. O app ainda não está na Play Store: a página
 * oficial é onde ficam os downloads.
 */
export const APP_DOWNLOAD_URL = "https://codap.gabrielsimoesdeveloper.com.br";

/**
 * Versão instalada: o `version` do `app.json` do build. É a mesma que o
 * dashboard pede ao publicar uma versão do app — o número publicado precisa ser
 * o do `app.json` do build que se distribui, ou o aviso nunca (ou sempre) aparece.
 */
export function getInstalledVersion(): string {
	return appConfig.expo.version;
}

/**
 * Estado guardado em AsyncStorage (mesmo lugar do estado de `content_version`:
 * poucos escalares e uma lista curta, sem relação nem consulta):
 *
 * - `history`: o histórico de versões **por idioma**, como veio da API. Deixa o
 *   aviso e a tela "Versão do aplicativo" funcionarem offline, com o que se viu
 *   da última vez que houve rede.
 * - `seenVersion`: a última versão de que a pessoa já foi avisada (e dispensou).
 */
const STORAGE_KEY = "AppVersionInfo";

interface StoredAppVersionInfo {
	history: Record<string, AppVersionResponse[]>;
	seenVersion: string | null;
}

/** Tempo máximo da consulta. Já roda depois de o servidor acordar, então é folgado, mas finito. */
const REQUEST_TIMEOUT_MS = 15 * 1000;

async function readStored(): Promise<StoredAppVersionInfo> {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return { history: {}, seenVersion: null };
		}
		const parsed = JSON.parse(raw) as Partial<StoredAppVersionInfo>;
		return {
			history: parsed.history ?? {},
			seenVersion: parsed.seenVersion ?? null,
		};
	} catch {
		return { history: {}, seenVersion: null };
	}
}

async function writeStored(info: StoredAppVersionInfo): Promise<void> {
	try {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
	} catch {
		// Sem espaço ou storage indisponível: o aviso só se repete, nada quebra.
	}
}

export async function getStoredAppVersionInfo(
	locale: string
): Promise<{ history: AppVersionResponse[]; seenVersion: string | null }> {
	const info = await readStored();
	return { history: info.history[locale] ?? [], seenVersion: info.seenVersion };
}

/**
 * Histórico de versões do idioma na API, da mais nova para a mais antiga — e
 * guardado para uso offline. `null` se a consulta falhar: nunca lança, quem usa
 * segue com o que já tem guardado.
 */
export async function fetchAppVersionHistory(
	locale: string
): Promise<AppVersionResponse[] | null> {
	try {
		const { data } = await apiClient.get<AppVersionResponse[]>("/app-version", {
			params: { locale, limit: 20 },
			timeout: REQUEST_TIMEOUT_MS,
		});
		if (!Array.isArray(data)) {
			return null;
		}
		const info = await readStored();
		await writeStored({ ...info, history: { ...info.history, [locale]: data } });
		return data;
	} catch {
		return null;
	}
}

export async function markAppVersionSeen(version: string): Promise<void> {
	const info = await readStored();
	await writeStored({ ...info, seenVersion: version });
}

/** O que a pessoa precisa saber sobre uma atualização disponível. */
export interface PendingAppUpdate {
	installed: string;
	/** A publicação mais recente (a primeira do histórico que é mais nova que a instalada). */
	latest: AppVersionResponse;
	/** Todas as mais novas que a instalada, da mais nova para a mais antiga. */
	newer: AppVersionResponse[];
	/** Alguma das versões que ela não tem é marcada como importante. */
	important: boolean;
}

/**
 * Há uma versão mais nova que a instalada? Compara por semver — `1.0.10` é mais
 * nova que `1.0.9` — e olha o histórico inteiro, para quem ficou várias versões
 * sem atualizar saber de todas (e de qualquer uma importante no meio).
 */
export function findPendingUpdate(
	history: AppVersionResponse[],
	installed: string
): PendingAppUpdate | null {
	const newer = history.filter((entry) => isNewerVersion(entry.version, installed));
	if (newer.length === 0) {
		return null;
	}
	return {
		installed,
		latest: newer[0],
		newer,
		important: newer.some((entry) => entry.needUpdate),
	};
}
