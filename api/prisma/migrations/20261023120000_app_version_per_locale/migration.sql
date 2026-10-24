-- AlterTable
-- `app_version` nunca foi lida nem escrita por nada (0 linhas), então a coluna
-- obrigatória e o `NOT NULL` entram sem backfill.
ALTER TABLE "app_version" ADD COLUMN     "locale_id" INTEGER NOT NULL,
ALTER COLUMN "version" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "need_update" SET NOT NULL,
ALTER COLUMN "need_update" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "app_version_locale_id_idx" ON "app_version"("locale_id");

-- AddForeignKey
ALTER TABLE "app_version" ADD CONSTRAINT "app_version_locale_id_fkey" FOREIGN KEY ("locale_id") REFERENCES "locales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
