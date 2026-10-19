-- A moeda do app deixou de se chamar "Dependabots" (marca da GitHub) e passou a ser "Bits".
-- RENAME COLUMN preserva os valores já gravados.
ALTER TABLE "users" RENAME COLUMN "dependabots" TO "bits";
