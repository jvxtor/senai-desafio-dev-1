import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CreateClubDto } from './create-club.dto.js';

const pipe = new ValidationPipe({ whitelist: true });

function validate(body: unknown) {
  return pipe.transform(body, { type: 'body', metatype: CreateClubDto });
}

describe('CreateClubDto', () => {
  it.each([
    ['Águias FC', 'AGU'],
    ['Delta FC', 'DEL'],
    ['Delta FC', 'DFC'],
    ['Águias FC', 'AFC'],
    ['Sport Club do Recife', 'SCR'],
    ['Atlético São-Paulo Jr.', 'ATL'],
  ])('aceita %s com a sigla %s', async (name, acronym) => {
    await expect(validate({ name, acronym })).resolves.toEqual({
      name,
      acronym,
    });
  });

  it('normaliza os espaços do nome (V4)', async () => {
    await expect(
      validate({ name: '  águias   fc ', acronym: 'AGU' }),
    ).resolves.toEqual({ name: 'águias fc', acronym: 'AGU' });
  });

  it('ignora campos controlados pelo sistema (V7)', async () => {
    const result = await validate({
      name: 'Águias FC',
      acronym: 'AGU',
      cash: 9999,
      id: 7,
    });
    expect(result).toEqual({ name: 'Águias FC', acronym: 'AGU' });
  });

  const invalidBodies: [string, Record<string, unknown>][] = [
    ['nome com uma palavra só', { name: 'Águias', acronym: 'AGU' }],
    ['nome com mais de 5 palavras', { name: 'a b c d e f', acronym: 'ABC' }],
    ['nome com dígito', { name: 'Águias FC 2', acronym: 'AGU' }],
    ['nome com caractere inválido', { name: 'Águias_FC Sul', acronym: 'AGU' }],
    [
      'nome com mais de 60 caracteres',
      { name: `${'a'.repeat(58)} FC`, acronym: 'AAF' },
    ],
    ['nome só com espaços', { name: '   ', acronym: 'AGU' }],
    ['sigla em minúsculas', { name: 'Águias FC', acronym: 'agu' }],
    ['sigla com acento', { name: 'Águias FC', acronym: 'ÁGU' }],
    ['sigla com 2 letras', { name: 'Águias FC', acronym: 'AG' }],
    ['sigla com 4 letras', { name: 'Águias FC', acronym: 'AGUI' }],
    ['sigla fora da ordem do nome', { name: 'Águias FC', acronym: 'AUG' }],
    [
      'sigla que não começa pela inicial do nome',
      { name: 'Águias FC', acronym: 'GUI' },
    ],
    [
      'sigla com letra que não está no nome',
      { name: 'Águias FC', acronym: 'AGX' },
    ],
    ['sigla com as três letras iguais', { name: 'Aaa Aaa FC', acronym: 'AAA' }],
    ['sigla como número', { name: 'Águias FC', acronym: 123 }],
  ];

  it.each(invalidBodies)('recusa: %s', async (_label, body) => {
    await expect(validate(body)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exige nome e sigla (V6)', async () => {
    await expect(validate({ name: 'Águias FC' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(validate({ acronym: 'AGU' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      validate({ name: null, acronym: 'AGU' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
