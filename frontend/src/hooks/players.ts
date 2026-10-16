import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  changePlayerCondition,
  createPlayer,
  deletePlayer,
  getPlayer,
  listPlayers,
  updatePlayer,
} from '../services/players';
import type {
  Condition,
  Position,
  CreatePlayerInput,
  PlayersFilters,
  UpdatePlayerInput,
} from '../services/types';
import { invalidateMarketData } from './invalidation';
import { queryKeys } from './queryKeys';

export function usePlayers(filters: PlayersFilters) {
  return useQuery({
    queryKey: queryKeys.players.list(filters),
    queryFn: () => listPlayers(filters),
    // Mantém a página anterior na tela enquanto a próxima carrega.
    placeholderData: keepPreviousData,
  });
}

export function usePlayer(id: number) {
  return useQuery({
    queryKey: queryKeys.players.detail(id),
    queryFn: () => getPlayer(id),
  });
}

/**
 * A posição de hoje de vários jogadores, pelo cadastro de cada um (as mesmas consultas do
 * detalhe, então ficam em cache). Jogador que não carregou ou foi excluído fica de fora.
 */
export function usePlayerPositions(ids: number[]): Map<number, Position> {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.players.detail(id),
      queryFn: () => getPlayer(id),
      retry: false,
    })),
    combine: (results) =>
      new Map(
        results.flatMap((result, index) =>
          result.data ? [[ids[index], result.data.position] as const] : [],
        ),
      ),
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlayerInput) => createPlayer(input),
    onSuccess: () => invalidateMarketData(queryClient),
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: number; input: UpdatePlayerInput }) =>
      updatePlayer(variables.id, variables.input),
    onSuccess: () => invalidateMarketData(queryClient),
  });
}

export function useChangePlayerCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: number; condition: Condition }) =>
      changePlayerCondition(variables.id, variables.condition),
    onSuccess: () => invalidateMarketData(queryClient),
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePlayer(id),
    onSuccess: () => invalidateMarketData(queryClient),
  });
}
