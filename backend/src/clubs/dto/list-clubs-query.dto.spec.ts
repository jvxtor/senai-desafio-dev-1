import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ListClubsQueryDto } from './list-clubs-query.dto.js';

const pipe = new ValidationPipe({ whitelist: true });

function validate(query: Record<string, unknown>) {
  return pipe.transform(query, { type: 'query', metatype: ListClubsQueryDto });
}

describe('ListClubsQueryDto', () => {
  it('aceita a consulta sem parâmetros', async () => {
    await expect(validate({})).resolves.toEqual({});
  });

  it.each(['name', 'net_worth_asc', 'net_worth_desc'])(
    'aceita sort=%s',
    async (sort) => {
      await expect(validate({ sort })).resolves.toEqual({ sort });
    },
  );

  it('ignora parâmetros que não existem', async () => {
    await expect(validate({ foo: 'bar' })).resolves.toEqual({});
  });

  it.each([
    '',
    'NAME',
    'net_worth',
    'name,net_worth_asc',
    ' name',
    'patrimonio',
  ])('recusa sort="%s"', async (sort) => {
    await expect(validate({ sort })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
