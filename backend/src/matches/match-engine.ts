import { SQUAD_ORDER } from '../players/player-listing.js';
import type { PlayerResponse } from '../players/player-response.js';
import type { Condition, Position } from '../players/player.constants.js';

export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';

const ATTACK_ATTRIBUTE: Record<Exclude<Position, 'GOL'>, DuelAttribute> = {
  ATA: 'shooting',
  MEI: 'passing',
  ZAG: 'dribbling',
  LAT: 'dribbling',
};

const TIRED_PERCENT = 85;

export interface LineupSide {
  clubId: number;
  players: PlayerResponse[];
}

export interface DuelParticipant {
  playerId: number;
  playerName: string;
  position: Position;
  condition: Condition;
  attribute: DuelAttribute;
  value: number;
}

export interface Duel {
  order: number;
  attackingClubId: number;
  attacker: DuelParticipant;
  defender: DuelParticipant;
  goal: boolean;
}

export interface MatchOutcome {
  homeGoals: number;
  awayGoals: number;
  duels: Duel[];
}

interface Side {
  clubId: number;
  goalkeeper: PlayerResponse;
  line: PlayerResponse[];
}

function effectiveValue(player: PlayerResponse, attribute: DuelAttribute) {
  const base = player[attribute];
  return player.condition === 'MAL_CONDICIONADO'
    ? Math.floor((base * TIRED_PERCENT + 50) / 100)
    : base;
}

function participant(
  player: PlayerResponse,
  attribute: DuelAttribute,
): DuelParticipant {
  return {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    condition: player.condition,
    attribute,
    value: effectiveValue(player, attribute),
  };
}

function attackAttribute(player: PlayerResponse): DuelAttribute {
  return ATTACK_ATTRIBUTE[player.position as Exclude<Position, 'GOL'>];
}

function toSide(side: LineupSide): Side {
  const ordered = [...side.players].sort(SQUAD_ORDER);

  return {
    clubId: side.clubId,
    goalkeeper: ordered.filter((player) => player.position === 'GOL')[0],
    line: ordered.filter((player) => player.position !== 'GOL'),
  };
}

function attacks(attacking: Side, defending: Side, firstOrder: number): Duel[] {
  const pairs = [
    { attacker: attacking.line[3], defender: defending.goalkeeper },
    { attacker: attacking.line[2], defender: defending.line[0] },
    { attacker: attacking.line[1], defender: defending.line[1] },
  ];

  return pairs.map(({ attacker, defender }, index) => {
    const attack = participant(attacker, attackAttribute(attacker));
    const defense = participant(defender, 'defending');

    return {
      order: firstOrder + index,
      attackingClubId: attacking.clubId,
      attacker: attack,
      defender: defense,
      goal: attack.value > defense.value,
    };
  });
}

function countGoals(duels: Duel[]): number {
  return duels.filter((duel) => duel.goal).length;
}

export function playMatch(home: LineupSide, away: LineupSide): MatchOutcome {
  const homeSide = toSide(home);
  const awaySide = toSide(away);
  const homeAttacks = attacks(homeSide, awaySide, 1);
  const awayAttacks = attacks(awaySide, homeSide, 4);

  return {
    homeGoals: countGoals(homeAttacks),
    awayGoals: countGoals(awayAttacks),
    duels: [...homeAttacks, ...awayAttacks],
  };
}
