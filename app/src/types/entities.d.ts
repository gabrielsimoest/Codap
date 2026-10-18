import type {
	CodeBlankActivityContent,
	CodeEditorActivityContent,
	CodePlaygroundActivityContent,
	FillBlankActivityContent,
	MatchingActivityContent,
	OptionActivityContent,
	ReorderActivityContent,
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

/** Linha de `UserAchievements` — `achievementId` é um dos ids fixos de `ACHIEVEMENT_IDS`. */
export interface UserAchievement {
	achievementId: number;
	unlockedAt: string;
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

// A galeria de atividades (screens/configurations/activityGallery.ts) e o que
// vem da API são a mesma forma, então os tipos são os mesmos: os
// `*ActivityContent` do contrato são a fonte da verdade, e a galeria não pode
// divergir dele sem quebrar o build.
export type Theory = {
	type: "theory";
	lesson: TheoryActivityContent;
};

export type Option = {
	type: "option";
	lesson: OptionActivityContent;
};

export type CodeBlank = {
	type: "code_blank";
	lesson: CodeBlankActivityContent;
};

export type CodePlayground = {
	type: "code_playground";
	lesson: CodePlaygroundActivityContent;
};

export type CodeEditor = {
	type: "code_editor";
	lesson: CodeEditorActivityContent;
};

export type FillBlank = {
	type: "fill_blank";
	lesson: FillBlankActivityContent;
};

export type Reorder = {
	type: "reorder";
	lesson: ReorderActivityContent;
};

export type Matching = {
	type: "matching";
	lesson: MatchingActivityContent;
};

type DummyClass = {
	type: string;
	lesson: string[];
};

export type Classes =
	| Theory
	| Option
	| CodeBlank
	| CodePlayground
	| CodeEditor
	| FillBlank
	| Reorder
	| Matching
	| DummyClass;

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
