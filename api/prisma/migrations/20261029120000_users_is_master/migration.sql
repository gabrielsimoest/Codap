-- Conta mestra: concessões automáticas de teste (tudo concluído, nível máximo, baús obtidos).
-- Só se liga por SQL direto no banco; nenhuma rota escreve este campo.
ALTER TABLE "users" ADD COLUMN "is_master" BOOLEAN NOT NULL DEFAULT false;
