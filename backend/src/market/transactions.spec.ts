import {
  NotFoundException,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { describe, expect, it, vi } from 'vitest';
import type { Transacao } from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { toTransactionsCsv } from './transaction-csv.js';
import { calculateSummary } from './transaction-summary.js';
import { TransactionsService } from './transactions.service.js';

const purchase = {
  id: 10,
  clubeId: 1,
  jogadorId: 2,
  nomeJogador: 'Meia Lua',
  tipo: 'COMPRA',
  valor: new Decimal('37.00'),
  taxa: new Decimal('1.85'),
  multa: new Decimal('0.00'),
  lucro: null,
  variacaoCaixa: new Decimal('-38.85'),
  criadoEm: new Date('2026-11-02T13:15:00.000Z'),
} as Transacao;

const sale = {
  id: 11,
  clubeId: 1,
  jogadorId: 2,
  nomeJogador: 'Meia Lua',
  tipo: 'VENDA',
  valor: new Decimal('40.00'),
  taxa: new Decimal('0.30'),
  multa: new Decimal('4.00'),
  lucro: new Decimal('3.00'),
  variacaoCaixa: new Decimal('35.70'),
  criadoEm: new Date('2026-11-05T19:40:00.000Z'),
} as Transacao;

describe('calculateSummary (RN17)', () => {
  it('soma compra e venda do exemplo do enunciado', () => {
    expect(calculateSummary([sale, purchase])).toEqual({
      total_spent: 38.85,
      total_received: 35.7,
      total_fees: 2.15,
      total_penalties: 4,
      total_profit: 3,
    });
  });

  it('só vendas: total gasto zerado', () => {
    expect(calculateSummary([sale])).toEqual({
      total_spent: 0,
      total_received: 35.7,
      total_fees: 0.3,
      total_penalties: 4,
      total_profit: 3,
    });
  });

  it('só compras: nada recebido', () => {
    expect(calculateSummary([purchase])).toMatchObject({
      total_spent: 38.85,
      total_received: 0,
      total_profit: 0,
    });
  });

  it('soma o lucro com sinal', () => {
    const loss = { ...sale, lucro: new Decimal('-7.50') } as Transacao;
    expect(calculateSummary([loss, sale]).total_profit).toBe(-4.5);
  });

  it('sem transações, tudo zerado', () => {
    expect(calculateSummary([])).toEqual({
      total_spent: 0,
      total_received: 0,
      total_fees: 0,
      total_penalties: 0,
      total_profit: 0,
    });
  });
});

describe('toTransactionsCsv (RN18)', () => {
  it('gera o exemplo do enunciado', () => {
    expect(toTransactionsCsv([sale, purchase])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n' +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('sem transações traz só o cabeçalho, com LF no fim', () => {
    expect(toTransactionsCsv([])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n',
    );
  });

  it('coloca entre aspas o nome com ponto e vírgula ou aspas', () => {
    const quoted = { ...sale, nomeJogador: 'Zé "Foguete" Lima' } as Transacao;
    const semicolon = { ...sale, nomeJogador: 'Ana; Lima' } as Transacao;

    expect(toTransactionsCsv([quoted])).toContain(';"Zé ""Foguete"" Lima";');
    expect(toTransactionsCsv([semicolon])).toContain(';"Ana; Lima";');
  });

  it('não usa BOM nem CRLF', () => {
    const csv = toTransactionsCsv([sale]);
    expect(csv.charCodeAt(0)).not.toBe(0xfeff);
    expect(csv).not.toContain('\r');
  });
});

describe('ListTransactionsQueryDto', () => {
  const pipe = new ValidationPipe({ whitelist: true });
  const validate = (body: unknown) =>
    pipe.transform(body, { type: 'query', metatype: ListTransactionsQueryDto });

  it.each(['COMPRA', 'VENDA', 'COMPRA,VENDA', 'VENDA,COMPRA'])(
    'aceita type=%s',
    async (type) => {
      await expect(validate({ type })).resolves.toEqual({ type });
    },
  );

  it('aceita player_id e ignora parâmetros desconhecidos', async () => {
    await expect(validate({ player_id: '2', foo: 'x' })).resolves.toEqual({
      player_id: 2,
    });
  });

  it.each([
    { type: '' },
    { type: 'compra' },
    { type: 'COMPRA,venda' },
    { type: 'COMPRA, VENDA' },
    { type: 'COMPRA,COMPRA' },
    { type: 'COMPRA,VENDA,COMPRA' },
    { type: 'TROCA' },
    { player_id: '' },
    { player_id: '0' },
    { player_id: '-1' },
    { player_id: '01' },
    { player_id: '1.5' },
    { player_id: 'abc' },
    { player_id: '2147483648' },
  ])('recusa %j', async (query) => {
    await expect(validate(query)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('TransactionsService', () => {
  function setup(options: { club?: object | null; player?: object | null }) {
    const findMany = vi.fn().mockResolvedValue([sale, purchase]);
    const prisma = {
      clube: {
        findUnique: vi
          .fn()
          .mockResolvedValue(options.club === undefined ? {} : options.club),
      },
      jogador: {
        findFirst: vi
          .fn()
          .mockResolvedValue(
            options.player === undefined ? {} : options.player,
          ),
      },
      transacao: { findMany },
    };
    return {
      service: new TransactionsService(prisma as unknown as PrismaService),
      prisma,
      findMany,
    };
  }

  it('lista da mais recente para a mais antiga, com o summary', async () => {
    const { service, findMany } = setup({});

    const result = await service.list(1, {});

    expect(findMany).toHaveBeenCalledWith({
      where: { clubeId: 1, tipo: undefined, jogadorId: undefined },
      orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    });
    expect(result.data.map((item) => item.id)).toEqual([11, 10]);
    expect(result.data[0]).toMatchObject({
      type: 'VENDA',
      created_at: '2026-11-05T16:40:00-03:00',
      profit: 3,
    });
    expect(result.summary.total_spent).toBe(38.85);
  });

  it('aplica os filtros de tipo e de jogador', async () => {
    const { service, findMany } = setup({});

    await service.list(1, { type: 'COMPRA,VENDA', player_id: 2 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clubeId: 1, tipo: { in: ['COMPRA', 'VENDA'] }, jogadorId: 2 },
      }),
    );
  });

  it('responde 404 para clube inexistente, sem consultar as transações', async () => {
    const { service, findMany } = setup({ club: null });

    await expect(service.list(9, {})).rejects.toBeInstanceOf(NotFoundException);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('responde 404 para jogador inexistente ou excluído', async () => {
    const { service, prisma } = setup({ player: null });

    await expect(service.list(1, { player_id: 9 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.jogador.findFirst).toHaveBeenCalledWith({
      where: { id: 9, excluidoEm: null },
    });
  });

  it('exporta o CSV com os mesmos filtros e erros', async () => {
    const { service } = setup({});
    await expect(service.exportCsv(1, {})).resolves.toContain('VENDA;Meia Lua');

    const missing = setup({ club: null });
    await expect(missing.service.exportCsv(9, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
