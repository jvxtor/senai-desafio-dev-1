import { describe, expect, it } from 'vitest';
import { calculateStandings } from './standings.js';

const clubs = [
  { id: 1, nome: 'Águias FC' },
  { id: 2, nome: 'Delta FC' },
  { id: 3, nome: 'Gama SC' },
  { id: 4, nome: 'Épsilon EC' },
  { id: 5, nome: 'Mangue FC' },
  { id: 6, nome: 'Tubarões EC' },
];

const matches = [
  { mandanteId: 1, visitanteId: 2, golsMandante: 1, golsVisitante: 2 },
  { mandanteId: 3, visitanteId: 4, golsMandante: 2, golsVisitante: 1 },
  { mandanteId: 4, visitanteId: 1, golsMandante: 3, golsVisitante: 2 },
  { mandanteId: 2, visitanteId: 3, golsMandante: 0, golsVisitante: 1 },
];

describe('calculateStandings (RN21)', () => {
  const table = calculateStandings(clubs, matches);

  it('ordena pelo exemplo do enunciado', () => {
    expect(
      table.map((row) => [row.position, row.club_name, row.points]),
    ).toEqual([
      [1, 'Gama SC', 6],
      [2, 'Épsilon EC', 3],
      [3, 'Delta FC', 3],
      [4, 'Mangue FC', 0],
      [5, 'Tubarões EC', 0],
      [6, 'Águias FC', 0],
    ]);
  });

  it('desempata por pontos, saldo, gols marcados e nome', () => {
    const gama = table[0];
    expect(gama).toMatchObject({ goal_difference: 2, goals_for: 3 });
    expect(table[1]).toMatchObject({ goal_difference: 0, goals_for: 4 });
    expect(table[2]).toMatchObject({ goal_difference: 0, goals_for: 2 });
    expect(table[5]).toMatchObject({ goal_difference: -2, goals_for: 3 });
  });

  it('inclui os clubes que não jogaram, zerados', () => {
    expect(table[3]).toEqual({
      position: 4,
      club_id: 5,
      club_name: 'Mangue FC',
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    });
  });

  it('conta vitórias, empates e derrotas com 3, 1 e 0 pontos', () => {
    const result = calculateStandings(clubs.slice(0, 2), [
      { mandanteId: 1, visitanteId: 2, golsMandante: 1, golsVisitante: 1 },
      { mandanteId: 1, visitanteId: 2, golsMandante: 2, golsVisitante: 0 },
    ]);

    expect(result[0]).toMatchObject({
      club_name: 'Águias FC',
      played: 2,
      wins: 1,
      draws: 1,
      losses: 0,
      points: 4,
    });
    expect(result[1]).toMatchObject({
      wins: 0,
      draws: 1,
      losses: 1,
      points: 1,
    });
  });

  it('a posição vai de 1 ao total de clubes, sem repetir', () => {
    expect(table.map((row) => row.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('sem clubes devolve lista vazia', () => {
    expect(calculateStandings([], [])).toEqual([]);
  });
});
