import { formatBrasiliaDateTime } from '../common/dates.js';
import type { Transacao } from '../generated/prisma/client.js';

const HEADER =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';
const NEEDS_QUOTES = /[;"]/;

function formatMoney(value: { toFixed(places: number): string }): string {
  return value.toFixed(2).replace('.', ',');
}

function formatText(value: string): string {
  return NEEDS_QUOTES.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function toRow(transaction: Transacao): string {
  return [
    formatBrasiliaDateTime(transaction.criadoEm),
    transaction.tipo,
    formatText(transaction.nomeJogador),
    formatMoney(transaction.valor),
    formatMoney(transaction.taxa),
    formatMoney(transaction.multa),
    transaction.lucro ? formatMoney(transaction.lucro) : '',
    formatMoney(transaction.variacaoCaixa),
  ].join(';');
}

export function toTransactionsCsv(transactions: Transacao[]): string {
  return [HEADER, ...transactions.map(toRow)]
    .map((line) => `${line}\n`)
    .join('');
}
