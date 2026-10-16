import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateAndTime,
  formatMoney,
  formatSignedMoney,
  formatTime,
} from './format';

describe('formatMoney', () => {
  it('usa vírgula decimal e sempre 2 casas', () => {
    expect(formatMoney(300)).toBe('300,00');
    expect(formatMoney(10.5)).toBe('10,50');
    expect(formatMoney(1234.5)).toBe('1.234,50');
  });
});

describe('formatSignedMoney', () => {
  it('mostra + e − (sinal de menos de verdade), e o zero sem sinal', () => {
    expect(formatSignedMoney(7.8)).toBe('+7,80');
    expect(formatSignedMoney(-4.8)).toBe('−4,80');
    expect(formatSignedMoney(0)).toBe('0,00');
  });
});

describe('datas da API', () => {
  const value = '2027-04-04T15:45:00-03:00';

  it('lê o horário de Brasília do texto, sem converter fuso', () => {
    expect(formatDate(value)).toBe('04/04/2027');
    expect(formatTime(value)).toBe('15:45');
    expect(formatDateAndTime(value)).toBe('04/04/2027, 15:45');
  });

  it('devolve o texto original quando não reconhece o formato', () => {
    expect(formatDate('ontem')).toBe('ontem');
  });
});
