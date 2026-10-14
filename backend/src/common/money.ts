import Decimal from 'decimal.js';

export function roundMoney(value: Decimal.Value): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function toMoneyNumber(value: Decimal.Value): number {
  return roundMoney(value).toNumber();
}
