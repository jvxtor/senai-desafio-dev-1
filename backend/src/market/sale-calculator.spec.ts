import { describe, expect, it } from 'vitest';
import {
  calculateCommission,
  calculatePenalty,
  calculatePenaltyRate,
  calculateRemainingDays,
} from './market-calculator.js';

const NOW = new Date('2026-11-05T19:40:00.000Z');
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('calculateRemainingDays (RN15)', () => {
  it.each([
    ['fim já passado', -DAY, 0],
    ['no próprio momento', 0, 0],
    ['10 dias e 2 horas', 10 * DAY + 2 * HOUR, 11],
    ['exatamente 30 dias', 30 * DAY, 30],
    ['30 dias e 1 minuto', 30 * DAY + MINUTE, 31],
    ['exatamente 180 dias', 180 * DAY, 180],
    ['180 dias e 1 minuto', 180 * DAY + MINUTE, 181],
    ['200 dias', 200 * DAY, 200],
    [
      '116 dias, 17 horas e 35 minutos',
      116 * DAY + 17 * HOUR + 35 * MINUTE,
      117,
    ],
  ])('%s => %i dias', (_label, offset, expected) => {
    const loyaltyUntil = new Date(NOW.getTime() + offset);
    expect(calculateRemainingDays(loyaltyUntil, NOW)).toBe(expected);
  });
});

describe('calculatePenaltyRate (RN15)', () => {
  it.each([
    [0, 0],
    [1, 5],
    [30, 5],
    [31, 10],
    [180, 10],
    [181, 20],
    [1095, 20],
  ])('%i dias => %i%%', (days, expected) => {
    expect(calculatePenaltyRate(days)).toBe(expected);
  });
});

describe('calculatePenalty (RN15)', () => {
  it.each([
    ['40.00', 10, '4'],
    ['42.50', 20, '8.5'],
    ['30.00', 5, '1.5'],
    ['25.00', 0, '0'],
    ['75.00', 20, '10'],
    ['50.00', 20, '10'],
    ['40.00', 20, '8'],
  ])('valor %s com %i%% => multa %s', (value, rate, expected) => {
    expect(calculatePenalty(value, rate).toString()).toBe(expected);
  });
});

describe('calculateCommission (RN16)', () => {
  it.each([
    ['3.00', '0.3'],
    ['3.85', '0.39'],
    ['10.00', '1'],
    ['10.01', '1'],
    ['15.00', '2'],
    ['0', '0'],
    ['-7.50', '0'],
  ])('lucro %s => comissão %s', (profit, expected) => {
    expect(calculateCommission(profit).toString()).toBe(expected);
  });
});
