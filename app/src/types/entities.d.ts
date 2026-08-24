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

export type Theory = {
	type: "theory";
	lesson: {
		firstParagraph: string;
		secondParagraph?: string;
		thirdParagraph?: string;
		endParagraph?: string;
		highlight: string[];
		codeLanguage: "HTML" | "CSS" | "JavaScript";
		code: string;
		onlyCode?: boolean;
		tutorial?: boolean;
	};
};

export type Option = {
	type: "option";
	lesson: {
		question: string;
		aditionalParagraph?: string;
		highlight: string[];
		tutorial?: boolean;
		correctOption: number;
		options: string[];
	};
};

type DummyClass = {
	type: string;
	lesson: string[];
};

export type Classes = Theory | Option | DummyClass;

export type Content = {
	title: string;
	classes: Classes[];
};

export interface ClassContent {
	en: Content[];
	pt: Content[];
}
