import type { Decimal } from 'decimal.js';
import { roundMoney } from '../common/money.js';
import type { Clube } from '../generated/prisma/client.js';

export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
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
