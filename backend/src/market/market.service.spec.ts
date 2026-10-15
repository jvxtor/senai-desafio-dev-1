import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { BuyPlayerDto } from './dto/buy-player.dto.js';
import { MarketService } from './market.service.js';

const NOW = new Date('2026-11-02T13:15:00.000Z');
const DAY = 86_400_000;

const player = {
  id: 2,
  nome: 'Meia Lua',
  posicao: 'MEI',
  agilidade: 85,
  idade: 25,
  valorBase: new Decimal('40.00'),
  condicao: 'MAL_CONDICIONADO',
  clubeId: null as number | null,
};

const club = {
  id: 1,
  nome: 'Águias FC',
  sigla: 'AGU',
  caixa: new Decimal('300.00'),
};

function buyDto(overrides: Partial<BuyPlayerDto> = {}): BuyPlayerDto {
  return {
    club_id: 1,
    loyalty_until: new Date('2027-03-02T13:15:00.000Z'),
    ...overrides,
  };
}

interface Scenario {
  player?: typeof player | null;
  club?: typeof club | null;
  previousSale?: object | null;
  squadSize?: number;
  claimedCount?: number;
  chargedCount?: number;
}

function setup(scenario: Scenario = {}) {
  const tx = {
    jogador: {
      findFirst: vi
        .fn()
        .mockResolvedValue(
          scenario.player === undefined ? player : scenario.player,
        ),
      count: vi.fn().mockResolvedValue(scenario.squadSize ?? 0),
      updateMany: vi
        .fn()
        .mockResolvedValue({ count: scenario.claimedCount ?? 1 }),
    },
    clube: {
      findUnique: vi
        .fn()
        .mockResolvedValue(scenario.club === undefined ? club : scenario.club),
      updateMany: vi
        .fn()
        .mockResolvedValue({ count: scenario.chargedCount ?? 1 }),
    },
    transacao: {
      findFirst: vi.fn().mockResolvedValue(scenario.previousSale ?? null),
      create: vi.fn(({ data }) =>
        Promise.resolve({
          id: 10,
          ...data,
          valor: new Decimal(data.valor),
          taxa: new Decimal(data.taxa),
          multa: new Decimal(data.multa),
          lucro: null,
          variacaoCaixa: new Decimal(data.variacaoCaixa),
        }),
      ),
    },
    contrato: { create: vi.fn().mockResolvedValue({}) },
  };
  const prisma = { $transaction: vi.fn((callback) => callback(tx)) };
  return { service: new MarketService(prisma as unknown as PrismaService), tx };
}

function expectNothingWritten(tx: ReturnType<typeof setup>['tx']) {
  expect(tx.jogador.updateMany).not.toHaveBeenCalled();
  expect(tx.clube.updateMany).not.toHaveBeenCalled();
  expect(tx.contrato.create).not.toHaveBeenCalled();
  expect(tx.transacao.create).not.toHaveBeenCalled();
}

