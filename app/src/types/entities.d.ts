import type {
	OptionActivityContent,
	TheoryActivityContent,
} from "codap-api/src/types/contracts";

export interface User {
	name: string;
	email: string;
	dependaBots: number;
	xp: number;
	doubleXp: number;
	doubleTime: number;
	/** UUID do usuário na API (users.id) — chave primária de Users; toda conta nasce via /auth. */
	remoteId: string;
}

export interface UserLesson {
	id: number;
	userId: string;
	lessonId: number;
}

export type SyncEventType = "lesson_completed" | "achievement_unlocked";
export type SyncQueueStatus = "pending" | "syncing" | "synced" | "failed";

export interface SyncQueueRow {
	id: number;
	userId: string;
	clientEventId: string;
	type: SyncEventType;
	payload: string;
	occurredAt: string;
	status: SyncQueueStatus;
	attempts: number;
	lastError: string | null;
	createdAt: string;
	updatedAt: string;
}

// O conteúdo hardcoded (lessons/html/content/*) e o que vem da API são a mesma
// forma, então os tipos são os mesmos: `TheoryActivityContent`/
// `OptionActivityContent` são a fonte da verdade, e o conteúdo local não pode
// divergir do contrato sem quebrar o build.
export type Theory = {
	type: "theory";
	lesson: TheoryActivityContent;
};

export type Option = {
	type: "option";
	lesson: OptionActivityContent;
};

type DummyClass = {
	type: string;
	lesson: string[];
};

export type Classes = Theory | Option | DummyClass;

/**
 * O que o `ActivityPlayer` sabe reproduzir, venha da API (`ActivityResponse`,
 * que já tem `type`/`content`) ou do conteúdo hardcoded do modal de teste
 * (`Classes`, adaptado de `lesson` para `content`).
 */
export type PlayableActivity = {
	type: string;
	content: unknown;
};

export type Content = {
	title: string;
	classes: Classes[];
};

export interface ClassContent {
	en: Content[];
	pt: Content[];
}
