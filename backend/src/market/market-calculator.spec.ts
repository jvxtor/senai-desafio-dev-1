import { describe, expect, it } from 'vitest';
import {
  calculatePurchaseFee,
  isWithinCashLimit,
} from './market-calculator.js';

describe('calculatePurchaseFee (RN13)', () => {
  it.each([
    ['28.00', '0'],
    ['30.00', '0'],
    ['30.01', '1.5'],
    ['47.62', '2.38'],
    ['48.00', '2.4'],
    ['37.00', '1.85'],
  ])('valor de mercado %s => taxa %s', (value, expected) => {
    expect(calculatePurchaseFee(value).toString()).toBe(expected);
  });
});

describe('isWithinCashLimit (RN13)', () => {
  it.each([
    ['28.00', '300.00', true],
    ['30.01', '300.00', true],
    ['50.00', '100.00', true],
    ['50.40', '100.00', false],
    ['130.57', '261.15', true],
    ['130.58', '261.15', false],
  ])('custo %s com caixa %s => %s', (cost, cash, expected) => {
    expect(isWithinCashLimit(cost, cash)).toBe(expected);
  });
});
