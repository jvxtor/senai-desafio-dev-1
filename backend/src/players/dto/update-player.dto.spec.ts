import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ChangeConditionDto } from './change-condition.dto.js';
import { UpdatePlayerDto } from './update-player.dto.js';

const pipe = new ValidationPipe({ whitelist: true });

const validBody = { name: 'Davi Melo', position: 'MEI', agility: 70, age: 23 };

function validate(metatype: new () => object, body: unknown) {
  return pipe.transform(body, { type: 'body', metatype });
}

describe('UpdatePlayerDto', () => {
  it('aceita uma edição válida', async () => {
    await expect(validate(UpdatePlayerDto, validBody)).resolves.toMatchObject(
      validBody,
    );
  });

  it('ignora indicadores, potencial e condição enviados no corpo (V7)', async () => {
    const result = await validate(UpdatePlayerDto, {
      ...validBody,
      pace: 50,
      potential: 99,
      condition: 'DOENTE',
    });
    expect(result).not.toHaveProperty('pace');
    expect(result).not.toHaveProperty('potential');
    expect(result).not.toHaveProperty('condition');
  });

  const invalidCases: [string, Record<string, unknown>][] = [
    ['nome com uma palavra só', { name: 'Davi' }],
    ['posição em minúsculas', { position: 'mei' }],
    ['agilidade como texto', { agility: '70' }],
    ['idade fora do limite', { age: 46 }],
    ['agilidade acima de 85 com 35 anos', { age: 35, agility: 86 }],
    ['campo obrigatório nulo', { agility: null }],
  ];

  it.each(invalidCases)('recusa: %s', async (_label, override) => {
    await expect(
      validate(UpdatePlayerDto, { ...validBody, ...override }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa campo enviado com outro nome (Agility)', async () => {
    const { agility: _agility, ...withoutAgility } = validBody;
    await expect(
      validate(UpdatePlayerDto, { ...withoutAgility, Agility: 70 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exige os quatro campos, mesmo que só um mude', async () => {
    const { age: _age, ...withoutAge } = validBody;
    await expect(validate(UpdatePlayerDto, withoutAge)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('ChangeConditionDto', () => {
  it.each(['APTO', 'MAL_CONDICIONADO', 'DOENTE'])(
    'aceita %s',
    async (condition) => {
      await expect(
        validate(ChangeConditionDto, { condition }),
      ).resolves.toBeDefined();
    },
  );

  it.each([{}, { condition: null }, { condition: 'apto' }, { condition: 'X' }])(
    'recusa %j',
    async (body) => {
      await expect(validate(ChangeConditionDto, body)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
});
