import * as SQLite from "expo-sqlite";
import { Aula, User } from "../entities";

/** TODO: Change tables atribute names */

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
				"(ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT, email TEXT, dependaBots INT, xp LONG, doubleXp INT, doubleTime INT);"
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
			"INSERT INTO Users (name, password, email, dependaBots, xp, doubleXp, doubleTime) VALUES (?,?,?,?,?,?,?)",
			[name, password, email, 0, 0, 0, 0]
		);
	}

	validateUser(email: string, password: string): User | null {
		const user = this.database.getFirstSync<User>(
			"SELECT * FROM Users WHERE email=? LIMIT 1",
			[email]
		);
		if (user !== null && user.password === password) {
			return user;
		} else {
			return null;
		}
	}

	updateUser(user: User) {
		return this.database.runSync(
			"UPDATE Users SET name=?, email=? WHERE ID = ?;",
			[user.name, user.email, user.ID]
		);
	}

	updateUserPassword(userId: number, password: string) {
		return this.database.runSync(
			"UPDATE Users SET password=? WHERE ID = ?;",
			[password, userId]
		);
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
