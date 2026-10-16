import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLineup, setLineup } from '../services/lineup';
import type { SetLineupInput } from '../services/types';
import { queryKeys } from './queryKeys';

export function useLineup(clubId: number) {
  return useQuery({
    queryKey: queryKeys.clubs.lineup(clubId),
    queryFn: () => getLineup(clubId),
  });
}

export function useSetLineup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { clubId: number; input: SetLineupInput }) =>
      setLineup(variables.clubId, variables.input),
    onSuccess: (_lineup, variables) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.clubs.lineup(variables.clubId),
      }),
  });
}
