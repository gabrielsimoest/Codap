-- Loja funcional e baú surpresa.
-- users: estoque de dicas instantâneas e a garantia contra azar do baú.
ALTER TABLE "users" ADD COLUMN "instant_hints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "chest_misses" INTEGER NOT NULL DEFAULT 0;

-- lessons: aula exclusiva do baú.
ALTER TABLE "lessons" ADD COLUMN "is_chest" BOOLEAN NOT NULL DEFAULT false;

-- Janelas de Dobro de XP.
CREATE TABLE "xp_boosts" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_boosts_pkey" PRIMARY KEY ("id")
);

-- Coleção de aulas do baú reveladas por cada usuário.
CREATE TABLE "user_chest_lessons" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "revealed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_chest_lessons_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "xp_boosts_user_id_ends_at_idx" ON "xp_boosts"("user_id", "ends_at");

CREATE UNIQUE INDEX "user_chest_lessons_user_id_lesson_id_key" ON "user_chest_lessons"("user_id", "lesson_id");

ALTER TABLE "xp_boosts" ADD CONSTRAINT "xp_boosts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_chest_lessons" ADD CONSTRAINT "user_chest_lessons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_chest_lessons" ADD CONSTRAINT "user_chest_lessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