describe('MarketService.buy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('compra pelo valor de mercado, com taxa, contrato e transação (exemplo 2.3.1)', async () => {
    const { service, tx } = setup();

    const result = await service.buy(2, buyDto());

    expect(result).toEqual({
      id: 10,
      club_id: 1,
      player_id: 2,
      player_name: 'Meia Lua',
      type: 'COMPRA',
      value: 37,
      fee: 1.85,
      penalty: 0,
      profit: null,
      cash_change: -38.85,
      created_at: '2026-11-02T10:15:00-03:00',
      contract: {
        purchase_value: 37,
        loyalty_until: '2027-03-02T10:15:00-03:00',
        status: 'ATIVO',
      },
      club_cash: 261.15,
    });
    expect(tx.jogador.updateMany).toHaveBeenCalledWith({
      where: { id: 2, clubeId: null, excluidoEm: null },
      data: { clubeId: 1 },
    });
    expect(tx.clube.updateMany).toHaveBeenCalledWith({
      where: { id: 1, caixa: club.caixa },
      data: { caixa: '261.15' },
    });
    expect(tx.contrato.create).toHaveBeenCalledWith({
      data: {
        jogadorId: 2,
        clubeId: 1,
        valorCompra: '37.00',
        fidelidadeAte: buyDto().loyalty_until,
        situacao: 'ATIVO',
        iniciadoEm: NOW,
      },
    });
  });

  it('não cobra taxa quando o valor de mercado não passa de 30,00', async () => {
    const { service } = setup({
      player: {
        ...player,
        condicao: 'APTO',
        valorBase: new Decimal('30.00'),
        idade: 25,
      },
    });

    const result = await service.buy(2, buyDto());

    expect(result).toMatchObject({
      value: 30,
      fee: 0,
      cash_change: -30,
      club_cash: 270,
    });
  });

  it('responde 404 para jogador inexistente ou excluído', async () => {
    const { service, tx } = setup({ player: null });

    await expect(service.buy(2, buyDto())).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expectNothingWritten(tx);
  });

  it('responde 404 para clube inexistente', async () => {
    const { service, tx } = setup({ club: null });

    await expect(service.buy(2, buyDto())).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expectNothingWritten(tx);
  });

  it('recusa jogador que já tem clube (409)', async () => {
    const { service, tx } = setup({ player: { ...player, clubeId: 5 } });

    await expect(service.buy(2, buyDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expectNothingWritten(tx);
  });

  it('recusa recompra pelo clube que já vendeu o jogador (409)', async () => {
    const { service, tx } = setup({ previousSale: { id: 3 } });

    await expect(service.buy(2, buyDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.transacao.findFirst).toHaveBeenCalledWith({
      where: { clubeId: 1, jogadorId: 2, tipo: 'VENDA' },
    });
    expectNothingWritten(tx);
  });

  it('recusa quando o elenco já tem 12 jogadores (409) e aceita com 11', async () => {
    const full = setup({ squadSize: 12 });
    await expect(full.service.buy(2, buyDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expectNothingWritten(full.tx);

    await expect(
      setup({ squadSize: 11 }).service.buy(2, buyDto()),
    ).resolves.toBeDefined();
  });

  it('recusa custo acima de 50% do caixa (409), sem arredondar o limite', async () => {
    const { service, tx } = setup({
      club: { ...club, caixa: new Decimal('77.69') },
    });

    await expect(service.buy(2, buyDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expectNothingWritten(tx);
  });

  it('aceita custo exatamente igual a 50% do caixa', async () => {
    const { service } = setup({
      club: { ...club, caixa: new Decimal('77.70') },
    });

    await expect(service.buy(2, buyDto())).resolves.toMatchObject({
      club_cash: 38.85,
    });
  });

  it('recusa quando outro pedido levou o jogador no meio da compra (409)', async () => {
    const { service } = setup({ claimedCount: 0 });

    await expect(service.buy(2, buyDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('recusa quando o caixa mudou no meio da compra (409)', async () => {
    const { service } = setup({ chargedCount: 0 });

    await expect(service.buy(2, buyDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  describe('fim da fidelidade', () => {
    it.each([
      ['no próprio momento da compra', NOW.getTime()],
      ['no passado', NOW.getTime() - DAY],
      ['1 dia acima de 1.095 dias', NOW.getTime() + 1096 * DAY],
      ['1 minuto acima de 1.095 dias', NOW.getTime() + 1095 * DAY + 60_000],
    ])('recusa %s (400)', async (_label, instant) => {
      const { service, tx } = setup();

      await expect(
        service.buy(2, buyDto({ loyalty_until: new Date(instant) })),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(tx.jogador.findFirst).not.toHaveBeenCalled();
    });

    it.each([
      ['1 minuto depois', NOW.getTime() + 60_000],
      ['exatamente 1.095 dias depois', NOW.getTime() + 1095 * DAY],
    ])('aceita %s', async (_label, instant) => {
      const { service } = setup();

      await expect(
        service.buy(2, buyDto({ loyalty_until: new Date(instant) })),
      ).resolves.toBeDefined();
    });
  });
});
