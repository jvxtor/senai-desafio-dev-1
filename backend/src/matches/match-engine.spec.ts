import { describe, expect, it } from 'vitest';
import type { PlayerResponse } from '../players/player-response.js';
import type { Condition, Position } from '../players/player.constants.js';
import { playMatch } from './match-engine.js';

function player(
  id: number,
  name: string,
  position: Position,
  attributes: Partial<PlayerResponse> = {},
  condition: Condition = 'APTO',
): PlayerResponse {
  return {
    id,
    name,
    position,
    agility: 50,
    age: 25,
    condition,
    base_value: 10,
    market_value: 10,
    pace: 10,
    shooting: 10,
    passing: 10,
    dribbling: 10,
    defending: 10,
    physical: 10,
    potential: 99,
    overall: 10,
    club_id: 1,
    ...attributes,
  };
}

const eagles = {
  clubId: 1,
  players: [
    player(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
    player(
      31,
      'Davi Lins',
      'LAT',
      { dribbling: 74, defending: 66 },
      'MAL_CONDICIONADO',
    ),
    player(30, 'Rui Prado', 'GOL', { defending: 77 }),
    player(33, 'Lauro Neves', 'MEI', { passing: 82 }),
    player(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
  ],
};

const delta = {
  clubId: 2,
  players: [
    player(40, 'Ivo Teles', 'GOL', { defending: 72 }),
    player(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
    player(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
    player(43, 'Nei Soares', 'MEI', { passing: 70 }),
    player(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
  ],
};

describe('playMatch: exemplo da RN20 (Águias FC 1 x 2 Delta FC)', () => {
  const outcome = playMatch(eagles, delta);

  it('calcula o placar', () => {
    expect(outcome.homeGoals).toBe(1);
    expect(outcome.awayGoals).toBe(2);
  });

  it('monta os 6 duelos na ordem da regra', () => {
    expect(
      outcome.duels.map((duel) => [
        duel.order,
        duel.attackingClubId,
        duel.attacker.playerName,
        duel.attacker.attribute,
        duel.attacker.value,
        duel.defender.playerName,
        duel.defender.value,
        duel.goal,
      ]),
    ).toEqual([
      [1, 1, 'Otto Rangel', 'shooting', 75, 'Ivo Teles', 72, true],
      [2, 1, 'Lauro Neves', 'passing', 82, 'Hugo Vaz', 84, false],
      [3, 1, 'Davi Lins', 'dribbling', 63, 'Lino Matos', 63, false],
      [4, 2, 'Ugo Falcão', 'shooting', 81, 'Rui Prado', 77, true],
      [5, 2, 'Nei Soares', 'passing', 70, 'Téo Brandão', 84, false],
      [6, 2, 'Lino Matos', 'dribbling', 79, 'Davi Lins', 56, true],
    ]);
  });

  it('duelo empatado não é gol, e o defensor usa sempre a defesa', () => {
    const tied = outcome.duels[2];
    expect(tied.attacker.value).toBe(tied.defender.value);
    expect(tied.goal).toBe(false);
    expect(
      outcome.duels.every((duel) => duel.defender.attribute === 'defending'),
    ).toBe(true);
  });

  it('o MAL_CONDICIONADO joga com 85%, arredondando o meio para cima', () => {
    const tired = outcome.duels[2].attacker;
    expect(tired.condition).toBe('MAL_CONDICIONADO');
    expect(tired.value).toBe(63);

    const half = playMatch(
      {
        clubId: 1,
        players: eagles.players.map((item) =>
          item.id === 34
            ? { ...item, shooting: 50, condition: 'MAL_CONDICIONADO' as const }
            : item,
        ),
      },
      delta,
    );
    expect(half.duels[0].attacker.value).toBe(43);
  });

  it('o resultado não depende de quem é o mandante, só de quem ataca', () => {
    const swapped = playMatch(delta, eagles);
    expect(swapped.homeGoals).toBe(outcome.awayGoals);
    expect(swapped.awayGoals).toBe(outcome.homeGoals);
  });
});

describe('playMatch: outras formações e desempates', () => {
  const gk = (id: number, defending: number) =>
    player(id, `Goleiro ${id}`, 'GOL', { defending });

  it('no 1-2-1, os dois MEI seguem o nome: o 1º atacante do meio defende no 2º posto', () => {
    const side = (clubId: number, base: number) => ({
      clubId,
      players: [
        gk(base, 10),
        player(base + 1, 'Zag', 'ZAG', { defending: 20 }),
        player(base + 2, 'Beto Meia', 'MEI', { passing: 90, defending: 30 }),
        player(base + 3, 'Caio Meia', 'MEI', { passing: 50, defending: 40 }),
        player(base + 4, 'Ata', 'ATA', { shooting: 70 }),
      ],
    });

    const outcome = playMatch(side(1, 100), side(2, 200));

    expect(outcome.duels[1].attacker.playerName).toBe('Caio Meia');
    expect(outcome.duels[1].defender.playerName).toBe('Zag');
    expect(outcome.duels[2].attacker.playerName).toBe('Beto Meia');
    expect(outcome.duels[2].defender.playerName).toBe('Beto Meia');
  });

  it('usa drible para ZAG e LAT atacando no 3-1', () => {
    const side = (clubId: number, base: number) => ({
      clubId,
      players: [
        gk(base, 10),
        player(base + 1, 'Zag', 'ZAG', { dribbling: 60 }),
        player(base + 2, 'Lat Um', 'LAT', { dribbling: 61 }),
        player(base + 3, 'Lat Dois', 'LAT', { dribbling: 62 }),
        player(base + 4, 'Ata', 'ATA', { shooting: 70 }),
      ],
    });

    const outcome = playMatch(side(1, 100), side(2, 200));

    expect(outcome.duels[1].attacker).toMatchObject({
      attribute: 'dribbling',
      position: 'LAT',
    });
    expect(outcome.duels[2].attacker).toMatchObject({
      attribute: 'dribbling',
      position: 'LAT',
    });
  });

  it('pode terminar sem gols ou com 3 gols de um lado', () => {
    const strong = {
      clubId: 1,
      players: [
        gk(1, 1),
        player(2, 'Zag', 'ZAG', { defending: 1 }),
        player(3, 'Lat', 'LAT', { dribbling: 99 }),
        player(4, 'Mei', 'MEI', { passing: 99 }),
        player(5, 'Ata', 'ATA', { shooting: 99 }),
      ],
    };
    const wall = {
      clubId: 2,
      players: [
        gk(6, 99),
        player(7, 'Zag', 'ZAG', { defending: 99 }),
        player(8, 'Lat', 'LAT', { dribbling: 50, defending: 99 }),
        player(9, 'Mei', 'MEI', { passing: 50 }),
        player(10, 'Ata', 'ATA', { shooting: 50 }),
      ],
    };

    const outcome = playMatch(strong, wall);

    expect(outcome.homeGoals).toBe(0);
    expect(outcome.awayGoals).toBe(3);
  });
});
