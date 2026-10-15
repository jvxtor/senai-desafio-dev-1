import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { SetLineupDto } from './dto/set-lineup.dto.js';
import { fitsFormation } from './formations.js';
import { LineupService } from './lineup.service.js';

describe('fitsFormation (RN19)', () => {
  it.each([
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA']],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA']],
  ] as const)('%s fecha com %j', (formation, positions) => {
    expect(fitsFormation([...positions], formation)).toBe(true);
  });

  it.each([
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'MEI']],
    ['2-1-1', ['ZAG', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['2-1-1', ['GOL', 'GOL', 'LAT', 'MEI', 'ATA']],
    ['3-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
  ] as const)('%s não fecha com %j', (formation, positions) => {
    expect(fitsFormation([...positions], formation)).toBe(false);
  });
});

describe('SetLineupDto', () => {
  const pipe = new ValidationPipe({ whitelist: true });
  const validate = (body: unknown) =>
    pipe.transform(body, { type: 'body', metatype: SetLineupDto });
  const valid = { formation: '2-1-1', player_ids: [34, 31, 30, 33, 32] };

  it('aceita a escalação do exemplo', async () => {
    await expect(validate(valid)).resolves.toMatchObject(valid);
  });

  it.each([
    ['formação ausente', { player_ids: valid.player_ids }],
    ['formação fora da lista', { ...valid, formation: '4-0' }],
    ['formação em outro formato', { ...valid, formation: '211' }],
    ['player_ids ausente', { formation: '2-1-1' }],
    ['player_ids que não é lista', { ...valid, player_ids: '34,31,30,33,32' }],
    ['4 ids', { ...valid, player_ids: [34, 31, 30, 33] }],
    ['6 ids', { ...valid, player_ids: [34, 31, 30, 33, 32, 35] }],
    ['ids repetidos', { ...valid, player_ids: [34, 34, 30, 33, 32] }],
    ['id como texto', { ...valid, player_ids: [34, '31', 30, 33, 32] }],
    ['id zero', { ...valid, player_ids: [34, 0, 30, 33, 32] }],
    ['id negativo', { ...valid, player_ids: [34, -1, 30, 33, 32] }],
    ['id fracionário', { ...valid, player_ids: [34, 1.5, 30, 33, 32] }],
  ])('recusa: %s', async (_label, body) => {
    await expect(validate(body)).rejects.toBeInstanceOf(BadRequestException);
  });
});

function player(
  id: number,
  position: string,
  clubId: number | null,
  condition = 'APTO',
) {
  return {
    id,
    nome: `Jogador ${id}`,
    posicao: position,
    agilidade: 50,
    idade: 25,
    valorBase: new Decimal('10.00'),
    condicao: condition,
    clubeId: clubId,
    velocidade: 50,
    finalizacao: 50,
    passe: 50,
    drible: 50,
    defesa: 50,
    fisico: 50,
    potencial: 60,
  };
}

const squad = [
  player(30, 'GOL', 1),
  player(32, 'ZAG', 1),
  player(31, 'LAT', 1),
  player(33, 'MEI', 1),
  player(34, 'ATA', 1),
];
const dto = { formation: '2-1-1' as const, player_ids: [34, 31, 30, 33, 32] };

function setup(options: { club?: object | null; players?: object[] }) {
  const tx = {
    clube: { update: vi.fn().mockResolvedValue({}) },
    escalacao: {
      deleteMany: vi.fn().mockResolvedValue({}),
      createMany: vi.fn().mockResolvedValue({}),
    },
  };
  const prisma = {
    clube: {
      findUnique: vi
        .fn()
        .mockResolvedValue(
          options.club === undefined
            ? { id: 1, formacao: '2-1-1' }
            : options.club,
        ),
    },
    jogador: { findMany: vi.fn().mockResolvedValue(options.players ?? squad) },
    escalacao: {
      findMany: vi
        .fn()
        .mockResolvedValue(squad.map((jogador) => ({ jogador }))),
    },
    $transaction: vi.fn((callback) => callback(tx)),
  };
  return {
    service: new LineupService(prisma as unknown as PrismaService),
    tx,
    prisma,
  };
}

