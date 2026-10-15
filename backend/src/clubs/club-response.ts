import type { Decimal } from 'decimal.js';
import { formatBrasiliaDateTime } from '../common/dates.js';
import { roundMoney } from '../common/money.js';
import type { Clube, Contrato, Jogador } from '../generated/prisma/client.js';
import {
  calculatePenaltyRate,
  calculateRemainingDays,
} from '../market/market-calculator.js';
import {
  PlayerResponse,
  toPlayerResponse,
} from '../players/player-response.js';

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

export class SquadContractResponse {
  /** Valor de mercado pago na compra, sem a taxa. @example 37 */
  purchase_value!: number;

  /** Fim da fidelidade, no horário de Brasília. @example "2027-03-02T10:15:00-03:00" */
  loyalty_until!: string;

  /** Dias restantes de fidelidade, arredondados para cima. @example 120 */
  remaining_days!: number;

  /** Percentual da multa se o jogador fosse vendido agora. @example 10 */
  penalty_rate!: number;
}

export class SquadPlayerResponse extends PlayerResponse {
  contract!: SquadContractResponse;
}

export class ClubDetailResponse extends ClubResponse {
  /** Elenco ordenado por posição (GOL, ZAG, LAT, MEI, ATA), nome e id. */
  players!: SquadPlayerResponse[];
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

export function toSquadPlayerResponse(
  player: Jogador,
  contract: Contrato,
  now: Date,
): SquadPlayerResponse {
  const remainingDays = calculateRemainingDays(contract.fidelidadeAte, now);

  return {
    ...toPlayerResponse(player),
    contract: {
      purchase_value: contract.valorCompra.toNumber(),
      loyalty_until: formatBrasiliaDateTime(contract.fidelidadeAte),
      remaining_days: remainingDays,
      penalty_rate: calculatePenaltyRate(remainingDays),
    },
  };
}
