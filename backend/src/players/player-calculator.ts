import { Decimal } from 'decimal.js';
import { roundMoney } from '../common/money.js';
import type { Attributes, Condition, Position } from './player.constants.js';

const OVERALL_WEIGHTS: Record<Position, Attributes> = {
  GOL: {
    pace: 10,
    shooting: 0,
    passing: 20,
    dribbling: 0,
    defending: 40,
    physical: 30,
  },
  ZAG: {
    pace: 10,
    shooting: 0,
    passing: 15,
    dribbling: 0,
    defending: 45,
    physical: 30,
  },
  LAT: {
    pace: 25,
    shooting: 0,
    passing: 20,
    dribbling: 15,
    defending: 25,
    physical: 15,
  },
  MEI: {
    pace: 10,
    shooting: 15,
    passing: 35,
    dribbling: 25,
    defending: 5,
    physical: 10,
  },
  ATA: {
    pace: 20,
    shooting: 40,
    passing: 10,
    dribbling: 20,
    defending: 0,
    physical: 10,
  },
};

const CONDITION_DISCOUNT: Record<Condition, number> = {
  APTO: 0,
  MAL_CONDICIONADO: 15,
  DOENTE: 30,
};

const MIN_VALUE = new Decimal(1);
const MAX_DISCOUNT_PERCENT = 40;
const YOUNG_PROMISE_MAX_AGE = 21;

export function calculateOverall(
  position: Position,
  attributes: Attributes,
): number {
  const weights = OVERALL_WEIGHTS[position];
  const weightedSum = (Object.keys(weights) as (keyof Attributes)[]).reduce(
    (sum, key) => sum + attributes[key] * weights[key],
    0,
  );
  return Math.floor((weightedSum + 50) / 100);
}

function pointsInRange(overall: number, from: number, to: number): number {
  return Math.max(0, Math.min(overall, to) - from);
}

export function calculateBaseValue(
  overall: number,
  potential: number,
  age: number,
): Decimal {
  let value = new Decimal(0)
    .plus(new Decimal(pointsInRange(overall, 40, 60)).times('0.5'))
    .plus(new Decimal(pointsInRange(overall, 60, 75)).times(2))
    .plus(new Decimal(pointsInRange(overall, 75, 99)).times(6));

  if (age <= YOUNG_PROMISE_MAX_AGE) {
    value = value.times(100 + potential - overall).dividedBy(100);
  }

  const rounded = roundMoney(value);
  return rounded.lessThan(MIN_VALUE) ? MIN_VALUE : rounded;
}

function conditionDiscountPercent(
  condition: Condition,
  agility: number,
): number {
  const base = CONDITION_DISCOUNT[condition];
  if (condition === 'APTO') return base;
  if (agility >= 80) return base / 2;
  if (agility <= 30) return base + 10;
  return base;
}

function agePercent(age: number): number {
  if (age <= 21) return 10;
  if (age >= 32) return -10;
  return 0;
}

export function calculateMarketValue(
  baseValue: Decimal.Value,
  condition: Condition,
  agility: number,
  age: number,
): Decimal {
  const totalPercent = Math.max(
    agePercent(age) - conditionDiscountPercent(condition, agility),
    -MAX_DISCOUNT_PERCENT,
  );
  const value = roundMoney(
    new Decimal(baseValue).times(100 + totalPercent).dividedBy(100),
  );
  return value.lessThan(MIN_VALUE) ? MIN_VALUE : value;
}
