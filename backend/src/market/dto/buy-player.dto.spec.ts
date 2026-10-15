import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { BuyPlayerDto } from './buy-player.dto.js';

const pipe = new ValidationPipe({ whitelist: true });

function validate(body: unknown) {
  return pipe.transform(body, { type: 'body', metatype: BuyPlayerDto });
}

describe('BuyPlayerDto', () => {
  it('aceita o corpo válido e converte a data de Brasília para o instante exato', async () => {
    const result = (await validate({
      club_id: 1,
      loyalty_until: '2027-03-02T10:15-03:00',
    })) as BuyPlayerDto;

    expect(result.club_id).toBe(1);
    expect(result.loyalty_until.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it('ignora campos que não pertencem ao endpoint (V7)', async () => {
    const result = await validate({
      club_id: 1,
      loyalty_until: '2027-03-02T10:15-03:00',
      price: 1,
    });
    expect(result).not.toHaveProperty('price');
  });

  const invalidBodies: [string, Record<string, unknown>][] = [
    ['club_id ausente', { loyalty_until: '2027-03-02T10:15-03:00' }],
    [
      'club_id nulo',
      { club_id: null, loyalty_until: '2027-03-02T10:15-03:00' },
    ],
    ['club_id zero', { club_id: 0, loyalty_until: '2027-03-02T10:15-03:00' }],
    [
      'club_id negativo',
      { club_id: -1, loyalty_until: '2027-03-02T10:15-03:00' },
    ],
    [
      'club_id como texto',
      { club_id: '1', loyalty_until: '2027-03-02T10:15-03:00' },
    ],
    [
      'club_id fracionário',
      { club_id: 1.5, loyalty_until: '2027-03-02T10:15-03:00' },
    ],
    ['loyalty_until ausente', { club_id: 1 }],
    ['loyalty_until nulo', { club_id: 1, loyalty_until: null }],
    ['data sem o -03:00', { club_id: 1, loyalty_until: '2027-03-02T10:15' }],
    ['data em UTC', { club_id: 1, loyalty_until: '2027-03-02T13:15Z' }],
    [
      'data com segundos',
      { club_id: 1, loyalty_until: '2027-03-02T10:15:00-03:00' },
    ],
    [
      'data inexistente',
      { club_id: 1, loyalty_until: '2027-02-30T10:15-03:00' },
    ],
    ['hora 24', { club_id: 1, loyalty_until: '2027-03-02T24:00-03:00' }],
    ['data como número', { club_id: 1, loyalty_until: 1800000000 }],
    [
      'campo em camelCase',
      { club_id: 1, loyaltyUntil: '2027-03-02T10:15-03:00' },
    ],
  ];

  it.each(invalidBodies)('recusa: %s', async (_label, body) => {
    await expect(validate(body)).rejects.toBeInstanceOf(BadRequestException);
  });
});
