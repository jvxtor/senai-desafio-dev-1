import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  buyPlayer,
  exportTransactions,
  listTransactions,
  sellPlayer,
} from '../services/market';
import type { BuyPlayerInput, TransactionsFilters } from '../services/types';
import { invalidateMarketData } from './invalidation';
import { queryKeys } from './queryKeys';

export function useTransactions(
  clubId: number,
  filters: TransactionsFilters = {},
) {
  return useQuery({
    queryKey: queryKeys.clubs.transactions(clubId, filters),
    queryFn: () => listTransactions(clubId, filters),
  });
}

export function useBuyPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { playerId: number; input: BuyPlayerInput }) =>
      buyPlayer(variables.playerId, variables.input),
    onSuccess: () => invalidateMarketData(queryClient),
  });
}

export function useSellPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: number) => sellPlayer(playerId),
    onSuccess: () => invalidateMarketData(queryClient),
  });
}

// O CSV não é guardado em cache: cada clique pede o arquivo de novo, com os filtros da tela.
export function useExportTransactions() {
  return useMutation({
    mutationFn: (variables: {
      clubId: number;
      filters?: TransactionsFilters;
    }) => exportTransactions(variables.clubId, variables.filters),
  });
}
