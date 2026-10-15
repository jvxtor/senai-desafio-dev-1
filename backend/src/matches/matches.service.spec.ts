import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { ListMatchesQueryDto } from './dto/list-matches-query.dto.js';
import { MatchesService } from './matches.service.js';

describe('CreateMatchDto', () => {
  const pipe = new ValidationPipe({ whitelist: true });
  const validate = (body: unknown) =>
    pipe.transform(body, { type: 'body', metatype: CreateMatchDto });

  it('aceita dois clubes diferentes', async () => {
    await expect(
      validate({ home_club_id: 1, away_club_id: 2 }),
    ).resolves.toEqual({ home_club_id: 1, away_club_id: 2 });
  });

  it.each([
    ['mandante igual ao visitante', { home_club_id: 1, away_club_id: 1 }],
    ['mandante ausente', { away_club_id: 2 }],
    ['visitante ausente', { home_club_id: 1 }],
    ['id zero', { home_club_id: 0, away_club_id: 2 }],
    ['id negativo', { home_club_id: 1, away_club_id: -2 }],
    ['id como texto', { home_club_id: '1', away_club_id: 2 }],
    ['id fracionário', { home_club_id: 1.5, away_club_id: 2 }],
    ['id nulo', { home_club_id: null, away_club_id: 2 }],
  ])('recusa: %s', async (_label, body) => {
    await expect(validate(body)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ListMatchesQueryDto', () => {
  const pipe = new ValidationPipe({ whitelist: true });
  const validate = (query: unknown) =>
    pipe.transform(query, { type: 'query', metatype: ListMatchesQueryDto });

  it('aceita club_id válido', async () => {
    await expect(validate({ club_id: '3' })).resolves.toEqual({ club_id: 3 });
  });

  it.each(['', '0', '-1', '01', '1.5', 'abc', '2147483648'])(
    'recusa club_id="%s"',
    async (club_id) => {
      await expect(validate({ club_id })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
});

function starter(id: number, position: string, defending = 50) {
  return {
    jogador: {
      id,
      nome: `Jogador ${id}`,
      posicao: position,
      agilidade: 50,
      idade: 25,
      valorBase: new Decimal('10.00'),
      condicao: 'APTO',
      clubeId: 1,
      velocidade: 50,
      finalizacao: 60,
      passe: 60,
      drible: 60,
      defesa: defending,
      fisico: 50,
      potencial: 60,
    },
  };
}

function club(
  id: number,
  name: string,
  options: { formacao?: string | null; size?: number } = {},
) {
  const positions = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];
  const base = id * 10;
  return {
    id,
    nome: name,
    formacao: options.formacao === undefined ? '2-1-1' : options.formacao,
    escalacoes: positions
      .slice(0, options.size ?? 5)
      .map((position, index) => starter(base + index, position)),
  };
}

function setup(clubs: object[]) {
  const create = vi.fn(({ data }) =>
    Promise.resolve({
      id: 1,
      jogadaEm: new Date('2026-11-12T18:00:00.000Z'),
      mandante: { nome: 'Águias FC' },
      visitante: { nome: 'Delta FC' },
      ...data,
      duelos: data.duelos.create.map((duel: object, index: number) => ({
        id: index + 1,
        partidaId: 1,
        ...duel,
      })),
    }),
  );
  const tx = { partida: { create } };
  const prisma = {
    clube: { findMany: vi.fn().mockResolvedValue(clubs), findUnique: vi.fn() },
    partida: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn() },
    $transaction: vi.fn((callback) => callback(tx)),
  };
  return {
    service: new MatchesService(prisma as unknown as PrismaService),
    prisma,
    create,
  };
}

describe('MatchesService.create', () => {
  const dto = { home_club_id: 1, away_club_id: 2 };

  it('joga a partida e grava placar, formações e os 6 duelos numa transação', async () => {
    const { service, create } = setup([
      club(1, 'Águias FC'),
      club(2, 'Delta FC'),
    ]);

    const result = await service.create(dto);

    const data = create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      mandanteId: 1,
      visitanteId: 2,
      formacaoMandante: '2-1-1',
      formacaoVisitante: '2-1-1',
    });
    expect(data.duelos.create).toHaveLength(6);
    expect(
      data.duelos.create.map((duel: { ordem: number }) => duel.ordem),
    ).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.duels).toHaveLength(6);
    expect(result.played_at).toBe('2026-11-12T15:00:00-03:00');
    expect(result.home.goals + result.away.goals).toBe(
      result.duels.filter((duel) => duel.goal).length,
    );
    expect(['MANDANTE', 'VISITANTE', 'EMPATE']).toContain(result.result);
  });

  it('responde 404 quando um dos clubes não existe', async () => {
    const { service, create } = setup([club(1, 'Águias FC')]);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(create).not.toHaveBeenCalled();
  });

  it.each([
    [
      'clube que nunca escalou',
      club(2, 'Delta FC', { formacao: null, size: 0 }),
    ],
    ['clube com titular a menos', club(2, 'Delta FC', { size: 4 })],
  ])('recusa %s (409), sem gravar nada', async (_label, incomplete) => {
    const { service, create } = setup([club(1, 'Águias FC'), incomplete]);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(create).not.toHaveBeenCalled();
  });

  it('recusa quando o mandante é quem está incompleto', async () => {
    const { service } = setup([
      club(1, 'Águias FC', { size: 3 }),
      club(2, 'Delta FC'),
    ]);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('MatchesService leitura', () => {
  it('lista com filtro por clube mandante ou visitante e 404 para clube inexistente', async () => {
    const { service, prisma } = setup([]);
    prisma.clube.findUnique.mockResolvedValue(null);

    await expect(service.findAll({ club_id: 9 })).rejects.toBeInstanceOf(
      NotFoundException,
    );

    prisma.clube.findUnique.mockResolvedValue({ id: 1 });
    await service.findAll({ club_id: 1 });
    expect(prisma.partida.findMany).toHaveBeenCalledWith({
      where: { OR: [{ mandanteId: 1 }, { visitanteId: 1 }] },
      include: { mandante: true, visitante: true },
      orderBy: [{ jogadaEm: 'desc' }, { id: 'desc' }],
    });
  });

  it('lista vazia quando não há partidas', async () => {
    const { service } = setup([]);

    await expect(service.findAll({})).resolves.toEqual([]);
  });

  it('responde 404 para partida inexistente', async () => {
    const { service, prisma } = setup([]);
    prisma.partida.findUnique.mockResolvedValue(null);

    await expect(service.findOne(9)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('a classificação inclui todos os clubes', async () => {
    const { service, prisma } = setup([]);
    prisma.clube.findMany.mockResolvedValue([
      { id: 1, nome: 'Águias FC' },
      { id: 2, nome: 'Delta FC' },
    ]);

    const table = await service.standings();

    expect(table.map((row) => row.club_name)).toEqual([
      'Águias FC',
      'Delta FC',
    ]);
  });
});
