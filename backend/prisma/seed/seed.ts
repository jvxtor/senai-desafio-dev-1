import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { Prisma, PrismaClient } from '../../src/generated/prisma/client.js';
import { buildSeedPlan } from './build.js';
import type { PlayerRow, PlannedClub, PlannedSquadPlayer } from './build.js';

config({ path: '../.env' });

const RESET_FLAG = '--reset';
const TRANSACTION_TIMEOUT_MS = 60_000;

async function clearDatabase(tx: Prisma.TransactionClient): Promise<void> {
  // Filhos primeiro, por causa das chaves estrangeiras.
  await tx.dueloPartida.deleteMany();
  await tx.partida.deleteMany();
  await tx.escalacao.deleteMany();
  await tx.transacao.deleteMany();
  await tx.contrato.deleteMany();
  await tx.jogador.deleteMany();
  await tx.clube.deleteMany();
}

async function insertSquadPlayer(
  tx: Prisma.TransactionClient,
  clubId: number,
  { player, purchase }: PlannedSquadPlayer,
): Promise<number> {
  const created = await tx.jogador.create({
    data: {
      ...player,
      clubeId: clubId,
      contratos: {
        create: {
          clubeId: clubId,
          valorCompra: purchase.valorCompra,
          fidelidadeAte: purchase.fidelidadeAte,
          situacao: 'ATIVO',
          iniciadoEm: purchase.iniciadoEm,
        },
      },
      transacoes: {
        create: {
          clubeId: clubId,
          nomeJogador: player.nome,
          tipo: 'COMPRA',
          valor: purchase.valorCompra,
          taxa: purchase.taxa,
          multa: '0.00',
          lucro: null,
          variacaoCaixa: purchase.variacaoCaixa,
          criadoEm: purchase.iniciadoEm,
        },
      },
    },
  });
  return created.id;
}

async function insertClub(
  tx: Prisma.TransactionClient,
  club: PlannedClub,
): Promise<void> {
  const created = await tx.clube.create({
    data: {
      nome: club.nome,
      sigla: club.sigla,
      caixa: club.caixa,
      formacao: club.formacao,
    },
  });

  const starterIds: number[] = [];
  for (const member of club.squad) {
    const playerId = await insertSquadPlayer(tx, created.id, member);
    if (member.starter) starterIds.push(playerId);
  }

  await tx.escalacao.createMany({
    data: starterIds.map((jogadorId) => ({ clubeId: created.id, jogadorId })),
  });
}

async function insertFreePlayers(
  tx: Prisma.TransactionClient,
  players: PlayerRow[],
): Promise<void> {
  await tx.jogador.createMany({ data: players });
}

async function main(): Promise<void> {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL não está definida.');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  try {
    const reset = process.argv.includes(RESET_FLAG);
    const existing =
      (await prisma.clube.count()) + (await prisma.jogador.count());

    if (existing > 0 && !reset) {
      console.log(
        `O banco já tem dados; nada foi alterado. Use "npm run db:seed -- ${RESET_FLAG}" para apagar tudo e recriar.`,
      );
      return;
    }

    const plan = buildSeedPlan();
    await prisma.$transaction(
      async (tx) => {
        if (reset) await clearDatabase(tx);
        for (const club of plan.clubs) await insertClub(tx, club);
        await insertFreePlayers(tx, plan.freePlayers);
      },
      { timeout: TRANSACTION_TIMEOUT_MS },
    );

    const squads = plan.clubs.reduce((sum, club) => sum + club.squad.length, 0);
    console.log(
      `Seed concluído: ${plan.clubs.length} clubes, ${squads} jogadores contratados e ${plan.freePlayers.length} livres.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
