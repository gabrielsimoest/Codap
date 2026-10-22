import axios from "axios";
import { apiClient } from "./ApiClient";
import DatabaseClient from "./DatabaseClient";
import type {
	AccountResponse,
	AuthErrorBody,
	ChangeEmailBody,
	ForgotPasswordBody,
} from "codap-api/src/types/contracts";

/**
 * Tetos de tempo: o `apiClient` não tem timeout próprio, e sem teto um servidor
 * que não responde deixaria um modal em "carregando" para sempre. Leitura curta,
 * envio de e-mail um pouco mais folgado.
 */
const READ_TIMEOUT_MS = 10 * 1000;
const WRITE_TIMEOUT_MS = 20 * 1000;

/** O que o app precisa saber do e-mail da conta. */
export interface AccountEmail {
	email: string;
	/** `false` enquanto o link de confirmação não foi aberto. */
	verified: boolean;
}

function toAccountEmail({ user }: AccountResponse): AccountEmail {
	return { email: user.email, verified: user.email_verified_at != null };
}

/** `GET /auth/me`: é como o app descobre que o e-mail foi confirmado no navegador. */
export async function fetchAccountEmail(): Promise<AccountEmail> {
	const { data } = await apiClient.get<AccountResponse>("/auth/me", {
		timeout: READ_TIMEOUT_MS,
	});
	return toAccountEmail(data);
}

/** Pede um novo e-mail de confirmação para o endereço da conta. */
export async function resendVerification(): Promise<void> {
	await apiClient.post("/auth/resend-verification", undefined, {
		timeout: WRITE_TIMEOUT_MS,
	});
}

/**
 * Corrige o e-mail da conta (só enquanto não está confirmado) e já manda a
 * confirmação para o endereço novo. Atualiza o perfil local junto, para o Perfil
 * mostrar o endereço certo mesmo sem rede depois.
 */
export async function changeEmail(
	userId: string,
	email: string
): Promise<AccountEmail> {
	const body: ChangeEmailBody = { email };
	const { data } = await apiClient.post<AccountResponse>(
		"/auth/change-email",
		body,
		{ timeout: WRITE_TIMEOUT_MS }
	);

	const database = new DatabaseClient();
	database.initDefaultTables();
	database.setLocalEmail(userId, data.user.email);

	return toAccountEmail(data);
}

/** A conta logada pede o link de troca de senha, enviado ao próprio e-mail. Exige e-mail confirmado. */
export async function requestPasswordChange(): Promise<void> {
	await apiClient.post("/auth/request-password-change", undefined, {
		timeout: WRITE_TIMEOUT_MS,
	});
}

/** "Esqueci minha senha": a resposta é sempre a mesma, exista a conta (e esteja confirmada) ou não. */
export async function forgotPassword(email: string): Promise<void> {
	const body: ForgotPasswordBody = { email };
	await apiClient.post("/auth/forgot-password", body, {
		timeout: WRITE_TIMEOUT_MS,
	});
}

/**
 * Por que uma chamada de conta falhou, em categorias que as telas sabem
 * explicar. O texto de cada uma vive no i18n do app — o servidor só decide a
 * causa (status e `code`).
 */
export type AccountErrorKind =
	| "offline" // sem resposta: sem internet, API fora do ar ou timeout
	| "rate" // 429: pedidos demais
	| "forbidden" // 403: e-mail não confirmado (senha) ou já confirmado (correção)
	| "taken" // 409: já existe conta com este e-mail
	| "typo" // 400 `email_typo`: domínio com cara de erro de digitação
	| "invalid" // outro 400
	| "unavailable" // 503: o servidor não conseguiu preparar o e-mail
	| "unexpected";

export interface AccountError {
	kind: AccountErrorKind;
	/** Só em `typo`: o e-mail corrigido que o servidor sugere. */
	suggestion?: string;
}

export function classifyAccountError(error: unknown): AccountError {
	if (!axios.isAxiosError<AuthErrorBody>(error)) {
		return { kind: "unexpected" };
	}
	if (!error.response) {
		return { kind: "offline" };
	}

	const { status, data } = error.response;
	if (status === 429) return { kind: "rate" };
	if (status === 403) return { kind: "forbidden" };
	if (status === 409) return { kind: "taken" };
	if (status === 503) return { kind: "unavailable" };
	if (status === 400) {
		return data?.code === "email_typo" && data.suggestion
			? { kind: "typo", suggestion: data.suggestion }
			: { kind: "invalid" };
	}
	return { kind: "unexpected" };
}
