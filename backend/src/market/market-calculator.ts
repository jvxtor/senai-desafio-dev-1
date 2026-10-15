import { Decimal } from 'decimal.js';
import { roundMoney } from '../common/money.js';

export const MAX_SQUAD_SIZE = 12;

const FEE_RATE = new Decimal('0.05');
const FEE_THRESHOLD = new Decimal(30);

export function calculatePurchaseFee(marketValue: Decimal.Value): Decimal {
  const value = new Decimal(marketValue);
  return value.greaterThan(FEE_THRESHOLD)
    ? roundMoney(value.times(FEE_RATE))
    : new Decimal(0);
}

export function isWithinCashLimit(
  totalCost: Decimal.Value,
  cash: Decimal.Value,
): boolean {
  return new Decimal(totalCost).times(2).lessThanOrEqualTo(cash);
}
