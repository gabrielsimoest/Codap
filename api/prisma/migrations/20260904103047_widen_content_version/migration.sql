-- Alarga `content_version.version` de VARCHAR(5) para VARCHAR(20).
--
-- VARCHAR(5) comporta "0.0.0" mas estoura em "0.0.10" — e a convencao de
-- versionamento de conteudo incrementa a cada adicao, entao o limite seria
-- atingido rapido. No Postgres, `varchar(n)` e apenas uma check constraint
-- (nao pre-aloca espaco), entao 20 nao custa mais que 10 e ainda comporta um
-- sufixo do tipo "1.2.3-beta" caso um canal de teste passe a existir.
--
-- `app_version.version` continua VARCHAR(5) de proposito: tem o mesmo limite
-- latente, mas esta fora do escopo desta mudanca.

-- AlterTable
ALTER TABLE "content_version" ALTER COLUMN "version" SET DATA TYPE VARCHAR(20);
