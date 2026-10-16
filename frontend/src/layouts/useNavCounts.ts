import { useClubs } from '../hooks/clubs';
import { useMatches } from '../hooks/matches';
import { usePlayers } from '../hooks/players';

export interface NavCounts {
  players?: number;
  clubs?: number;
  matches?: number;
}

// Os números ao lado de cada item do menu. Enquanto carregam (ou se falharem), ficam de fora.
export function useNavCounts(): NavCounts {
  // Uma página de um jogador basta: o total já vem junto.
  const players = usePlayers({ page: 1, limit: 1 });
  const clubs = useClubs();
  const matches = useMatches();

  return {
    players: players.data?.meta.total_items,
    clubs: clubs.data?.length,
    matches: matches.data?.length,
  };
}
