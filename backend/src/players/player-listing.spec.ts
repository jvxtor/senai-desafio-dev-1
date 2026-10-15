import { describe, expect, it } from 'vitest';
import { applyListing, buildWhere } from './player-listing.js';
import type { PlayerResponse } from './player-response.js';
import type { Position } from './player.constants.js';

let nextId = 1;

function player(
  name: string,
  overrides: Partial<PlayerResponse> = {},
): PlayerResponse {
  return {
    id: nextId++,
    name,
    position: 'MEI' as Position,
    agility: 50,
    age: 25,
    condition: 'APTO',
    base_value: 40,
    market_value: 40,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    potential: 60,
    overall: 50,
    club_id: null,
    ...overrides,
  };
}

function names(players: PlayerResponse[]) {
  return players.map((item) => item.name);
}

describe('applyListing: busca', () => {
  const players = [
    player('João Silva'),
    player('Meia Lua'),
    player('Ana Lima'),
  ];

  it('ignora acentos e maiúsculas e procura dentro do nome', () => {
    expect(names(applyListing(players, { search: 'joao' }).data)).toEqual([
      'João Silva',
    ]);
    expect(names(applyListing(players, { search: 'LUA' }).data)).toEqual([
      'Meia Lua',
    ]);
    expect(names(applyListing(players, { search: 'ia l' }).data)).toEqual([
      'Meia Lua',
    ]);
  });

  it('conta apenas os jogadores que atendem à busca em total_items', () => {
    expect(applyListing(players, { search: 'lima' }).meta.total_items).toBe(1);
  });
});

describe('applyListing: faixa de valor de mercado', () => {
  const players = [
    player('Ana Lima', { market_value: 10 }),
    player('Bia Souza', { market_value: 37 }),
    player('Caio Reis', { market_value: 8.79 }),
  ];

  it('inclui os dois limites', () => {
    const result = applyListing(players, { min_value: 8.79, max_value: 37 });
    expect(names(result.data)).toEqual(['Ana Lima', 'Bia Souza', 'Caio Reis']);
  });

  it('assume o extremo quando vem só um dos limites', () => {
    expect(names(applyListing(players, { min_value: 10 }).data)).toEqual([
      'Ana Lima',
      'Bia Souza',
    ]);
    expect(names(applyListing(players, { max_value: 10 }).data)).toEqual([
      'Ana Lima',
      'Caio Reis',
    ]);
  });
});

describe('applyListing: ordenação', () => {
  it('ordena o nome sem acento, com espaço antes do hífen e do Épsilon entre Delta e Gama', () => {
    const players = [
      player('Ana-Maria'),
      player('Gama Souza'),
      player('Épsilon Reis'),
      player('Ana Lima'),
      player('Delta Alves'),
    ];

    expect(names(applyListing(players, {}).data)).toEqual([
      'Ana Lima',
      'Ana-Maria',
      'Delta Alves',
      'Épsilon Reis',
      'Gama Souza',
    ]);
  });

  it('ordena a posição como GOL, ZAG, LAT, MEI, ATA', () => {
    const players = [
      player('A Um', { position: 'ATA' }),
      player('B Dois', { position: 'GOL' }),
      player('C Tres', { position: 'MEI' }),
      player('D Quatro', { position: 'LAT' }),
      player('E Cinco', { position: 'ZAG' }),
    ];

    const result = applyListing(players, { sort: 'position' });

    expect(result.data.map((item) => item.position)).toEqual([
      'GOL',
      'ZAG',
      'LAT',
      'MEI',
      'ATA',
    ]);
  });

  it('ordena por valor nos dois sentidos, desempatando por nome e depois por id', () => {
    const players = [
      player('Bia Souza', { market_value: 20 }),
      player('Ana Lima', { market_value: 20 }),
      player('Ana Lima', { market_value: 20 }),
      player('Caio Reis', { market_value: 50 }),
    ];

    const desc = applyListing(players, { sort: 'value_desc' }).data;
    expect(desc.map((item) => item.name)).toEqual([
      'Caio Reis',
      'Ana Lima',
      'Ana Lima',
      'Bia Souza',
    ]);
    expect(desc[1].id).toBeLessThan(desc[2].id);

    expect(names(applyListing(players, { sort: 'value_asc' }).data)[3]).toBe(
      'Caio Reis',
    );
  });

  it('usa o segundo critério para desempatar o primeiro', () => {
    const players = [
      player('Ana Lima', { position: 'ATA', age: 20 }),
      player('Bia Souza', { position: 'ATA', age: 30 }),
      player('Caio Reis', { position: 'GOL', age: 25 }),
    ];

    const result = applyListing(players, { sort: 'position,age_desc' });

    expect(names(result.data)).toEqual(['Caio Reis', 'Bia Souza', 'Ana Lima']);
  });

  it('ordena por idade nos dois sentidos', () => {
    const players = [
      player('Ana Lima', { age: 30 }),
      player('Bia Souza', { age: 20 }),
    ];

    expect(names(applyListing(players, { sort: 'age_asc' }).data)).toEqual([
      'Bia Souza',
      'Ana Lima',
    ]);
    expect(names(applyListing(players, { sort: 'age_desc' }).data)).toEqual([
      'Ana Lima',
      'Bia Souza',
    ]);
  });
});

describe('applyListing: paginação (tabela do enunciado)', () => {
  const twentyThree = Array.from({ length: 23 }, (_, index) =>
    player(`Jogador ${String.fromCharCode(65 + index)}`),
  );

  it.each([
    [10, 1, 10, 23, 3],
    [10, 3, 3, 23, 3],
    [10, 4, 0, 23, 3],
    [50, 1, 23, 23, 1],
  ])(
    'limit %i, page %i => %i itens, total %i, páginas %i',
    (limit, page, items, total, pages) => {
      const result = applyListing(twentyThree, { limit, page });

      expect(result.data).toHaveLength(items);
      expect(result.meta).toEqual({
        page,
        limit,
        total_items: total,
        total_pages: pages,
      });
    },
  );

  it('sem resultados devolve lista vazia e 0 páginas', () => {
    expect(applyListing([], {})).toEqual({
      data: [],
      meta: { page: 1, limit: 10, total_items: 0, total_pages: 0 },
    });
  });

  it('pagina depois de ordenar', () => {
    const result = applyListing(twentyThree, { page: 3, limit: 10 });

    expect(names(result.data)).toEqual(['Jogador U', 'Jogador V', 'Jogador W']);
  });
});

describe('buildWhere', () => {
  it('sempre ignora jogadores excluídos', () => {
    expect(buildWhere({})).toMatchObject({ excluidoEm: null });
  });

  it('free=true filtra jogadores sem clube', () => {
    expect(buildWhere({ free: true }).clubeId).toBeNull();
  });

  it('free=false filtra jogadores com clube', () => {
    expect(buildWhere({ free: false }).clubeId).toEqual({ not: null });
  });

  it('club_id filtra o elenco do clube, mesmo com free=false', () => {
    expect(buildWhere({ club_id: 3, free: false }).clubeId).toBe(3);
  });

  it('aplica posição, condição e faixa de idade', () => {
    expect(
      buildWhere({
        position: 'ATA',
        condition: 'DOENTE',
        min_age: 18,
        max_age: 30,
      }),
    ).toMatchObject({
      posicao: 'ATA',
      condicao: 'DOENTE',
      idade: { gte: 18, lte: 30 },
    });
  });
});
