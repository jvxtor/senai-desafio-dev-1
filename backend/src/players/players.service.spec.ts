import { describe, expect, it, vi } from 'vitest';
import { Decimal } from 'decimal.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePlayerDto } from './dto/create-player.dto.js';
import { PlayersService } from './players.service.js';

const dto: CreatePlayerDto = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

describe('PlayersService.create', () => {
  it('grava o valor base calculado e responde com overall e valor de mercado', async () => {
    const create = vi.fn(({ data }) =>
      Promise.resolve({
        id: 2,
        ...data,
        valorBase: new Decimal(data.valorBase),
        condicao: 'APTO',
        clubeId: null,
      }),
    );
    const service = new PlayersService({
      jogador: { create },
    } as unknown as PrismaService);

    const result = await service.create(dto);

    expect(create.mock.calls[0][0].data.valorBase).toBe('40.00');
    expect(result).toMatchObject({
      id: 2,
      condition: 'APTO',
      base_value: 40,
      market_value: 40,
      overall: 75,
      club_id: null,
    });
  });
});
