import * as SQLite from "expo-sqlite";

/** TODO: Change tables atribute names */

interface User {
	ID: number;
	Name: string;
	Senha: string;
	Email: string;
	DependaBots: number;
	XP: number;
	Double: number;
}

interface Aula {
	ID: number;
	UserID: number;
	TipoAula: number;
}

export default class DatabaseClient {
	private database: SQLite.SQLiteDatabase;

	constructor() {
		this.database = SQLite.openDatabaseSync("Users.db");
	}

	executeSQL(SQL: string) {
		return this.database.execSync(SQL);
	}

	initDefaultTables() {
		this.database.execSync(
			"CREATE TABLE IF NOT EXISTS Users " +
				"(ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Senha TEXT, Email TEXT, DependaBots INT, XP LONG, Double INT);"
		);
		this.database.execSync(
			"CREATE TABLE IF NOT EXISTS Aulas " +
				"(ID INTEGER PRIMARY KEY AUTOINCREMENT, UserID INTEGER, TipoAula INT, " +
				"FOREIGN KEY(UserID) REFERENCES Users(ID));"
		);
	}

	registerUser({
		name,
		email,
		password,
	}: {
		name: string;
		email: string;
		password: string;
	}) {
		return this.database.runSync(
			"INSERT INTO Users (Name, Senha, Email, DependaBots, XP, Double) VALUES (?,?,?,?,?,?)",
			[name, password, email, 0, 0, 0]
		);
	}

	validateUser(email: string, password: string): User | null {
		const user = this.database.getFirstSync<User>(
			"SELECT ID, Senha, DependaBots, XP, Double, Email, Name FROM Users WHERE Email=? LIMIT 1",
			[email]
		);
		console.log(user);

		if (user !== null && user.Senha === password) {
			return user;
		} else {
			return null;
		}
	}

	getClasses(userId: number) {
		return this.database.getAllSync<Aula>(
			"SELECT TipoAula FROM Aulas WHERE UserID = ?",
			[userId]
		);
	}

	close() {
		this.database.closeSync();
	}
}
