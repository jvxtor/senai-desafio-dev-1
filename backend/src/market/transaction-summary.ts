import { Decimal } from 'decimal.js';
import { roundMoney } from '../common/money.js';
import type { Transacao } from '../generated/prisma/client.js';
import type { TransactionSummaryResponse } from './transaction-response.js';

type SummarySource = Pick<
  Transacao,
  'tipo' | 'valor' | 'taxa' | 'multa' | 'lucro' | 'variacaoCaixa'
>;

function sum(values: Decimal[]): number {
  return roundMoney(
    values.reduce((total, value) => total.plus(value), new Decimal(0)),
  ).toNumber();
}

export function calculateSummary(
  transactions: SummarySource[],
): TransactionSummaryResponse {
  const purchases = transactions.filter((item) => item.tipo === 'COMPRA');
  const sales = transactions.filter((item) => item.tipo === 'VENDA');

  return {
    total_spent: sum(purchases.map((item) => item.valor.plus(item.taxa))),
    total_received: sum(sales.map((item) => item.variacaoCaixa)),
    total_fees: sum(transactions.map((item) => item.taxa)),
    total_penalties: sum(sales.map((item) => item.multa)),
    total_profit: sum(sales.map((item) => item.lucro ?? new Decimal(0))),
  };
}