function expectNothingWritten(tx: ReturnType<typeof setup>['tx']) {
  expect(tx.clube.update).not.toHaveBeenCalled();
  expect(tx.escalacao.deleteMany).not.toHaveBeenCalled();
  expect(tx.escalacao.createMany).not.toHaveBeenCalled();
}

describe('LineupService.set', () => {
  it('substitui a escalação inteira numa transação e devolve o elenco ordenado', async () => {
    const { service, tx } = setup({});

    const result = await service.set(1, dto);

    expect(tx.clube.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { formacao: '2-1-1' },
    });
    expect(tx.escalacao.deleteMany).toHaveBeenCalledWith({
      where: { clubeId: 1 },
    });
    expect(tx.escalacao.createMany).toHaveBeenCalledWith({
      data: dto.player_ids.map((jogadorId) => ({ clubeId: 1, jogadorId })),
    });
    expect(result).toMatchObject({
      club_id: 1,
      formation: '2-1-1',
      complete: true,
    });
    expect(result.players.map((item) => item.position)).toEqual([
      'GOL',
      'ZAG',
      'LAT',
      'MEI',
      'ATA',
    ]);
  });

  it('responde 404 para clube inexistente', async () => {
    const { service, tx } = setup({ club: null });

    await expect(service.set(9, dto)).rejects.toBeInstanceOf(NotFoundException);
    expectNothingWritten(tx);
  });

  it('responde 404 quando algum jogador não existe ou foi excluído', async () => {
    const { service, tx } = setup({ players: squad.slice(0, 4) });

    await expect(service.set(1, dto)).rejects.toBeInstanceOf(NotFoundException);
    expectNothingWritten(tx);
  });

  it('recusa jogador de outro clube ou livre (409)', async () => {
    for (const outsider of [player(34, 'ATA', 2), player(34, 'ATA', null)]) {
      const { service, tx } = setup({
        players: [...squad.slice(0, 4), outsider],
      });

      await expect(service.set(1, dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expectNothingWritten(tx);
    }
  });

  it('recusa jogador DOENTE (409), mas aceita MAL_CONDICIONADO', async () => {
    const sick = setup({
      players: [...squad.slice(0, 4), player(34, 'ATA', 1, 'DOENTE')],
    });
    await expect(sick.service.set(1, dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expectNothingWritten(sick.tx);

    const tired = setup({
      players: [...squad.slice(0, 4), player(34, 'ATA', 1, 'MAL_CONDICIONADO')],
    });
    await expect(tired.service.set(1, dto)).resolves.toBeDefined();
  });

  it('recusa posições que não fecham a formação (409)', async () => {
    const { service, tx } = setup({
      players: [...squad.slice(0, 4), player(34, 'MEI', 1)],
    });

    await expect(service.set(1, dto)).rejects.toBeInstanceOf(ConflictException);
    expectNothingWritten(tx);
  });
});

describe('LineupService.get', () => {
  it('sem escalação, devolve formação nula, lista vazia e complete falso', async () => {
    const { service, prisma } = setup({ club: { id: 1, formacao: null } });
    prisma.escalacao.findMany.mockResolvedValue([]);

    await expect(service.get(1)).resolves.toEqual({
      club_id: 1,
      formation: null,
      complete: false,
      players: [],
    });
  });

  it('com titular a menos, mantém a formação e marca complete falso', async () => {
    const { service, prisma } = setup({});
    prisma.escalacao.findMany.mockResolvedValue(
      squad.slice(0, 4).map((jogador) => ({ jogador })),
    );

    const result = await service.get(1);

    expect(result.formation).toBe('2-1-1');
    expect(result.complete).toBe(false);
    expect(result.players).toHaveLength(4);
  });

  it('responde 404 para clube inexistente', async () => {
    const { service } = setup({ club: null });

    await expect(service.get(9)).rejects.toBeInstanceOf(NotFoundException);
  });
});
