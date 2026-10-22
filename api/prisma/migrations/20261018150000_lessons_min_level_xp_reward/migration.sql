-- Aulas de aprofundamento: opcionais, abertas a partir de um nível e com XP próprio.
-- `min_level` nulo = lição da trilha principal; `xp_reward` nulo = 10 XP (o valor de sempre).
ALTER TABLE "lessons" ADD COLUMN "min_level" INTEGER,
ADD COLUMN "xp_reward" INTEGER;
