import { describe, expect, it } from 'vitest';
import { buildPlayersFilters, EMPTY_DRAFT } from './filters';

describe('buildPlayersFilters', () => {
  it('não envia busca com 1 letra', () => {
    expect(buildPlayersFilters(EMPTY_DRAFT, 'a', 1).filters.search).toBeUndefined();
    expect(buildPlayersFilters(EMPTY_DRAFT, 'jo', 1).filters.search).toBe('jo');
  });

  it('pede 10 por página e volta a página pedida', () => {
    const { filters } = buildPlayersFilters(EMPTY_DRAFT, '', 3);
    expect(filters.limit).toBe(10);
    expect(filters.page).toBe(3);
  });

  it('só livres vira free=true e não envia o clube junto', () => {
    const { filters } = buildPlayersFilters({ ...EMPTY_DRAFT, scope: 'free', clubId: '2' }, '', 1);
    expect(filters.free).toBe(true);
    expect(filters.club_id).toBeUndefined();
  });

  it('aceita vírgula no valor e envia número', () => {
    const { filters } = buildPlayersFilters({ ...EMPTY_DRAFT, minValue: '10,5' }, '', 1);
    expect(filters.min_value).toBe(10.5);
  });

  it('uma faixa contraditória dá erro e não é enviada', () => {
    const { filters, errors } = buildPlayersFilters(
      { ...EMPTY_DRAFT, minAge: '40', maxAge: '20' },
      '',
      1,
    );
    expect(errors.age).toBeDefined();
    expect(filters.min_age).toBeUndefined();
    expect(filters.max_age).toBeUndefined();
  });
});
