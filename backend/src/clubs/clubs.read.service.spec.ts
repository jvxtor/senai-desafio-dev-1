import { NotFoundException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { ClubsService } from './clubs.service.js';

const NOW = new Date('2026-11-02T13:15:00.000Z');
const DAY = 86_400_000;

function club(id: number, nome: string, caixa: string) {
  return { id, nome, sigla: 'AAA', caixa: new Decimal(caixa) };
}

function player(overrides: Record<string, unknown> = {}) {
  return {
    id: 2,
    nome: 'Meia Lua',
    posicao: 'MEI',
    agilidade: 85,
    idade: 25,
    valorBase: new Decimal('40.00'),
    condicao: 'MAL_CONDICIONADO',
    clubeId: 1,
    velocidade: 70,
    finalizacao: 68,
    passe: 82,
    drible: 79,
    defesa: 55,
    fisico: 64,
    potencial: 86,
    ...overrides,
  };
}

function contract(purchaseValue: string, loyaltyUntil: Date) {
  return {
    id: 1,
    valorCompra: new Decimal(purchaseValue),
    fidelidadeAte: loyaltyUntil,
  };
}

function setup(clubs: unknown[], players: unknown[]) {
  const prisma = {
    clube: {
      findMany: vi.fn().mockResolvedValue(clubs),
      findUnique: vi
        .fn()
        .mockImplementation(({ where }) =>
          Promise.resolve(
            (clubs as { id: number }[]).find((item) => item.id === where.id) ??
              null,
          ),
        ),
    },
    jogador: { findMany: vi.fn().mockResolvedValue(players) },
  };
  return {
    service: new ClubsService(prisma as unknown as PrismaService),
    prisma,
  };
}

describe('ClubsService.findAll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  const clubs = [club(1, 'Gama SC', '261.15'), club(2, 'Águias FC', '300.00')];

  it('calcula o valor do elenco e o patrimônio de cada clube', async () => {
    const { service } = setup(clubs, [player({ clubeId: 1 })]);

    const result = await service.findAll({});

    expect(result).toEqual([
      {
        id: 2,
        name: 'Águias FC',
        acronym: 'AAA',
        cash: 300,
        squad_value: 0,
        net_worth: 300,
      },
      {
        id: 1,
        name: 'Gama SC',
        acronym: 'AAA',
        cash: 261.15,
        squad_value: 37,
        net_worth: 298.15,
      },
    ]);
  });

  it('ordena pelo patrimônio quando pedido', async () => {
    const { service } = setup(clubs, [player({ clubeId: 1 })]);

    const result = await service.findAll({ sort: 'net_worth_desc' });

    expect(result.map((item) => item.name)).toEqual(['Águias FC', 'Gama SC']);
  });

  it('devolve lista vazia quando não há clubes', async () => {
    const { service } = setup([], []);

    await expect(service.findAll({})).resolves.toEqual([]);
  });

  it('considera só jogadores não excluídos que estão em clube', async () => {
    const { service, prisma } = setup(clubs, []);

    await service.findAll({});

    expect(prisma.jogador.findMany).toHaveBeenCalledWith({
      where: { clubeId: { not: null }, excluidoEm: null },
    });
  });
});

describe('ClubsService.findOne', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  const loyalty = new Date(NOW.getTime() + 120 * DAY);

  it('responde 404 para clube inexistente', async () => {
    const { service } = setup([], []);

    await expect(service.findOne(9)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('traz o elenco com contrato, valor do elenco e patrimônio (exemplo 2.2.2)', async () => {
    const { service } = setup(
      [club(1, 'Águias FC', '261.15')],
      [{ ...player(), contratos: [contract('37.00', loyalty)] }],
    );

    const result = await service.findOne(1);

    expect(result).toMatchObject({
      id: 1,
      name: 'Águias FC',
      cash: 261.15,
      squad_value: 37,
      net_worth: 298.15,
    });
    expect(result.players).toHaveLength(1);
    expect(result.players[0]).toMatchObject({
      id: 2,
      name: 'Meia Lua',
      market_value: 37,
      club_id: 1,
      contract: {
        purchase_value: 37,
        loyalty_until: '2027-03-02T10:15:00-03:00',
        remaining_days: 120,
        penalty_rate: 10,
      },
    });
  });

  it('ordena o elenco por posição, nome e id', async () => {
    const withContract = (overrides: Record<string, unknown>) => ({
      ...player(overrides),
      contratos: [contract('10.00', loyalty)],
    });
    const { service } = setup(
      [club(1, 'Águias FC', '300.00')],
      [
        withContract({ id: 5, nome: 'Ana Lima', posicao: 'ATA' }),
        withContract({ id: 4, nome: 'Zeca Reis', posicao: 'GOL' }),
        withContract({ id: 3, nome: 'Bia Souza', posicao: 'MEI' }),
        withContract({ id: 2, nome: 'Ana Lima', posicao: 'MEI' }),
      ],
    );

    const result = await service.findOne(1);

    expect(result.players.map((item) => item.id)).toEqual([4, 2, 3, 5]);
  });

  it('um clube sem jogadores tem elenco vazio e patrimônio igual ao caixa', async () => {
    const { service } = setup([club(1, 'Águias FC', '300.00')], []);

    await expect(service.findOne(1)).resolves.toMatchObject({
      squad_value: 0,
      net_worth: 300,
      players: [],
    });
  });
});
