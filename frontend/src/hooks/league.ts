import { useClubs } from './clubs';
import { useMatches, useStandings } from './matches';
import { usePlayers } from './players';

// Pede só uma linha por consulta: o que interessa é o total que vem no meta.
const COUNT_ONLY = { limit: 1 };
const FREE_COUNT_ONLY = { limit: 1, free: true };

/** Números da página inicial. Cada um fica indefinido enquanto carrega ou se a API falhar. */
export function useLeagueOverview() {
  const players = usePlayers(COUNT_ONLY);
  const freePlayers = usePlayers(FREE_COUNT_ONLY);
  const clubs = useClubs();
  const matches = useMatches();
  const standings = useStandings();

  const first = standings.data?.[0];
  // Sem partidas jogadas não existe líder: todos os clubes estão zerados.
  const leader = first && first.played > 0 ? first : undefined;

  return {
    totalPlayers: players.data?.meta.total_items,
    freePlayers: freePlayers.data?.meta.total_items,
    totalClubs: clubs.data?.length,
    totalMatches: matches.data?.length,
    leader: leader && { name: leader.club_name, points: leader.points },
  };
}
