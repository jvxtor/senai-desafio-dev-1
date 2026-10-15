import { ConflictException, NotFoundException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { MarketService } from './market.service.js';

const NOW = new Date('2026-11-05T19:40:00.000Z');
const DAY = 86_400_000;
const LOYALTY_FROM_EXAMPLE = new Date('2027-03-02T13:15:00.000Z');

const soldPlayer = {
  id: 2,
  nome: 'Meia Lua',
  posicao: 'MEI',
  agilidade: 85,
  idade: 25,
  valorBase: new Decimal('40.00'),
  condicao: 'APTO',
  clubeId: 1 as number | null,
};

const club = { id: 1, caixa: new Decimal('261.15') };

function contract(purchaseValue: string, loyaltyUntil: Date) {
  return {
    id: 7,
    valorCompra: new Decimal(purchaseValue),
    fidelidadeAte: loyaltyUntil,
  };
}

interface Scenario {
  player?: typeof soldPlayer | null;
  contract?: ReturnType<typeof contract> | null;
  releasedCount?: number;
  creditedCount?: number;
}

function setup(scenario: Scenario = {}) {
  const tx = {
    jogador: {
      findFirst: vi
        .fn()
        .mockResolvedValue(
          scenario.player === undefined ? soldPlayer : scenario.player,
        ),
      updateMany: vi
        .fn()
        .mockResolvedValue({ count: scenario.releasedCount ?? 1 }),
    },
    clube: {
      findUniqueOrThrow: vi.fn().mockResolvedValue(club),
      updateMany: vi
        .fn()
        .mockResolvedValue({ count: scenario.creditedCount ?? 1 }),
    },
    contrato: {
      findFirst: vi
        .fn()
        .mockResolvedValue(
          scenario.contract === undefined
            ? contract('37.00', LOYALTY_FROM_EXAMPLE)
            : scenario.contract,
        ),
      update: vi.fn().mockResolvedValue({}),
    },
    escalacao: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    transacao: {
      create: vi.fn(({ data }) =>
        Promise.resolve({
          id: 11,
          ...data,
          valor: new Decimal(data.valor),
          taxa: new Decimal(data.taxa),
          multa: new Decimal(data.multa),
          lucro: new Decimal(data.lucro),
          variacaoCaixa: new Decimal(data.variacaoCaixa),
        }),
      ),
    },
  };
  const prisma = { $transaction: vi.fn((callback) => callback(tx)) };
  return { service: new MarketService(prisma as unknown as PrismaService), tx };
}

function expectNothingWritten(tx: ReturnType<typeof setup>['tx']) {
  expect(tx.jogador.updateMany).not.toHaveBeenCalled();
  expect(tx.clube.updateMany).not.toHaveBeenCalled();
  expect(tx.escalacao.deleteMany).not.toHaveBeenCalled();
  expect(tx.contrato.update).not.toHaveBeenCalled();
  expect(tx.transacao.create).not.toHaveBeenCalled();
}

describe('MarketService.sell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('vende com multa e comissão, como no exemplo 2.3.2', async () => {
    const { service, tx } = setup();

    const result = await service.sell(2);

    expect(result).toEqual({
      id: 11,
      club_id: 1,
      player_id: 2,
      player_name: 'Meia Lua',
      type: 'VENDA',
      value: 40,
      fee: 0.3,
      penalty: 4,
      profit: 3,
      cash_change: 35.7,
      created_at: '2026-11-05T16:40:00-03:00',
      purchase_value: 37,
      remaining_days: 117,
      penalty_rate: 10,
      contract_status: 'RESCINDIDO',
      club_cash: 296.85,
    });
    expect(tx.jogador.updateMany).toHaveBeenCalledWith({
      where: { id: 2, clubeId: 1 },
      data: { clubeId: null },
    });
    expect(tx.clube.updateMany).toHaveBeenCalledWith({
      where: { id: 1, caixa: club.caixa },
      data: { caixa: '296.85' },
    });
    expect(tx.contrato.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { situacao: 'RESCINDIDO', encerradoEm: NOW },
    });
  });

  it('tira o jogador da escalação na mesma operação', async () => {
    const { service, tx } = setup();

    await service.sell(2);

    expect(tx.escalacao.deleteMany).toHaveBeenCalledWith({
      where: { jogadorId: 2 },
    });
  });

  it('vende com prejuízo: multa de 20%, sem comissão', async () => {
    const { service } = setup({
      player: { ...soldPlayer, valorBase: new Decimal('42.50') },
      contract: contract('50.00', new Date(NOW.getTime() + 200 * DAY)),
    });

    await expect(service.sell(2)).resolves.toMatchObject({
      value: 42.5,
      penalty: 8.5,
      fee: 0,
      profit: -7.5,
      cash_change: 34,
      remaining_days: 200,
      penalty_rate: 20,
      club_cash: 295.15,
    });
  });

  it('limita a multa a 10,00', async () => {
    const { service } = setup({
      player: { ...soldPlayer, valorBase: new Decimal('75.00') },
      contract: contract('60.00', new Date(NOW.getTime() + 200 * DAY)),
    });

    await expect(service.sell(2)).resolves.toMatchObject({
      penalty: 10,
      profit: 15,
      fee: 2,
      cash_change: 63,
    });
  });

  it('com a fidelidade cumprida não há multa e o contrato fica ENCERRADO', async () => {
    const { service, tx } = setup({
      player: { ...soldPlayer, valorBase: new Decimal('25.00') },
      contract: contract('25.00', new Date(NOW.getTime() - DAY)),
    });

    await expect(service.sell(2)).resolves.toMatchObject({
      penalty: 0,
      fee: 0,
      profit: 0,
      remaining_days: 0,
      penalty_rate: 0,
      contract_status: 'ENCERRADO',
      cash_change: 25,
    });
    expect(tx.contrato.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { situacao: 'ENCERRADO', encerradoEm: NOW },
    });
  });

  it('responde 404 para jogador inexistente ou excluído', async () => {
    const { service, tx } = setup({ player: null });

    await expect(service.sell(2)).rejects.toBeInstanceOf(NotFoundException);
    expectNothingWritten(tx);
  });

  it('recusa vender jogador livre (409)', async () => {
    const { service, tx } = setup({ player: { ...soldPlayer, clubeId: null } });

    await expect(service.sell(2)).rejects.toBeInstanceOf(ConflictException);
    expectNothingWritten(tx);
  });

  it('recusa quando não há contrato ativo (409)', async () => {
    const { service, tx } = setup({ contract: null });

    await expect(service.sell(2)).rejects.toBeInstanceOf(ConflictException);
    expectNothingWritten(tx);
  });

  it('recusa quando outro pedido já vendeu o jogador no meio da operação (409)', async () => {
    const { service } = setup({ releasedCount: 0 });

    await expect(service.sell(2)).rejects.toBeInstanceOf(ConflictException);
  });

  it('recusa quando o caixa mudou no meio da operação (409)', async () => {
    const { service } = setup({ creditedCount: 0 });

    await expect(service.sell(2)).rejects.toBeInstanceOf(ConflictException);
  });
});
