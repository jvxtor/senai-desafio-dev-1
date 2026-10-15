import { formatBrasiliaDateTime } from '../common/dates.js';
import type { Transacao } from '../generated/prisma/client.js';

export class TransactionResponse {
  /** Identificador da transação. @example 10 */
  id!: number;

  /** Clube da operação. @example 1 */
  club_id!: number;

  /** Jogador da operação. @example 2 */
  player_id!: number;

  /** Nome do jogador no momento da operação. @example "Meia Lua" */
  player_name!: string;

  /** Tipo da transação. @example "COMPRA" */
  type!: 'COMPRA' | 'VENDA';

  /** Valor de mercado no momento da operação. @example 37 */
  value!: number;

  /** Taxa de compra ou comissão de venda. @example 1.85 */
  fee!: number;

  /** Multa por fidelidade, 0 na compra. @example 0 */
  penalty!: number;

  /** Lucro da venda, nulo na compra. @example null */
  profit!: number | null;

  /** Variação do caixa, com sinal. @example -38.85 */
  cash_change!: number;

  /** Data e hora da operação, no horário de Brasília. @example "2026-11-02T10:15:00-03:00" */
  created_at!: string;
}

export class TransactionSummaryResponse {
  /** Soma de valor e taxa das compras. @example 38.85 */
  total_spent!: number;

  /** Soma da variação do caixa das vendas. @example 35.7 */
  total_received!: number;

  /** Soma das taxas e comissões. @example 2.15 */
  total_fees!: number;

  /** Soma das multas das vendas. @example 4 */
  total_penalties!: number;

  /** Soma do lucro das vendas, com sinal. @example 3 */
  total_profit!: number;
}

export class TransactionsPageResponse {
  /** Transações da mais recente para a mais antiga. */
  data!: TransactionResponse[];

  /** Totais das transações filtradas. */
  summary!: TransactionSummaryResponse;
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
