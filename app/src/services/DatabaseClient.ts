import * as SQLite from "expo-sqlite";
// `expo-crypto.randomUUID()`, não `nanoid`: o `clientEventId` viaja para
// `POST /sync`, cujo schema exige `format: 'uuid'` — um id do nanoid (21
// caracteres) é rejeitado com 400 pela API. O `nanoid` padrão ainda por cima
// depende de `crypto.getRandomValues`, que não existe no runtime do React
// Native sem polyfill. `randomUUID` resolve os dois de uma vez, nativamente.
import { randomUUID } from "expo-crypto";
import { UserLesson, SyncQueueRow, User } from "../types/entities";
import runMigrations from "./migrations";

/** TODO: Change tables atribute names */

// Uma única conexão, aberta no escopo do módulo e viva enquanto o app viver.
//
// O expo-sqlite faz pooling por nome de banco: abrir "Users.db" de novo devolve
// **a mesma** conexão, não uma nova. Enquanto cada `new DatabaseClient()` abria
// a sua, a classe parecia dona de uma conexão que na verdade era compartilhada
// — e um `close()` em qualquer instância derrubava o banco para todas as
// outras (o login fechava, e a primeira conclusão de lição depois disso
// estourava com NullPointerException no `execSync`). Deixar o
// compartilhamento explícito aqui, sem `close()`, é o padrão recomendado pelo
// próprio expo-sqlite. Não reintroduza um `close()` por instância.
const database = SQLite.openDatabaseSync("Users.db");

export default class DatabaseClient {
	private database = database;

	executeSQL(SQL: string) {
		return this.database.execSync(SQL);
	}

	initDefaultTables() {
		this.database.execSync(
			"CREATE TABLE IF NOT EXISTS Users " +
				"(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, dependaBots INT, xp LONG, doubleXp INT, doubleTime INT);"
		);
		this.database.execSync(
			"CREATE TABLE IF NOT EXISTS UserLessons " +
				"(id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, lessonId INT, " +
				"FOREIGN KEY(userId) REFERENCES Users(id));"
		);
		runMigrations(this.database);
	}

	updateUser(user: User) {
		return this.database.runSync(
			"UPDATE Users SET name=?, email=? WHERE remoteId = ?;",
			[user.name, user.email, user.remoteId]
		);
	}

	getClasses(userId: string) {
		return this.database.getAllSync<UserLesson>(
			"SELECT lessonId FROM UserLessons WHERE userId = ?",
			[userId]
		);
	}

	/**
	 * Grava/atualiza o cache local do perfil vindo da API. `remoteId` é a
	 * própria chave primária de `Users` — não há mais um ID local separado,
	 * já que toda conta nasce no backend (registro exige internet).
	 */
	upsertLocalProfile(profile: {
		remoteId: string;
		name: string;
		email: string;
		xp: number | null;
		dependabots: number | null;
	}): User {
		const now = new Date().toISOString();
		const xp = profile.xp ?? 0;
		const dependaBots = profile.dependabots ?? 0;

		const existing = this.database.getFirstSync<User>(
			"SELECT * FROM Users WHERE remoteId = ? LIMIT 1",
			[profile.remoteId]
		);

		if (existing) {
			this.database.runSync(
				"UPDATE Users SET name = ?, email = ?, xp = ?, dependaBots = ?, lastProfileSyncAt = ? WHERE remoteId = ?;",
				[profile.name, profile.email, xp, dependaBots, now, profile.remoteId]
			);
			return {
				...existing,
				name: profile.name,
				email: profile.email,
				xp,
				dependaBots,
			};
		}

		this.database.runSync(
			"INSERT INTO Users (remoteId, name, email, dependaBots, xp, doubleXp, doubleTime, lastProfileSyncAt) VALUES (?,?,?,?,?,?,?,?);",
			[profile.remoteId, profile.name, profile.email, dependaBots, xp, 0, 0, now]
		);

		return {
			name: profile.name,
			email: profile.email,
			dependaBots,
			xp,
			doubleXp: 0,
			doubleTime: 0,
			remoteId: profile.remoteId,
		};
	}

	/**
	 * Grava a conclusão da lição e a enfileira para sincronização na mesma
	 * transação — é essa atomicidade que garante que o progresso local e a
	 * fila de sync nunca divirjam (ver api/CLAUDE.md e app/CLAUDE.md).
	 */
	completeLesson(userId: string, lessonId: number) {
		const clientEventId = randomUUID();
		const occurredAt = new Date().toISOString();

		this.database.withTransactionSync(() => {
			this.database.runSync(
				"INSERT INTO UserLessons (userId, lessonId) VALUES (?, ?);",
				[userId, lessonId]
			);
			this.database.runSync(
				"INSERT INTO SyncQueue (userId, clientEventId, type, payload, occurredAt) VALUES (?, ?, ?, ?, ?);",
				[
					userId,
					clientEventId,
					"lesson_completed",
					JSON.stringify({ lessonId }),
					occurredAt,
				]
			);
		});
	}

	/** Idempotente localmente: uma conquista já desbloqueada por esse usuário não é enfileirada de novo. */
	unlockAchievement(userId: string, achievementId: number) {
		const occurredAt = new Date().toISOString();

		this.database.withTransactionSync(() => {
			const { changes } = this.database.runSync(
				"INSERT OR IGNORE INTO UserAchievements (userId, achievementId, unlockedAt) VALUES (?, ?, ?);",
				[userId, achievementId, occurredAt]
			);

			if (changes > 0) {
				this.database.runSync(
					"INSERT INTO SyncQueue (userId, clientEventId, type, payload, occurredAt) VALUES (?, ?, ?, ?, ?);",
					[
						userId,
						randomUUID(),
						"achievement_unlocked",
						JSON.stringify({ achievementId }),
						occurredAt,
					]
				);
			}
		});
	}

	/** Só os eventos do usuário atual — outra conta que já tenha usado o mesmo dispositivo fica intocada. */
	getPendingSyncEvents(userId: string, limit = 50) {
		return this.database.getAllSync<SyncQueueRow>(
			"SELECT * FROM SyncQueue WHERE status = 'pending' AND userId = ? ORDER BY createdAt ASC LIMIT ?;",
			[userId, limit]
		);
	}

	markSyncEventsSyncing(ids: number[]) {
		if (ids.length === 0) {
			return;
		}
		const placeholders = ids.map(() => "?").join(",");
		this.database.runSync(
			`UPDATE SyncQueue SET status = 'syncing', updatedAt = datetime('now') WHERE id IN (${placeholders});`,
			ids
		);
	}

	markSyncEventSynced(clientEventId: string) {
		this.database.runSync(
			"UPDATE SyncQueue SET status = 'synced', updatedAt = datetime('now') WHERE clientEventId = ?;",
			[clientEventId]
		);
	}

	markSyncEventFailed(clientEventId: string, error: string) {
		this.database.runSync(
			"UPDATE SyncQueue SET status = 'failed', lastError = ?, updatedAt = datetime('now') WHERE clientEventId = ?;",
			[error, clientEventId]
		);
	}

	/** Falha de rede/transporte (não um erro de negócio) — volta para pending e tenta de novo depois. */
	resetSyncEventsToPending(ids: number[]) {
		if (ids.length === 0) {
			return;
		}
		const placeholders = ids.map(() => "?").join(",");
		this.database.runSync(
			`UPDATE SyncQueue SET status = 'pending', attempts = attempts + 1, updatedAt = datetime('now') WHERE id IN (${placeholders});`,
			ids
		);
	}

}
