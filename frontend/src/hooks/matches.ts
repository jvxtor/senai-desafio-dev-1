import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMatch, listMatches, listStandings, playMatch } from '../services/matches';
import type { PlayMatchInput } from '../services/types';
import { invalidateMatchData } from './invalidation';
import { queryKeys } from './queryKeys';

export function useMatches(clubId?: number) {
  return useQuery({
    queryKey: queryKeys.matches.list(clubId),
    queryFn: () => listMatches(clubId),
  });
}

export function useMatch(id: number) {
  return useQuery({
    queryKey: queryKeys.matches.detail(id),
    queryFn: () => getMatch(id),
  });
}

export function useStandings() {
  return useQuery({
    queryKey: queryKeys.standings,
    queryFn: listStandings,
  });
}

export function usePlayMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlayMatchInput) => playMatch(input),
    onSuccess: () => invalidateMatchData(queryClient),
  });
}
