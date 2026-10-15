import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ListPlayersQueryDto } from './list-players-query.dto.js';

const pipe = new ValidationPipe({ whitelist: true });

function validate(query: Record<string, unknown>) {
  return pipe.transform(query, {
    type: 'query',
    metatype: ListPlayersQueryDto,
  });
}

describe('ListPlayersQueryDto', () => {
  it('aceita a consulta sem parâmetros', async () => {
    await expect(validate({})).resolves.toEqual({});
  });

  it('converte os valores válidos para os tipos certos', async () => {
    const result = await validate({
      search: '  lua   ',
      position: 'MEI',
      condition: 'APTO',
      free: 'false',
      club_id: '3',
      min_age: '18',
      max_age: '30',
      min_value: '10.5',
      max_value: '100',
      sort: 'value_desc,age_asc',
      page: '2',
      limit: '50',
    });

    expect(result).toEqual({
      search: 'lua',
      position: 'MEI',
      condition: 'APTO',
      free: false,
      club_id: 3,
      min_age: 18,
      max_age: 30,
      min_value: 10.5,
      max_value: 100,
      sort: 'value_desc,age_asc',
      page: 2,
      limit: 50,
    });
  });

  it('ignora parâmetros que não existem', async () => {
    await expect(validate({ foo: 'bar', page: '1' })).resolves.toEqual({
      page: 1,
    });
  });

  it('aceita free=false junto com club_id', async () => {
    await expect(
      validate({ free: 'false', club_id: '1' }),
    ).resolves.toBeDefined();
  });

  it('aceita faixas com os dois limites iguais', async () => {
    await expect(
      validate({
        min_age: '20',
        max_age: '20',
        min_value: '0',
        max_value: '0',
      }),
    ).resolves.toBeDefined();
  });

  const invalidQueries: Record<string, unknown>[] = [
    { position: '' },
    { position: 'mei' },
    { condition: 'LESIONADO' },
    { free: 'TRUE' },
    { free: '1' },
    { search: '' },
    { search: '   ' },
    { search: 'a' },
    { search: 'a'.repeat(101) },
    { search: 'lu\ta' },
    { page: '0' },
    { page: '-1' },
    { page: '01' },
    { page: '1.5' },
    { page: '1e2' },
    { page: '+1' },
    { page: 'abc' },
    { limit: '0' },
    { limit: '51' },
    { club_id: '0' },
    { club_id: '2147483648' },
    { min_age: '15' },
    { max_age: '46' },
    { min_value: '-1' },
    { min_value: '.5' },
    { min_value: '05' },
    { min_value: '10,5' },
    { min_value: '10.555' },
    { max_value: '551' },
    { max_value: '1e2' },
    { sort: 'POSITION' },
    { sort: 'preco' },
    { sort: 'name,' },
    { sort: ' name' },
    { sort: 'name, age_asc' },
    { sort: 'value_asc,value_desc' },
    { sort: 'name,name' },
    { sort: 'name,age_asc,position' },
    { min_age: '30', max_age: '20' },
    { min_value: '50', max_value: '10' },
    { free: 'true', club_id: '1' },
  ];

  it.each(invalidQueries)('recusa %j', async (query) => {
    await expect(validate(query)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa parâmetro repetido', async () => {
    await expect(validate({ page: ['1', '2'] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
