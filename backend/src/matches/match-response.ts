import { formatBrasiliaDateTime } from '../common/dates.js';
import type {
  Clube,
  DueloPartida,
  Partida,
} from '../generated/prisma/client.js';

export class DuelParticipantResponse {
  /** Identificador do jogador. @example 34 */
  player_id!: number;

  /** Nome do jogador no momento da partida. @example "Otto Rangel" */
  player_name!: string;

  /** Posição no momento da partida. @example "ATA" */
  position!: string;

  /** Condição no momento da partida. @example "APTO" */
  condition!: string;

  /** Atributo usado no duelo. @example "shooting" */
  attribute!: string;

  /** Valor usado, já com o efeito da condição. @example 75 */
  value!: number;
}

export class DuelResponse {
  /** Número do duelo, de 1 a 6. @example 1 */
  order!: number;

  /** Clube que ataca no duelo. @example 1 */
  attacking_club_id!: number;

  attacker!: DuelParticipantResponse;

  defender!: DuelParticipantResponse;

  /** Verdadeiro quando o ataque é maior que a defesa. @example true */
  goal!: boolean;
}

export class MatchSideResponse {
  /** Clube do lado. @example 1 */
  club_id!: number;

  /** Nome do clube. @example "Águias FC" */
  club_name!: string;

  /** Formação do clube na partida. @example "2-1-1" */
  formation!: string;

  /** Gols marcados. @example 1 */
  goals!: number;
}

export class MatchSummaryResponse {
  /** Identificador da partida. @example 1 */
  id!: number;

  /** Data e hora da partida, no horário de Brasília. @example "2026-11-12T15:00:00-03:00" */
  played_at!: string;

  home!: MatchSideResponse;

  away!: MatchSideResponse;

  /** Vencedor, ou empate. @example "VISITANTE" */
  result!: 'MANDANTE' | 'VISITANTE' | 'EMPATE';
}

export class MatchResponse extends MatchSummaryResponse {
  /** Os 6 duelos, na ordem da regra. */
  duels!: DuelResponse[];
}

export type MatchRecord = Partida & {
  mandante: Clube;
  visitante: Clube;
};

function toResult(homeGoals: number, awayGoals: number) {
  if (homeGoals > awayGoals) return 'MANDANTE';
  if (homeGoals < awayGoals) return 'VISITANTE';
  return 'EMPATE';
}

export function toMatchSummary(match: MatchRecord): MatchSummaryResponse {
  return {
    id: match.id,
    played_at: formatBrasiliaDateTime(match.jogadaEm),
    home: {
      club_id: match.mandanteId,
      club_name: match.mandante.nome,
      formation: match.formacaoMandante,
      goals: match.golsMandante,
    },
    away: {
      club_id: match.visitanteId,
      club_name: match.visitante.nome,
      formation: match.formacaoVisitante,
      goals: match.golsVisitante,
    },
    result: toResult(match.golsMandante, match.golsVisitante),
  };
}

function toDuelResponse(duel: DueloPartida): DuelResponse {
  return {
    order: duel.ordem,
    attacking_club_id: duel.clubeAtacanteId,
    attacker: {
      player_id: duel.atacanteId,
      player_name: duel.nomeAtacante,
      position: duel.posicaoAtacante,
      condition: duel.condicaoAtacante,
      attribute: duel.atributoAtaque,
      value: duel.valorAtaque,
    },
    defender: {
      player_id: duel.defensorId,
      player_name: duel.nomeDefensor,
      position: duel.posicaoDefensor,
      condition: duel.condicaoDefensor,
      attribute: duel.atributoDefesa,
      value: duel.valorDefesa,
    },
    goal: duel.gol,
  };
}

export function toMatchResponse(
  match: MatchRecord & { duelos: DueloPartida[] },
): MatchResponse {
  return {
    ...toMatchSummary(match),
    duels: match.duelos.map(toDuelResponse),
  };
}
