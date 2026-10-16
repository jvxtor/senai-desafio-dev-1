import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLineup, setLineup } from '../services/lineup';
import type { SetLineupInput } from '../services/types';
import { queryKeys } from './queryKeys';

/** Sem clube (null), nada é consultado: jogador livre não tem escalação. */
export function useLineup(clubId: number | null) {
  return useQuery({
    queryKey: queryKeys.clubs.lineup(clubId ?? 0),
    queryFn: clubId === null ? skipToken : () => getLineup(clubId),
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
