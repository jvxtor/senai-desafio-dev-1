import { describe, expect, it } from 'vitest';
import { formatBrasiliaDateTime, parseBrasiliaDateTime } from './dates.js';

describe('datas de Brasília', () => {
  it('aceita o formato válido', () => {
    const date = parseBrasiliaDateTime('2027-03-02T10:15-03:00');
    expect(date?.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it('recusa data inexistente e formato errado', () => {
    expect(parseBrasiliaDateTime('2027-02-30T10:15-03:00')).toBeNull();
    expect(parseBrasiliaDateTime('2027-03-02T24:00-03:00')).toBeNull();
    expect(parseBrasiliaDateTime('2027-03-02T10:15')).toBeNull();
    expect(parseBrasiliaDateTime('2027-03-02T10:15:00-03:00')).toBeNull();
  });

  it('formata a saída com segundos e -03:00', () => {
    const date = new Date('2027-03-02T13:15:00.000Z');
    expect(formatBrasiliaDateTime(date)).toBe('2027-03-02T10:15:00-03:00');
  });
});
