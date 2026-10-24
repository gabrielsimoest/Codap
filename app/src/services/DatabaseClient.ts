import * as SQLite from "expo-sqlite";
// `expo-crypto.randomUUID()`, não `nanoid`: o `clientEventId` viaja para
// `POST /sync`, cujo schema exige `format: 'uuid'` — um id do nanoid (21
// caracteres) é rejeitado com 400 pela API. O `nanoid` padrão ainda por cima
// depende de `crypto.getRandomValues`, que não existe no runtime do React
// Native sem polyfill. `randomUUID` resolve os dois de uma vez, nativamente.
import { randomUUID } from "expo-crypto";
import {
	LessonCompletionResult,
	UserLesson,
	UserAchievement,
	SyncQueueRow,
	User,
} from "../types/entities";
import runMigrations from "./migrations";
import {
	LESSON_XP_REWARD,
	bitsEarnedBetween,
	levelForXp,
} from "../utils/levels";

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
		// Tabela base, mantida como nasceu (com `dependaBots`): as migrações
		// reconstroem e renomeiam (v3 e v5 → coluna `bits`).
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

	/** Atualiza só o e-mail do perfil local (depois de o servidor aceitar a correção do e-mail). */
	setLocalEmail(userId: string, email: string): User | null {
		const { changes } = this.database.runSync(
			"UPDATE Users SET email = ? WHERE remoteId = ?;",
			[email, userId]
		);
		return changes > 0 ? this.getLocalProfile(userId) : null;
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
	 *
	 * XP e Bits locais são uma estimativa imediata (o nível reage offline); o
	 * servidor é a autoridade. Sem eventos esperando para sincronizar, o valor
	 * do servidor vence. Com eventos pendentes, vale o maior dos dois: o local
	 * está à frente por causa deles, e um login não pode apagar isso.
	 */
	upsertLocalProfile(profile: {
		remoteId: string;
		name: string;
		email: string;
		xp: number | null;
		bits: number | null;
	}): User {
		const now = new Date().toISOString();
		const serverXp = profile.xp ?? 0;
		const serverBits = profile.bits ?? 0;

		const existing = this.database.getFirstSync<User>(
			"SELECT * FROM Users WHERE remoteId = ? LIMIT 1",
			[profile.remoteId]
		);

		if (existing) {
			const unsynced = this.hasUnsyncedEvents(profile.remoteId);
			const xp = unsynced ? Math.max(existing.xp ?? 0, serverXp) : serverXp;
			const bits = unsynced
				? Math.max(existing.bits ?? 0, serverBits)
				: serverBits;

			this.database.runSync(
				"UPDATE Users SET name = ?, email = ?, xp = ?, bits = ?, lastProfileSyncAt = ? WHERE remoteId = ?;",
				[profile.name, profile.email, xp, bits, now, profile.remoteId]
			);
			return {
				...existing,
				name: profile.name,
				email: profile.email,
				xp,
				bits,
			};
		}

		this.database.runSync(
			"INSERT INTO Users (remoteId, name, email, bits, xp, doubleXp, doubleTime, lastProfileSyncAt) VALUES (?,?,?,?,?,?,?,?);",
			[profile.remoteId, profile.name, profile.email, serverBits, serverXp, 0, 0, now]
		);

		return {
			name: profile.name,
			email: profile.email,
			bits: serverBits,
			xp: serverXp,
			doubleXp: 0,
			doubleTime: 0,
			remoteId: profile.remoteId,
		};
	}

	/** Perfil guardado no SQLite (fonte de exibição de XP e Bits), ou `null` se a conta nunca logou neste aparelho. */
	getLocalProfile(userId: string): User | null {
		const row = this.database.getFirstSync<User>(
			"SELECT * FROM Users WHERE remoteId = ? LIMIT 1",
			[userId]
		);
		return row ? { ...row, xp: row.xp ?? 0, bits: row.bits ?? 0 } : null;
	}

	/** Há eventos `pending` ou `syncing` desse usuário? (`failed` é terminal e `synced` já está no servidor.) */
	hasUnsyncedEvents(userId: string): boolean {
		return (
			this.database.getFirstSync(
				"SELECT 1 AS found FROM SyncQueue WHERE userId = ? AND status IN ('pending', 'syncing') LIMIT 1;",
				[userId]
			) !== null
		);
	}

	/** Adota o XP e os Bits que o servidor confirmou. `null` se o usuário não existe localmente. */
	applyServerProfile(
		userId: string,
		profile: { xp: number; bits: number }
	): User | null {
		const { changes } = this.database.runSync(
			"UPDATE Users SET xp = ?, bits = ? WHERE remoteId = ?;",
			[profile.xp, profile.bits, userId]
		);
		return changes > 0 ? this.getLocalProfile(userId) : null;
	}

	/**
	 * Grava a conclusão da lição e a enfileira para sincronização na mesma
	 * transação — é essa atomicidade que garante que o progresso local e a
	 * fila de sync nunca divirjam (ver api/CLAUDE.md e app/CLAUDE.md). A mesma
	 * transação paga o XP e os Bits dos níveis cruzados.
	 *
	 * Só a primeira conclusão de cada lição rende: refazer uma lição não grava
	 * nada (o servidor também recusaria como duplicada). `xpReward` é o XP da
	 * lição (uma aula de aprofundamento paga mais que as 10 padrão) — o mesmo
	 * valor que o servidor lê de `lessons.xp_reward`.
	 */
	completeLesson(
		userId: string,
		lessonId: number,
		xpReward: number = LESSON_XP_REWARD
	): LessonCompletionResult {
		const clientEventId = randomUUID();
		const occurredAt = new Date().toISOString();
		let result!: LessonCompletionResult;

		this.database.withTransactionSync(() => {
			const current = this.database.getFirstSync<{
				xp: number | null;
				bits: number | null;
				doubleXpEndsAt: string | null;
			}>("SELECT xp, bits, doubleXpEndsAt FROM Users WHERE remoteId = ?;", [userId]);
			const xpBefore = current?.xp ?? 0;
			const bitsBefore = current?.bits ?? 0;
			const levelBefore = levelForXp(xpBefore);

			const alreadyDone =
				this.database.getFirstSync(
					"SELECT 1 AS found FROM UserLessons WHERE userId = ? AND lessonId = ? LIMIT 1;",
					[userId, lessonId]
				) !== null;

			if (alreadyDone) {
				result = {
					firstTime: false,
					xpGained: 0,
					bitsGained: 0,
					xpBefore,
					xpAfter: xpBefore,
					levelBefore,
					levelAfter: levelBefore,
					bitsAfter: bitsBefore,
					boosted: false,
				};
				return;
			}

			// Dobro de XP: vale se a conclusão acontece até o fim da janela que o
			// servidor concedeu na compra. O servidor aplica a mesma regra pelo
			// horário do evento; se os relógios destoarem, a adoção do `profile`
			// corrige o XP depois.
			const boosted =
				current?.doubleXpEndsAt != null &&
				new Date(occurredAt).getTime() <= new Date(current.doubleXpEndsAt).getTime();
			const xpGained = xpReward * (boosted ? 2 : 1);
			const xpAfter = xpBefore + xpGained;
			const bitsGained = bitsEarnedBetween(xpBefore, xpAfter);
			const bitsAfter = bitsBefore + bitsGained;

			this.database.runSync(
				"INSERT INTO UserLessons (userId, lessonId) VALUES (?, ?);",
				[userId, lessonId]
			);
			this.database.runSync(
				"UPDATE Users SET xp = ?, bits = ? WHERE remoteId = ?;",
				[xpAfter, bitsAfter, userId]
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

			result = {
				firstTime: true,
				xpGained,
				bitsGained,
				xpBefore,
				xpAfter,
				levelBefore,
				levelAfter: levelForXp(xpAfter),
				bitsAfter,
				boosted,
			};
		});

		return result;
	}

	/** Grava (ou, com `null`, limpa) o fim da janela de Dobro de XP que o servidor concedeu. */
	setDoubleXpEndsAt(userId: string, endsAt: string | null): void {
		this.database.runSync(
			"UPDATE Users SET doubleXpEndsAt = ? WHERE remoteId = ?;",
			[endsAt, userId]
		);
	}

	/** Sobrescreve o saldo de Bits (depois de uma compra, o saldo é o que o servidor devolveu). `null` se o usuário não existe localmente. */
	setLocalBits(userId: string, bits: number): User | null {
		const { changes } = this.database.runSync(
			"UPDATE Users SET bits = ? WHERE remoteId = ?;",
			[bits, userId]
		);
		return changes > 0 ? this.getLocalProfile(userId) : null;
	}

	/**
	 * Aplica o progresso que veio da nuvem (`GET /sync/progress`): é a **união** do
	 * que o servidor tem com o que já existe aqui — nunca apaga nada, e o que a pessoa
	 * fez offline e ainda não foi enviado continua esperando na fila.
	 *
	 * **Não enfileira nenhum evento**: o servidor já conhece cada item, então
	 * reenviá-los só geraria `duplicate` e tráfego. Por isso não passa por
	 * `completeLesson`/`unlockAchievement`, que gravam a fila e pagam XP — aqui o
	 * XP e os Bits já vieram do servidor no login.
	 *
	 * Devolve quantos itens eram novos neste aparelho.
	 */
	restoreProgress(
		userId: string,
		progress: {
			lessons: Array<{ lessonId: number }>;
			achievements: Array<{ achievementId: number; unlockedAt: string }>;
		}
	): { lessonsAdded: number; achievementsAdded: number } {
		let lessonsAdded = 0;
		let achievementsAdded = 0;

		this.database.withTransactionSync(() => {
			for (const { lessonId } of progress.lessons) {
				// `UserLessons` não tem constraint única (userId, lessonId): a checagem
				// de existência é o que evita duplicar.
				const { changes } = this.database.runSync(
					"INSERT INTO UserLessons (userId, lessonId) " +
						"SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM UserLessons WHERE userId = ? AND lessonId = ?);",
					[userId, lessonId, userId, lessonId]
				);
				lessonsAdded += changes;
			}
			for (const { achievementId, unlockedAt } of progress.achievements) {
				const { changes } = this.database.runSync(
					"INSERT OR IGNORE INTO UserAchievements (userId, achievementId, unlockedAt) VALUES (?, ?, ?);",
					[userId, achievementId, unlockedAt]
				);
				achievementsAdded += changes;
			}
		});

		return { lessonsAdded, achievementsAdded };
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

	getUnlockedAchievements(userId: string) {
		return this.database.getAllSync<UserAchievement>(
			"SELECT achievementId, unlockedAt FROM UserAchievements WHERE userId = ?;",
			[userId]
		);
	}

	/** Só os eventos do usuário atual — outra conta que já tenha usado o mesmo dispositivo fica intocada. */
	getPendingSyncEvents(userId: string, limit = 50) {
		return this.database.getAllSync<SyncQueueRow>(
			"SELECT * FROM SyncQueue WHERE status = 'pending' AND userId = ? ORDER BY createdAt ASC LIMIT ?;",
			[userId, limit]
		);
	}

	/**
	 * Devolve para `pending` os eventos do usuário que ficaram em `syncing`.
	 * Uma linha só fica assim se o app foi encerrado com o `/sync` em voo, e nada
	 * mais a solta. Quem chama (`flushQueue`) faz isso dentro do lock de envio,
	 * então nenhum outro envio em andamento é dono dessas linhas, e reenviá-las é
	 * seguro porque o servidor é idempotente.
	 */
	releaseSyncingEvents(userId: string): void {
		this.database.runSync(
			"UPDATE SyncQueue SET status = 'pending', updatedAt = datetime('now') WHERE userId = ? AND status = 'syncing';",
			[userId]
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
