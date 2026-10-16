import { api } from './api';
import { cleanParams } from './params';
import type {
  BuyPlayerInput,
  PurchaseResult,
  SaleResult,
  TransactionsFilters,
  TransactionsResult,
} from './types';

function toTransactionParams(filters: TransactionsFilters) {
  return cleanParams({
    type: filters.type?.join(','),
    player_id: filters.player_id,
  });
}

export async function buyPlayer(playerId: number, input: BuyPlayerInput): Promise<PurchaseResult> {
  const { data } = await api.post<PurchaseResult>(`/players/${playerId}/buy`, input);
  return data;
}

export async function sellPlayer(playerId: number): Promise<SaleResult> {
  const { data } = await api.post<SaleResult>(`/players/${playerId}/sell`);
  return data;
}

export async function listTransactions(
  clubId: number,
  filters: TransactionsFilters = {},
): Promise<TransactionsResult> {
  const { data } = await api.get<TransactionsResult>(`/clubs/${clubId}/transactions`, {
    params: toTransactionParams(filters),
  });
  return data;
}

/** Devolve o arquivo CSV exatamente como a API o gerou, com os mesmos filtros. */
export async function exportTransactions(
  clubId: number,
  filters: TransactionsFilters = {},
): Promise<Blob> {
  const { data } = await api.get<Blob>(`/clubs/${clubId}/transactions/export`, {
    params: toTransactionParams(filters),
    responseType: 'blob',
  });
  return data;
}
