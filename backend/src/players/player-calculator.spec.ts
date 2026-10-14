import { describe, expect, it } from 'vitest';
import {
  calculateBaseValue,
  calculateMarketValue,
  calculateOverall,
} from './player-calculator.js';

describe('calculateMarketValue (RN02 a RN05)', () => {
  const cases: [
    string,
    'APTO' | 'MAL_CONDICIONADO' | 'DOENTE',
    number,
    number,
    string,
  ][] = [
    ['82.00', 'APTO', 20, 25, '82'],
    ['82.00', 'APTO', 50, 19, '90.2'],
    ['82.00', 'MAL_CONDICIONADO', 50, 25, '69.7'],
    ['82.00', 'MAL_CONDICIONADO', 80, 21, '84.05'],
    ['82.00', 'MAL_CONDICIONADO', 30, 33, '53.3'],
    ['82.00', 'DOENTE', 90, 25, '69.7'],
    ['82.00', 'DOENTE', 30, 25, '49.2'],
    ['82.00', 'DOENTE', 10, 40, '49.2'],
    ['9.50', 'MAL_CONDICIONADO', 85, 25, '8.79'],
    ['1.00', 'MAL_CONDICIONADO', 50, 35, '1'],
  ];

  it.each(cases)(
    'base %s, %s, agilidade %i, idade %i => %s',
    (base, condition, agility, age, expected) => {
      expect(
        calculateMarketValue(base, condition, agility, age).toString(),
      ).toBe(expected);
    },
  );
});

describe('calculateOverall (RN06)', () => {
  it('aplica os pesos da posição e arredonda meio para cima', () => {
    expect(
      calculateOverall('MEI', {
        pace: 68,
        shooting: 65,
        passing: 80,
        dribbling: 78,
        defending: 52,
        physical: 60,
      }),
    ).toBe(73);
    expect(
      calculateOverall('ATA', {
        pace: 78,
        shooting: 75,
        passing: 73,
        dribbling: 82,
        defending: 48,
        physical: 68,
      }),
    ).toBe(76);
    expect(
      calculateOverall('LAT', {
        pace: 72,
        shooting: 70,
        passing: 78,
        dribbling: 76,
        defending: 70,
        physical: 66,
      }),
    ).toBe(72);
    expect(
      calculateOverall('ZAG', {
        pace: 50,
        shooting: 90,
        passing: 60,
        dribbling: 40,
        defending: 80,
        physical: 75,
      }),
    ).toBe(73);
    expect(
      calculateOverall('GOL', {
        pace: 55,
        shooting: 30,
        passing: 65,
        dribbling: 40,
        defending: 72,
        physical: 68,
      }),
    ).toBe(68);
  });
});

describe('calculateBaseValue (RN06)', () => {
  const cases: [number, number, number, string][] = [
    [75, 86, 25, '40'],
    [60, 70, 30, '10'],
    [61, 70, 30, '12'],
    [76, 80, 22, '46'],
    [85, 92, 27, '100'],
    [70, 84, 21, '34.2'],
    [70, 84, 22, '30'],
    [45, 90, 18, '3.63'],
    [40, 66, 36, '1'],
  ];

  it.each(cases)(
    'overall %i, potencial %i, idade %i => %s',
    (overall, potential, age, expected) => {
      expect(calculateBaseValue(overall, potential, age).toString()).toBe(
        expected,
      );
    },
  );
});
