import { api } from './api';
import type { Lineup, SetLineupInput } from './types';

export async function getLineup(clubId: number): Promise<Lineup> {
  const { data } = await api.get<Lineup>(`/clubs/${clubId}/lineup`);
  return data;
}

export async function setLineup(clubId: number, input: SetLineupInput): Promise<Lineup> {
  const { data } = await api.put<Lineup>(`/clubs/${clubId}/lineup`, input);
  return data;
}
