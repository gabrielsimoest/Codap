export interface User {
	ID: number;
	Name: string;
	Senha: string;
	Email: string;
	DependaBots: number;
	XP: number;
	Double: number;
}

export interface Aula {
	ID: number;
	UserID: number;
	TipoAula: number;
}
