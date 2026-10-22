-- Move o nome da área para a própria tabela `areas` e remove `area_translations`.
-- Os nomes de área são termos técnicos em inglês (HTML, CSS, JavaScript), iguais
-- em qualquer idioma — a tabela de tradução só guardava a mesma string duplicada
-- por locale. modules/lessons/activities continuam traduzidos normalmente.

-- 1. Coluna criada nullable para permitir o backfill numa tabela já populada.
ALTER TABLE "areas" ADD COLUMN "name" TEXT;

-- 2. Backfill a partir da tradução existente. Como todas as traduções de uma
--    mesma área têm o mesmo texto, qualquer locale serve; MIN(locale_id) só
--    torna a escolha determinística.
UPDATE "areas" a
SET "name" = t."name"
FROM "area_translations" t
WHERE t."area_id" = a."id"
  AND t."locale_id" = (
    SELECT MIN(t2."locale_id")
    FROM "area_translations" t2
    WHERE t2."area_id" = a."id"
  );

-- 3. Rede de segurança para uma área órfã (sem nenhuma tradução) — não deveria
--    existir, mas a coluna vai virar NOT NULL no passo seguinte.
UPDATE "areas" SET "name" = '' WHERE "name" IS NULL;

-- 4. Agora que toda linha tem valor, aplica a constraint definitiva.
ALTER TABLE "areas" ALTER COLUMN "name" SET NOT NULL;

-- 5. Remove a tabela de tradução de áreas.
ALTER TABLE "area_translations" DROP CONSTRAINT "area_translations_area_id_fkey";
ALTER TABLE "area_translations" DROP CONSTRAINT "area_translations_locale_id_fkey";
DROP TABLE "area_translations";
