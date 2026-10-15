import type { Decimal } from 'decimal.js';
import { roundMoney } from '../common/money.js';
import type { Clube } from '../generated/prisma/client.js';

export class ClubResponse {
  /** Identificador do clube. @example 1 */
  id!: number;

  /** Nome do clube. @example "Águias FC" */
  name!: string;

  /** Sigla de 3 letras. @example "AGU" */
  acronym!: string;

  /** Caixa do clube, que só muda por compras e vendas. @example 300 */
  cash!: number;

  /** Soma dos valores de mercado dos jogadores do elenco. @example 0 */
  squad_value!: number;

  /** Patrimônio: caixa mais valor do elenco. @example 300 */
  net_worth!: number;
}

export function toClubResponse(club: Clube, squadValue: Decimal): ClubResponse {
  return {
    id: club.id,
    name: club.nome,
    acronym: club.sigla,
    cash: club.caixa.toNumber(),
    squad_value: squadValue.toNumber(),
    net_worth: roundMoney(club.caixa.plus(squadValue)).toNumber(),
  };
}
