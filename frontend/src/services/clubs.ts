import { api } from './api';
import { cleanParams } from './params';
import type { Club, ClubDetail, ClubSort, CreateClubInput } from './types';

export async function listClubs(sort?: ClubSort): Promise<Club[]> {
  const { data } = await api.get<Club[]>('/clubs', {
    params: cleanParams({ sort }),
  });
  return data;
}

export async function getClub(id: number): Promise<ClubDetail> {
  const { data } = await api.get<ClubDetail>(`/clubs/${id}`);
  return data;
}

export async function createClub(input: CreateClubInput): Promise<Club> {
  const { data } = await api.post<Club>('/clubs', input);
  return data;
}
