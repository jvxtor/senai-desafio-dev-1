import type { Condition, DuelParticipant, Match, Position } from '../../services/types';
import { compareSquad } from '../clubs/lineup';

const SHORT_NAMES: Record<DuelParticipant['attribute'], string> = {
  shooting: 'Fin',
  passing: 'Pas',
  dribbling: 'Dri',
  defending: 'Def',
};

export interface UsedValue {
  attribute: DuelParticipant['attribute'];
  /** Nome curto para o campo: "Fin", "Pas", "Dri" ou "Def". */
  short: string;
  value: number;
}

/** Um titular de um dos lados, reconstruído dos duelos (que guardam nome, condição e valores). */
export interface FieldPlayer {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
  clubId: number;
  /** Os valores que ele usou na partida, o ataque primeiro e a defesa por último. */
  uses: UsedValue[];
  /** Fez gol em algum duelo de ataque. */
  scored: boolean;
  /** 1º (mais recuado) a 4º (mais avançado) dos jogadores de linha; o goleiro não tem. */
  lineNumber: number | null;
}

/**
 * Os 5 titulares de cada clube saem dos duelos: o goleiro e os 2 mais recuados defendem, os 3
 * mais avançados atacam, e o 2º da linha faz as duas coisas, então todos aparecem em algum duelo.
 */
export function playersOf(match: Match): FieldPlayer[] {
  const byId = new Map<number, FieldPlayer>();

  function add(participant: DuelParticipant, clubId: number, scored: boolean) {
    const player = byId.get(participant.player_id) ?? {
      id: participant.player_id,
      name: participant.player_name,
      position: participant.position,
      condition: participant.condition,
      clubId,
      uses: [],
      scored: false,
      lineNumber: null,
    };

    if (!player.uses.some((used) => used.attribute === participant.attribute)) {
      player.uses.push({
        attribute: participant.attribute,
        short: SHORT_NAMES[participant.attribute],
        value: participant.value,
      });
      player.uses.sort(
        (a, b) => Number(a.attribute === 'defending') - Number(b.attribute === 'defending'),
      );
    }
    player.scored ||= scored;
    byId.set(player.id, player);
  }

  for (const duel of match.duels) {
    const defendingClub =
      duel.attacking_club_id === match.home.club_id ? match.away.club_id : match.home.club_id;
    add(duel.attacker, duel.attacking_club_id, duel.goal);
    add(duel.defender, defendingClub, false);
  }

  const players = [...byId.values()];
  for (const clubId of [match.home.club_id, match.away.club_id]) {
    players
      .filter((player) => player.clubId === clubId && player.position !== 'GOL')
      .sort((a, b) => compareSquad(a, b))
      .forEach((player, index) => {
        player.lineNumber = index + 1;
      });
  }
  return players;
}
