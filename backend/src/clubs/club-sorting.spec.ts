import { describe, expect, it } from 'vitest';
import type { ClubResponse } from './club-response.js';
import { buildClubComparator } from './club-sorting.js';

let nextId = 1;

function club(name: string, netWorth: number): ClubResponse {
  return {
    id: nextId++,
    name,
    acronym: 'AAA',
    cash: netWorth,
    squad_value: 0,
    net_worth: netWorth,
  };
}

function names(
  clubs: ClubResponse[],
  sort: Parameters<typeof buildClubComparator>[0],
) {
  return [...clubs].sort(buildClubComparator(sort)).map((item) => item.name);
}

describe('buildClubComparator', () => {
  const clubs = [
    club('Gama SC', 300),
    club('Épsilon EC', 298.15),
    club('Delta FC', 300),
    club('Águias FC', 310),
  ];

  it('ordena pelo nome sem acento: Épsilon fica entre Delta e Gama', () => {
    expect(names(clubs, 'name')).toEqual([
      'Águias FC',
      'Delta FC',
      'Épsilon EC',
      'Gama SC',
    ]);
  });

  it('ordena pelo patrimônio, do maior para o menor, desempatando pelo nome', () => {
    expect(names(clubs, 'net_worth_desc')).toEqual([
      'Águias FC',
      'Delta FC',
      'Gama SC',
      'Épsilon EC',
    ]);
  });

  it('ordena pelo patrimônio, do menor para o maior, desempatando pelo nome', () => {
    expect(names(clubs, 'net_worth_asc')).toEqual([
      'Épsilon EC',
      'Delta FC',
      'Gama SC',
      'Águias FC',
    ]);
  });

  it('desempata nomes iguais na comparação pelo id crescente', () => {
    const tied = [club('Águias FC', 300), club('Aguias FC', 300)];
    const sorted = [...tied].sort(buildClubComparator('name'));

    expect(sorted.map((item) => item.id)).toEqual(
      [...tied].map((item) => item.id).sort((a, b) => a - b),
    );
  });
});
