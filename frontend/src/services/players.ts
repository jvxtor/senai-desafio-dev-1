import { api } from './api';
import { cleanParams } from './params';
import type {
  Condition,
  CreatePlayerInput,
  Player,
  PlayersFilters,
  PlayersPage,
  UpdatePlayerInput,
} from './types';

export async function listPlayers(filters: PlayersFilters = {}): Promise<PlayersPage> {
  const { data } = await api.get<PlayersPage>('/players', {
    params: cleanParams({ ...filters }),
  });
  return data;
}

export async function getPlayer(id: number): Promise<Player> {
  const { data } = await api.get<Player>(`/players/${id}`);
  return data;
}

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const { data } = await api.post<Player>('/players', input);
  return data;
}

export async function updatePlayer(id: number, input: UpdatePlayerInput): Promise<Player> {
  const { data } = await api.put<Player>(`/players/${id}`, input);
  return data;
}

export async function changePlayerCondition(id: number, condition: Condition): Promise<Player> {
  const { data } = await api.patch<Player>(`/players/${id}/condition`, {
    condition,
  });
  return data;
}

export async function deletePlayer(id: number): Promise<void> {
  await api.delete(`/players/${id}`);
}
