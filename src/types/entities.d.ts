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

type DummyClass = {
	type: string;
	lesson: string[];
};

export type Classes = Theory | DummyClass;

export type Content = {
	title: string;
	classes: Classes[];
};

export interface ClassContent {
	en: Content[];
	pt: Content[];
}
