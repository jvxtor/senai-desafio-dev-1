import type {
  ClubSort,
  PlayersFilters,
  TransactionsFilters,
} from '../services/types';

// Chaves em árvore: invalidar um prefixo invalida tudo que está abaixo dele.
// Ex.: ['clubs'] invalida a lista, o detalhe, o histórico e a escalação dos clubes.
export const queryKeys = {
  players: {
    all: ['players'] as const,
    list: (filters: PlayersFilters) => ['players', 'list', filters] as const,
    detail: (id: number) => ['players', 'detail', id] as const,
  },
  clubs: {
    all: ['clubs'] as const,
    list: (sort?: ClubSort) => ['clubs', 'list', sort ?? 'name'] as const,
    detail: (id: number) => ['clubs', 'detail', id] as const,
    transactions: (id: number, filters: TransactionsFilters) =>
      ['clubs', 'detail', id, 'transactions', filters] as const,
    lineup: (id: number) => ['clubs', 'detail', id, 'lineup'] as const,
  },
  matches: {
    all: ['matches'] as const,
    list: (clubId?: number) => ['matches', 'list', clubId ?? null] as const,
    detail: (id: number) => ['matches', 'detail', id] as const,
  },
  standings: ['standings'] as const,
};
