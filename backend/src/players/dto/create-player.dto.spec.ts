import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CreatePlayerDto } from './create-player.dto.js';

const pipe = new ValidationPipe({ whitelist: true });

const validBody = {
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

function validate(body: unknown) {
  return pipe.transform(body, { type: 'body', metatype: CreatePlayerDto });
}

describe('CreatePlayerDto', () => {
  it('aceita um cadastro válido', async () => {
    await expect(validate(validBody)).resolves.toMatchObject({
      name: 'Meia Lua',
    });
  });

  it('normaliza os espaços do nome (V4)', async () => {
    const result = await validate({ ...validBody, name: '  Meia   Zeta ' });
    expect(result).toMatchObject({ name: 'Meia Zeta' });
  });

  it('ignora campos controlados pelo sistema, sem erro (V7)', async () => {
    const result = await validate({
      ...validBody,
      id: 9,
      base_value: 99,
      overall: 1,
      club_id: 3,
    });
    expect(result).not.toHaveProperty('base_value');
    expect(result).not.toHaveProperty('id');
  });

  const invalidCases: [string, Record<string, unknown>][] = [
    ['nome com uma palavra só', { name: 'Zeta' }],
    ['nome com dígito', { name: 'Meia Lua 2' }],
    ['nome com tabulação', { name: 'Meia\tLua' }],
    ['nome só com espaços', { name: '    ' }],
    ['posição em minúsculas', { position: 'mei' }],
    ['inteiro enviado como texto', { agility: '15' }],
    ['inteiro com parte fracionária', { age: 25.5 }],
    ['campo obrigatório nulo', { pace: null }],
    ['agilidade acima de 100', { agility: 101 }],
    ['idade abaixo de 16', { age: 15 }],
    ['atributo igual a zero', { shooting: 0 }],
    [
      'soma dos atributos acima de 480',
      {
        pace: 99,
        shooting: 99,
        passing: 99,
        dribbling: 99,
        defending: 99,
        physical: 99,
      },
    ],
    ['potencial menor que o maior atributo', { potential: 80 }],
    [
      'agilidade acima de 85 com 35 anos',
      { age: 35, agility: 86, potential: 86 },
    ],
    [
      'potencial diferente do maior atributo com 33 anos',
      { age: 33, potential: 90 },
    ],
  ];

  it.each(invalidCases)('recusa: %s', async (_label, override) => {
    await expect(
      validate({ ...validBody, ...override }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa campo obrigatório ausente (V6)', async () => {
    const { name: _name, ...withoutName } = validBody;
    await expect(validate(withoutName)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('aceita potencial igual ao maior atributo com 33 anos', async () => {
    await expect(
      validate({ ...validBody, age: 33, potential: 82 }),
    ).resolves.toBeDefined();
  });

  it('recusa corpo que é um array (V1)', async () => {
    await expect(validate([])).rejects.toBeInstanceOf(BadRequestException);
  });
});
