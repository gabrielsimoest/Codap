export interface User {
	ID: number;
	name: string;
	password: string;
	email: string;
	dependaBots: number;
	xp: number;
	doubleXp: number;
	doubleTime: number;
}

export interface Aula {
	ID: number;
	UserID: number;
	TipoAula: number;
}

export type Classes = {
	type: string;
	lesson: string[];
};

export type LanguageContent = {
	title: string;
	classes: Classes[];
};

export interface ClassContent {
	en: LanguageContent[];
	pt: LanguageContent[];
}
