import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

// Compra, venda e mudança de condição alteram o jogador e também o caixa,
// o elenco, o histórico e a escalação do clube.
export function invalidateMarketData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all }),
  ]);
}

// Um clube novo entra na lista de clubes e na classificação (zerado).
export function invalidateLeagueTable(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.standings }),
  ]);
}

// Uma partida entra no histórico e muda a classificação.
export function invalidateMatchData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.matches.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.standings }),
  ]);
}
