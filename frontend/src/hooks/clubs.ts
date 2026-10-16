import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClub, getClub, listClubs } from '../services/clubs';
import type { ClubSort, CreateClubInput } from '../services/types';
import { invalidateLeagueTable } from './invalidation';
import { queryKeys } from './queryKeys';

export function useClubs(sort?: ClubSort) {
  return useQuery({
    queryKey: queryKeys.clubs.list(sort),
    queryFn: () => listClubs(sort),
    // Ao trocar a ordenação, a lista anterior fica na tela até a nova chegar.
    placeholderData: keepPreviousData,
  });
}

export function useClub(id: number) {
  return useQuery({
    queryKey: queryKeys.clubs.detail(id),
    queryFn: () => getClub(id),
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClubInput) => createClub(input),
    onSuccess: () => invalidateLeagueTable(queryClient),
  });
}
