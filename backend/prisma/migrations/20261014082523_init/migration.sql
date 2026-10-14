-- CreateTable
CREATE TABLE "clubes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "sigla" CHAR(3) NOT NULL,
    "caixa" DECIMAL(10,2) NOT NULL DEFAULT 300.00,
    "formacao" VARCHAR(5),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogadores" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "posicao" VARCHAR(3) NOT NULL,
    "agilidade" INTEGER NOT NULL,
    "idade" INTEGER NOT NULL,
    "valor_base" DECIMAL(6,2) NOT NULL,
    "condicao" VARCHAR(20) NOT NULL DEFAULT 'APTO',
    "clube_id" INTEGER,
    "velocidade" INTEGER NOT NULL,
    "finalizacao" INTEGER NOT NULL,
    "passe" INTEGER NOT NULL,
    "drible" INTEGER NOT NULL,
    "defesa" INTEGER NOT NULL,
    "fisico" INTEGER NOT NULL,
    "potencial" INTEGER NOT NULL,
    "excluido_em" TIMESTAMPTZ(6),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "jogadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" SERIAL NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "clube_id" INTEGER NOT NULL,
    "valor_compra" DECIMAL(6,2) NOT NULL,
    "fidelidade_ate" TIMESTAMPTZ(6) NOT NULL,
    "situacao" VARCHAR(12) NOT NULL,
    "iniciado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerrado_em" TIMESTAMPTZ(6),

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" SERIAL NOT NULL,
    "clube_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "nome_jogador" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(6) NOT NULL,
    "valor" DECIMAL(6,2) NOT NULL,
    "taxa" DECIMAL(6,2) NOT NULL,
    "multa" DECIMAL(6,2) NOT NULL,
    "lucro" DECIMAL(7,2),
    "variacao_caixa" DECIMAL(8,2) NOT NULL,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalacoes" (
    "clube_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escalacoes_pkey" PRIMARY KEY ("clube_id","jogador_id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" SERIAL NOT NULL,
    "mandante_id" INTEGER NOT NULL,
    "visitante_id" INTEGER NOT NULL,
    "gols_mandante" INTEGER NOT NULL,
    "gols_visitante" INTEGER NOT NULL,
    "formacao_mandante" VARCHAR(5) NOT NULL,
    "formacao_visitante" VARCHAR(5) NOT NULL,
    "jogada_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duelos_partida" (
    "id" SERIAL NOT NULL,
    "partida_id" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "clube_atacante_id" INTEGER NOT NULL,
    "atacante_id" INTEGER NOT NULL,
    "defensor_id" INTEGER NOT NULL,
    "nome_atacante" VARCHAR(100) NOT NULL,
    "nome_defensor" VARCHAR(100) NOT NULL,
    "posicao_atacante" VARCHAR(3) NOT NULL,
    "posicao_defensor" VARCHAR(3) NOT NULL,
    "condicao_atacante" VARCHAR(20) NOT NULL,
    "condicao_defensor" VARCHAR(20) NOT NULL,
    "atributo_ataque" VARCHAR(10) NOT NULL,
    "atributo_defesa" VARCHAR(10) NOT NULL,
    "valor_ataque" INTEGER NOT NULL,
    "valor_defesa" INTEGER NOT NULL,
    "gol" BOOLEAN NOT NULL,

    CONSTRAINT "duelos_partida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubes_sigla_key" ON "clubes"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "escalacoes_jogador_id_key" ON "escalacoes"("jogador_id");

-- AddForeignKey
ALTER TABLE "jogadores" ADD CONSTRAINT "jogadores_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalacoes" ADD CONSTRAINT "escalacoes_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalacoes" ADD CONSTRAINT "escalacoes_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_mandante_id_fkey" FOREIGN KEY ("mandante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_clube_atacante_id_fkey" FOREIGN KEY ("clube_atacante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_atacante_id_fkey" FOREIGN KEY ("atacante_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_defensor_id_fkey" FOREIGN KEY ("defensor_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RN10: nome do clube unico ignorando maiusculas/minusculas e mantendo acentos
CREATE UNIQUE INDEX "clubes_nome_lower_key" ON "clubes" (lower("nome"));

-- Valores de lista e faixas validados tambem no banco
ALTER TABLE "clubes"
  ADD CONSTRAINT "clubes_formacao_check"
    CHECK ("formacao" IS NULL OR "formacao" IN ('3-1', '2-2', '2-1-1', '1-2-1')),
  ADD CONSTRAINT "clubes_caixa_check" CHECK ("caixa" >= 0);

ALTER TABLE "jogadores"
  ADD CONSTRAINT "jogadores_posicao_check" CHECK ("posicao" IN ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA')),
  ADD CONSTRAINT "jogadores_condicao_check" CHECK ("condicao" IN ('APTO', 'MAL_CONDICIONADO', 'DOENTE')),
  ADD CONSTRAINT "jogadores_agilidade_check" CHECK ("agilidade" BETWEEN 1 AND 100),
  ADD CONSTRAINT "jogadores_idade_check" CHECK ("idade" BETWEEN 16 AND 45),
  ADD CONSTRAINT "jogadores_atributos_check" CHECK (
    "velocidade" BETWEEN 1 AND 99 AND "finalizacao" BETWEEN 1 AND 99 AND
    "passe" BETWEEN 1 AND 99 AND "drible" BETWEEN 1 AND 99 AND
    "defesa" BETWEEN 1 AND 99 AND "fisico" BETWEEN 1 AND 99
  ),
  ADD CONSTRAINT "jogadores_potencial_check" CHECK ("potencial" BETWEEN 1 AND 99);

ALTER TABLE "contratos"
  ADD CONSTRAINT "contratos_situacao_check" CHECK ("situacao" IN ('ATIVO', 'ENCERRADO', 'RESCINDIDO'));

ALTER TABLE "transacoes"
  ADD CONSTRAINT "transacoes_tipo_check" CHECK ("tipo" IN ('COMPRA', 'VENDA'));

ALTER TABLE "partidas"
  ADD CONSTRAINT "partidas_gols_check" CHECK (
    "gols_mandante" BETWEEN 0 AND 3 AND "gols_visitante" BETWEEN 0 AND 3
  ),
  ADD CONSTRAINT "partidas_formacoes_check" CHECK (
    "formacao_mandante" IN ('3-1', '2-2', '2-1-1', '1-2-1') AND
    "formacao_visitante" IN ('3-1', '2-2', '2-1-1', '1-2-1')
  );

ALTER TABLE "duelos_partida"
  ADD CONSTRAINT "duelos_ordem_check" CHECK ("ordem" BETWEEN 1 AND 6),
  ADD CONSTRAINT "duelos_posicoes_check" CHECK (
    "posicao_atacante" IN ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA') AND
    "posicao_defensor" IN ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA')
  ),
  ADD CONSTRAINT "duelos_condicoes_check" CHECK (
    "condicao_atacante" IN ('APTO', 'MAL_CONDICIONADO') AND
    "condicao_defensor" IN ('APTO', 'MAL_CONDICIONADO')
  ),
  ADD CONSTRAINT "duelos_atributos_check" CHECK (
    "atributo_ataque" IN ('shooting', 'passing', 'dribbling', 'defending') AND
    "atributo_defesa" IN ('shooting', 'passing', 'dribbling', 'defending')
  );
