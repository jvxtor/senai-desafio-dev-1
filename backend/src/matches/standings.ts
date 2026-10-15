import { compareText, foldText } from '../common/text.js';
import type { StandingResponse } from './standing-response.js';

export interface StandingClub {
  id: number;
  nome: string;
}

export interface StandingMatch {
  mandanteId: number;
  visitanteId: number;
  golsMandante: number;
  golsVisitante: number;
}

const WIN_POINTS = 3;
const DRAW_POINTS = 1;

function emptyRow(club: StandingClub): StandingResponse {
  return {
    position: 0,
    club_id: club.id,
    club_name: club.nome,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
  };
}

function register(row: StandingResponse, scored: number, conceded: number) {
  row.played += 1;
  row.goals_for += scored;
  row.goals_against += conceded;
  row.goal_difference = row.goals_for - row.goals_against;

  if (scored > conceded) {
    row.wins += 1;
    row.points += WIN_POINTS;
  } else if (scored === conceded) {
    row.draws += 1;
    row.points += DRAW_POINTS;
  } else {
    row.losses += 1;
  }
}

function compareRows(a: StandingResponse, b: StandingResponse): number {
  return (
    b.points - a.points ||
    b.goal_difference - a.goal_difference ||
    b.goals_for - a.goals_for ||
    compareText(foldText(a.club_name), foldText(b.club_name)) ||
    a.club_id - b.club_id
  );
}

export function calculateStandings(
  clubs: StandingClub[],
  matches: StandingMatch[],
): StandingResponse[] {
  const rows = new Map(clubs.map((club) => [club.id, emptyRow(club)]));

  for (const match of matches) {
    const home = rows.get(match.mandanteId);
    const away = rows.get(match.visitanteId);
    if (home) register(home, match.golsMandante, match.golsVisitante);
    if (away) register(away, match.golsVisitante, match.golsMandante);
  }

  return [...rows.values()]
    .sort(compareRows)
    .map((row, index) => ({ ...row, position: index + 1 }));
}
