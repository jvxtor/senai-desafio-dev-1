import { Decimal } from 'decimal.js';
import { roundMoney } from '../common/money.js';

export const MAX_SQUAD_SIZE = 12;
export const MILLISECONDS_PER_DAY = 86_400_000;

const FEE_RATE = new Decimal('0.05');
const FEE_THRESHOLD = new Decimal(30);

const MAX_PENALTY = new Decimal(10);
const COMMISSION_BRACKET_LIMIT = new Decimal(10);
const LOW_COMMISSION_RATE = new Decimal('0.10');
const HIGH_COMMISSION_RATE = new Decimal('0.20');

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

export function calculateRemainingDays(loyaltyUntil: Date, now: Date): number {
  const remaining = loyaltyUntil.getTime() - now.getTime();
  return remaining > 0 ? Math.ceil(remaining / MILLISECONDS_PER_DAY) : 0;
}

export function calculatePenaltyRate(remainingDays: number): number {
  if (remainingDays <= 0) return 0;
  if (remainingDays <= 30) return 5;
  if (remainingDays <= 180) return 10;
  return 20;
}

export function calculatePenalty(
  marketValue: Decimal.Value,
  penaltyRate: number,
): Decimal {
  const penalty = roundMoney(
    new Decimal(marketValue).times(penaltyRate).div(100),
  );
  return Decimal.min(penalty, MAX_PENALTY);
}

export function calculateCommission(profit: Decimal.Value): Decimal {
  const gain = new Decimal(profit);
  if (gain.lessThanOrEqualTo(0)) return new Decimal(0);

  const lowBracket = Decimal.min(gain, COMMISSION_BRACKET_LIMIT);
  const highBracket = gain.minus(lowBracket);

  return roundMoney(
    lowBracket
      .times(LOW_COMMISSION_RATE)
      .plus(highBracket.times(HIGH_COMMISSION_RATE)),
  );
}
