import { formatBrasiliaDateTime } from '../common/dates.js';
import type { Transacao } from '../generated/prisma/client.js';

export interface TransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'COMPRA' | 'VENDA';
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export function toTransactionResponse(
  transaction: Transacao,
): TransactionResponse {
  return {
    id: transaction.id,
    club_id: transaction.clubeId,
    player_id: transaction.jogadorId,
    player_name: transaction.nomeJogador,
    type: transaction.tipo as 'COMPRA' | 'VENDA',
    value: transaction.valor.toNumber(),
    fee: transaction.taxa.toNumber(),
    penalty: transaction.multa.toNumber(),
    profit: transaction.lucro?.toNumber() ?? null,
    cash_change: transaction.variacaoCaixa.toNumber(),
    created_at: formatBrasiliaDateTime(transaction.criadoEm),
  };
}
