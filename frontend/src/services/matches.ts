import { api } from './api';
import { cleanParams } from './params';
import type { Match, MatchSummary, PlayMatchInput, Standing } from './types';

export async function listMatches(clubId?: number): Promise<MatchSummary[]> {
  const { data } = await api.get<MatchSummary[]>('/matches', {
    params: cleanParams({ club_id: clubId }),
  });
  return data;
}

export async function getMatch(id: number): Promise<Match> {
  const { data } = await api.get<Match>(`/matches/${id}`);
  return data;
}

export async function playMatch(input: PlayMatchInput): Promise<Match> {
  const { data } = await api.post<Match>('/matches', input);
  return data;
}

export async function listStandings(): Promise<Standing[]> {
  const { data } = await api.get<Standing[]>('/standings');
  return data;
}
