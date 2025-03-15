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
