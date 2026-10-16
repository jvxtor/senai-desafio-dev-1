import { describe, expect, it } from 'vitest';
import type { Club } from '../../services/types';
import { suggestAcronym } from './acronym';
import { toAcronymInput, validateClubForm } from './validation';

const club = (id: number, name: string, acronym: string): Club => ({
  id,
  name,
  acronym,
  cash: 300,
  squad_value: 0,
  net_worth: 300,
});

describe('validateClubForm', () => {
  it('aceita nome e sigla válidos', () => {
    expect(validateClubForm({ name: 'Águias FC', acronym: 'AGU' }).isValid).toBe(true);
  });

  it('exige de 2 a 5 palavras e só letras, espaços, hífen e ponto', () => {
    expect(validateClubForm({ name: 'Águias', acronym: 'AGU' }).errors.name).toBeDefined();
    expect(validateClubForm({ name: 'Águias 2000', acronym: 'AGU' }).errors.name).toBeDefined();
    expect(validateClubForm({ name: '', acronym: 'AGU' }).errors.name).toBe(
      'Informe o nome do clube.',
    );
  });

  it('exige sigla com 3 letras do nome, na ordem e começando pela primeira', () => {
    expect(validateClubForm({ name: 'Águias FC', acronym: 'ABC' }).errors.acronym).toBeDefined();
    expect(validateClubForm({ name: 'Águias FC', acronym: 'GAU' }).errors.acronym).toBeDefined();
    expect(validateClubForm({ name: 'Águias FC', acronym: 'AAA' }).errors.acronym).toBeDefined();
    expect(validateClubForm({ name: 'Águias FC', acronym: 'AFC' }).isValid).toBe(true);
  });

  it('o nome repetido ignora maiúsculas mas não acentos, como a API', () => {
    const existing = [club(1, 'Águias FC', 'AGU')];

    expect(
      validateClubForm({ name: '  águias   fc ', acronym: 'AGF' }, existing).conflict?.fields,
    ).toEqual(['name']);
    expect(
      validateClubForm({ name: 'Aguias FC', acronym: 'AGF' }, existing).conflict,
    ).toBeUndefined();
  });

  it('avisa de sigla repetida', () => {
    const existing = [club(1, 'Águias FC', 'AGU')];

    expect(
      validateClubForm({ name: 'Aguias SC', acronym: 'AGU' }, existing).conflict?.fields,
    ).toEqual(['acronym']);
  });
});

describe('toAcronymInput', () => {
  it('deixa só letras de A a Z, maiúsculas e sem acento, até 3', () => {
    expect(toAcronymInput('águ1ias')).toBe('AGU');
  });
});

describe('suggestAcronym', () => {
  it('sugere as 3 primeiras letras e pula as siglas já usadas', () => {
    expect(suggestAcronym('Leões do Sul', [])).toBe('LEO');
    expect(suggestAcronym('Águias FC', ['AGU'])).toBe('AGF');
  });

  it('sempre devolve uma sigla que a validação aceita', () => {
    for (const name of ['São Paulo FC', 'Mangue Atlético Clube', 'Santa-Cruz EC']) {
      const acronym = suggestAcronym(name, ['SAN']);
      expect(validateClubForm({ name, acronym }).errors.acronym).toBeUndefined();
    }
  });

  it('devolve vazio para nome curto demais', () => {
    expect(suggestAcronym('A B', [])).toBe('');
  });
});
