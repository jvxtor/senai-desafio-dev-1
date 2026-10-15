import { ConflictException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { ClubsService } from './clubs.service.js';

const dto = { name: 'Águias FC', acronym: 'AGU' };

function setup(
  existing: { nome: string; sigla: string }[],
  createError?: unknown,
) {
  const create = vi.fn(({ data }) =>
    createError
      ? Promise.reject(createError)
      : Promise.resolve({ id: 1, ...data, caixa: new Decimal('300.00') }),
  );
  const tx = {
    clube: { findMany: vi.fn().mockResolvedValue(existing), create },
  };
  const prisma = { $transaction: vi.fn((callback) => callback(tx)) };
  return {
    service: new ClubsService(prisma as unknown as PrismaService),
    create,
  };
}

function clubs(total: number) {
  return Array.from({ length: total }, (_, index) => ({
    nome: `Clube ${index}`,
    sigla: `C${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + Math.floor(index / 26))}`,
  }));
}

describe('ClubsService.create', () => {
  it('cria o clube com caixa de 300,00, elenco zerado e patrimônio de 300,00', async () => {
    const { service, create } = setup([]);

    const result = await service.create(dto);

    expect(create).toHaveBeenCalledWith({
      data: { nome: 'Águias FC', sigla: 'AGU' },
    });
    expect(result).toEqual({
      id: 1,
      name: 'Águias FC',
      acronym: 'AGU',
      cash: 300,
      squad_value: 0,
      net_worth: 300,
    });
  });

  it('recusa nome repetido ignorando maiúsculas e minúsculas (409)', async () => {
    const { service, create } = setup([{ nome: 'águias fc', sigla: 'XYZ' }]);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(create).not.toHaveBeenCalled();
  });

  it('aceita nome que só difere pelo acento', async () => {
    const { service } = setup([{ nome: 'Aguias FC', sigla: 'XYZ' }]);

    await expect(service.create(dto)).resolves.toMatchObject({ id: 1 });
  });

  it('recusa sigla repetida (409)', async () => {
    const { service, create } = setup([{ nome: 'Outro Clube', sigla: 'AGU' }]);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(create).not.toHaveBeenCalled();
  });

  it('aceita o 20º clube e recusa o 21º (409)', async () => {
    await expect(setup(clubs(19)).service.create(dto)).resolves.toBeDefined();

    const full = setup(clubs(20));
    await expect(full.service.create(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(full.create).not.toHaveBeenCalled();
  });

  it('transforma a violação de unicidade do banco em 409', async () => {
    const { service } = setup([], { code: 'P2002' });

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('repassa outros erros do banco', async () => {
    const failure = new Error('falha de conexão');
    const { service } = setup([], failure);

    await expect(service.create(dto)).rejects.toBe(failure);
  });
});
