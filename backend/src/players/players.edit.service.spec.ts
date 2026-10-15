import { ConflictException, NotFoundException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PlayersService } from './players.service.js';

const stored = {
  id: 4,
  nome: 'Davi Melo',
  posicao: 'MEI',
  agilidade: 70,
  idade: 23,
  valorBase: new Decimal('40.00'),
  condicao: 'APTO',
  clubeId: null as number | null,
  velocidade: 70,
  finalizacao: 68,
  passe: 82,
  drible: 79,
  defesa: 55,
  fisico: 64,
  potencial: 86,
};

const edit = {
  name: 'Davi Melo Filho',
  position: 'MEI' as const,
  agility: 75,
  age: 23,
};

function setup(player: typeof stored | null) {
  const findFirst = vi.fn().mockResolvedValue(player);
  const update = vi.fn(({ data }) => Promise.resolve({ ...player, ...data }));
  const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
  const tx = { jogador: { update }, escalacao: { deleteMany } };
  const prisma = {
    jogador: { findFirst, update },
    $transaction: vi.fn((callback) => callback(tx)),
  };
  const service = new PlayersService(prisma as unknown as PrismaService);
  return { service, update, deleteMany };
}

describe('PlayersService.update', () => {
  it('edita nome, posição, agilidade e idade', async () => {
    const { service, update } = setup(stored);

    const result = await service.update(4, { ...edit, position: 'ATA' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: {
        nome: 'Davi Melo Filho',
        posicao: 'ATA',
        agilidade: 75,
        idade: 23,
      },
    });
    expect(result).toMatchObject({
      name: 'Davi Melo Filho',
      position: 'ATA',
      base_value: 40,
    });
  });

  it('responde 404 quando o jogador não existe', async () => {
    const { service } = setup(null);

    await expect(service.update(4, edit)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('recusa mudar a posição de jogador com clube (409)', async () => {
    const { service, update } = setup({ ...stored, clubeId: 1 });

    await expect(
      service.update(4, { ...edit, position: 'ATA' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });

  it('aceita editar jogador com clube sem mudar a posição', async () => {
    const { service } = setup({ ...stored, clubeId: 1 });

    await expect(service.update(4, edit)).resolves.toMatchObject({
      club_id: 1,
    });
  });

  it('recusa diminuir a idade (409), mas aceita manter ou aumentar', async () => {
    const { service, update } = setup(stored);

    await expect(
      service.update(4, { ...edit, age: 22 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
    await expect(
      service.update(4, { ...edit, age: 23 }),
    ).resolves.toBeDefined();
    await expect(
      service.update(4, { ...edit, age: 30 }),
    ).resolves.toBeDefined();
  });
});

describe('PlayersService.changeCondition', () => {
  it('recusa DOENTE direto para APTO (409)', async () => {
    const { service, update } = setup({ ...stored, condicao: 'DOENTE' });

    await expect(
      service.changeCondition(4, { condition: 'APTO' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });

  it('aceita a condição atual sem alterar nada', async () => {
    const { service, update } = setup({ ...stored, condicao: 'DOENTE' });

    await expect(
      service.changeCondition(4, { condition: 'DOENTE' }),
    ).resolves.toMatchObject({ condition: 'DOENTE' });
    expect(update).not.toHaveBeenCalled();
  });

  it('DOENTE pode passar para MAL_CONDICIONADO', async () => {
    const { service } = setup({ ...stored, condicao: 'DOENTE' });

    await expect(
      service.changeCondition(4, { condition: 'MAL_CONDICIONADO' }),
    ).resolves.toMatchObject({ condition: 'MAL_CONDICIONADO' });
  });

  it('ao ficar DOENTE, tira o jogador da escalação na mesma transação', async () => {
    const { service, update, deleteMany } = setup(stored);

    const result = await service.changeCondition(4, { condition: 'DOENTE' });

    expect(deleteMany).toHaveBeenCalledWith({ where: { jogadorId: 4 } });
    expect(update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { condicao: 'DOENTE' },
    });
    expect(result).toMatchObject({ condition: 'DOENTE', market_value: 28 });
  });

  it('MAL_CONDICIONADO não mexe na escalação', async () => {
    const { service, deleteMany } = setup(stored);

    await service.changeCondition(4, { condition: 'MAL_CONDICIONADO' });

    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('responde 404 quando o jogador não existe', async () => {
    const { service } = setup(null);

    await expect(
      service.changeCondition(4, { condition: 'DOENTE' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
