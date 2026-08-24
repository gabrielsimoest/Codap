import * as SQLite from "expo-sqlite";

/**
 * expo-sqlite não tem um mecanismo de migração embutido — initDefaultTables()
 * usa CREATE TABLE IF NOT EXISTS, que é seguro para repetir, mas não serve
 * para adicionar colunas. Este runner, guiado por PRAGMA user_version, cobre
 * isso: cada versão só roda uma vez, mesmo com o app reabrindo o banco a
 * cada boot. Se novas migrações forem necessárias no futuro, adicione um
 * novo `if (version < N)` em sequência.
 */
const CURRENT_SCHEMA_VERSION = 4;

export default function runMigrations(database: SQLite.SQLiteDatabase) {
	const row = database.getFirstSync<{ user_version: number }>(
		"PRAGMA user_version"
	);
	const version = row?.user_version ?? 0;

	if (version < 1) {
		database.withTransactionSync(() => {
			database.execSync("ALTER TABLE Users ADD COLUMN remoteId TEXT;");
			database.execSync(
				"ALTER TABLE Users ADD COLUMN lastProfileSyncAt TEXT;"
			);
			database.execSync(
				"CREATE TABLE IF NOT EXISTS SyncQueue (" +
					"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
					"clientEventId TEXT NOT NULL UNIQUE, " +
					"type TEXT NOT NULL, " +
					"payload TEXT NOT NULL, " +
					"occurredAt TEXT NOT NULL, " +
					"status TEXT NOT NULL DEFAULT 'pending', " +
					"attempts INTEGER NOT NULL DEFAULT 0, " +
					"lastError TEXT, " +
					"createdAt TEXT NOT NULL DEFAULT (datetime('now')), " +
					"updatedAt TEXT NOT NULL DEFAULT (datetime('now'))" +
					");"
			);
			database.execSync(
				"CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON SyncQueue(status);"
			);
			database.execSync(
				"CREATE TABLE IF NOT EXISTS UserAchievements (" +
					"ID INTEGER PRIMARY KEY AUTOINCREMENT, " +
					"achievementId INTEGER NOT NULL UNIQUE, " +
					"unlockedAt TEXT NOT NULL" +
					");"
			);
			database.execSync("PRAGMA user_version = 1;");
		});
	}

	if (version < 2) {
		database.withTransactionSync(() => {
			// Conta local só existe a partir do backend agora (registro exige
			// internet) — a coluna de senha em texto puro do modelo antigo
			// nunca mais é escrita nem lida, então sai do schema. Instalações
			// novas já nascem sem essa coluna (initDefaultTables não a cria
			// mais), então o DROP só roda se ela ainda existir.
			const columns = database.getAllSync<{ name: string }>(
				"PRAGMA table_info(Users);"
			);
			if (columns.some((column) => column.name === "password")) {
				database.execSync("ALTER TABLE Users DROP COLUMN password;");
			}
			database.execSync("PRAGMA user_version = 2;");
		});
	}

	if (version < 3) {
		database.withTransactionSync(() => {
			// remoteId era só uma coluna de correlação com o backend, com um ID
			// local autoincrement como chave primária "por trás". Agora que toda
			// conta nasce via /auth (remoteId sempre presente), o ID local virou
			// uma indireção sem necessidade — remoteId passa a ser a própria PK
			// de Users, e UserLessons.userId passa a referenciá-lo diretamente (TEXT).
			// Linhas sem remoteId (resíduo do antigo cadastro 100% local, já
			// impossível de gerar) não têm mais chave para migrar e são
			// descartadas junto com as aulas associadas a elas.
			database.execSync(
				"CREATE TABLE Users_new (" +
					"remoteId TEXT PRIMARY KEY NOT NULL, " +
					"name TEXT, " +
					"email TEXT, " +
					"dependaBots INT, " +
					"xp LONG, " +
					"doubleXp INT, " +
					"doubleTime INT, " +
					"lastProfileSyncAt TEXT" +
					");"
			);
			database.execSync(
				"INSERT INTO Users_new (remoteId, name, email, dependaBots, xp, doubleXp, doubleTime, lastProfileSyncAt) " +
					"SELECT remoteId, name, email, dependaBots, xp, doubleXp, doubleTime, lastProfileSyncAt " +
					"FROM Users WHERE remoteId IS NOT NULL;"
			);

			database.execSync(
				"CREATE TABLE UserLessons_new (" +
					"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
					"userId TEXT NOT NULL, " +
					"lessonId INT, " +
					"FOREIGN KEY(userId) REFERENCES Users_new(remoteId)" +
					");"
			);
			database.execSync(
				"INSERT INTO UserLessons_new (id, userId, lessonId) " +
					"SELECT a.id, u.remoteId, a.lessonId " +
					"FROM UserLessons a JOIN Users u ON a.userId = u.id " +
					"WHERE u.remoteId IS NOT NULL;"
			);

			database.execSync("DROP TABLE UserLessons;");
			database.execSync("ALTER TABLE UserLessons_new RENAME TO UserLessons;");
			database.execSync("DROP TABLE Users;");
			database.execSync("ALTER TABLE Users_new RENAME TO Users;");

			database.execSync("PRAGMA user_version = 3;");
		});
	}

	if (version < 4) {
		database.withTransactionSync(() => {
			// O dispositivo pode ter mais de uma conta ao longo do tempo (troca de
			// usuário/logout+login), então UserAchievements e SyncQueue precisam
			// saber de quem é cada linha — sem isso, a conquista/o evento de um
			// usuário podia vazar ou ser sincronizado sob a sessão de outro.
			//
			// UserAchievements: a constraint única precisa passar de "achievementId
			// global" para "(userId, achievementId)", o que exige recriar a tabela.
			// Linhas existentes não têm como ser atribuídas a um usuário de forma
			// confiável (é exatamente o dado que faltava) — são descartadas; na
			// prática não há dado real aqui, já que nenhuma tela chama
			// unlockAchievement ainda.
			database.execSync(
				"CREATE TABLE UserAchievements_new (" +
					"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
					"userId TEXT NOT NULL, " +
					"achievementId INTEGER NOT NULL, " +
					"unlockedAt TEXT NOT NULL, " +
					"UNIQUE(userId, achievementId), " +
					"FOREIGN KEY(userId) REFERENCES Users(remoteId)" +
					");"
			);
			database.execSync("DROP TABLE UserAchievements;");
			database.execSync(
				"ALTER TABLE UserAchievements_new RENAME TO UserAchievements;"
			);

			// SyncQueue: só precisa de uma coluna nova (não tem constraint única
			// pra recriar). Linhas pending já existentes ficam sem atribuição
			// confiável pela mesma razão — marcadas failed em vez de ficarem
			// pending pra sempre (nunca seriam enviadas sob usuário nenhum).
			database.execSync("ALTER TABLE SyncQueue ADD COLUMN userId TEXT;");
			database.execSync(
				"UPDATE SyncQueue SET status = 'failed', lastError = 'missing_user_attribution' " +
					"WHERE userId IS NULL AND status = 'pending';"
			);
			database.execSync(
				"CREATE INDEX IF NOT EXISTS idx_sync_queue_user_status ON SyncQueue(userId, status);"
			);

			database.execSync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
		});
	}
}
