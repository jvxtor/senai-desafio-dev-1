import { describe, expect, it } from 'vitest';
import { roundMoney } from './money.js';

describe('roundMoney', () => {
  it('arredonda o meio para longe do zero', () => {
    expect(roundMoney('14.775').toString()).toBe('14.78');
    expect(roundMoney('0.385').toString()).toBe('0.39');
    expect(roundMoney('-0.385').toString()).toBe('-0.39');
  });

  it('mantém valores já com 2 casas', () => {
    expect(roundMoney('40').toNumber()).toBe(40);
  });
});
