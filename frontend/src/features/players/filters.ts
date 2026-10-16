import type {
  Condition,
  PlayerSort,
  PlayersFilters,
  Position,
} from '../../services/types';

export const PAGE_SIZE = 10;

/** "Livres" e "Em clubes" são os dois lados do filtro `free` da API. */
export type Scope = 'all' | 'free' | 'club';

/** O que está nos campos da tela, sempre como texto, antes de qualquer validação. */
export interface FilterDraft {
  position: Position | '';
  condition: Condition | '';
  clubId: string;
  scope: Scope;
  minAge: string;
  maxAge: string;
  minValue: string;
  maxValue: string;
  sort: PlayerSort;
}

export const EMPTY_DRAFT: FilterDraft = {
  position: '',
  condition: '',
  clubId: '',
  scope: 'all',
  minAge: '',
  maxAge: '',
  minValue: '',
  maxValue: '',
  sort: 'name',
};

export interface FilterErrors {
  age?: string;
  value?: string;
}

interface Built {
  filters: PlayersFilters;
  errors: FilterErrors;
}

const MIN_SEARCH_LENGTH = 2;
const AGE_RANGE = { min: 16, max: 45 };
const VALUE_RANGE = { min: 0, max: 550 };
const INTEGER = /^\d+$/;
const DECIMAL = /^\d+(\.\d{1,2})?$/;

interface Range {
  min?: number;
  max?: number;
  error?: string;
}

function parseRange(
  rawMin: string,
  rawMax: string,
  parse: (raw: string) => number | undefined,
  limits: { min: number; max: number },
  message: string,
): Range {
  const min = rawMin.trim() === '' ? undefined : parse(rawMin.trim());
  const max = rawMax.trim() === '' ? undefined : parse(rawMax.trim());
  const minIsInvalid = rawMin.trim() !== '' && min === undefined;
  const maxIsInvalid = rawMax.trim() !== '' && max === undefined;
  const outside = (n?: number) =>
    n !== undefined && (n < limits.min || n > limits.max);

  if (minIsInvalid || maxIsInvalid || outside(min) || outside(max)) {
    return { error: message };
  }
  if (min !== undefined && max !== undefined && min > max) {
    return { error: 'O mínimo não pode passar do máximo.' };
  }
  return { min, max };
}

const parseInteger = (raw: string) => (INTEGER.test(raw) ? Number(raw) : undefined);

// Aceita a vírgula do teclado brasileiro; a API só aceita ponto.
const parseDecimal = (raw: string) => {
  const normalized = raw.replace(',', '.');
  return DECIMAL.test(normalized) ? Number(normalized) : undefined;
};

/**
 * Converte os campos da tela nos parâmetros da API.
 * A API recusa (400) busca de 1 letra, faixas contraditórias e `free=true` com `club_id`,
 * então esses casos nunca saem da tela: o campo errado mostra a mensagem e não é enviado.
 */
export function buildPlayersFilters(
  draft: FilterDraft,
  search: string,
  page: number,
): Built {
  const errors: FilterErrors = {};
  const text = search.trim();

  const age = parseRange(
    draft.minAge,
    draft.maxAge,
    parseInteger,
    AGE_RANGE,
    'A idade vai de 16 a 45 anos.',
  );
  const value = parseRange(
    draft.minValue,
    draft.maxValue,
    parseDecimal,
    VALUE_RANGE,
    'O valor vai de 0 a 550, com até 2 casas decimais.',
  );
  errors.age = age.error;
  errors.value = value.error;

  const isFree = draft.scope === 'free';

  const filters: PlayersFilters = {
    search: text.length >= MIN_SEARCH_LENGTH ? text : undefined,
    position: draft.position || undefined,
    condition: draft.condition || undefined,
    free: isFree ? true : draft.scope === 'club' ? false : undefined,
    club_id: !isFree && draft.clubId ? Number(draft.clubId) : undefined,
    min_age: age.min,
    max_age: age.max,
    min_value: value.min,
    max_value: value.max,
    sort: draft.sort,
    page,
    limit: PAGE_SIZE,
  };

  return { filters, errors };
}

const FILTER_KEYS = [
  'position',
  'condition',
  'clubId',
  'scope',
  'minAge',
  'maxAge',
  'minValue',
  'maxValue',
] as const;

/** Zera os campos do painel de filtros, sem mexer na busca, nas abas nem na ordenação. */
export const PANEL_FILTERS_RESET: Partial<FilterDraft> = {
  position: '',
  condition: '',
  clubId: '',
  minAge: '',
  maxAge: '',
  minValue: '',
  maxValue: '',
};

const BAR_FILTER_KEYS = [
  'position',
  'condition',
  'clubId',
  'minAge',
  'maxAge',
  'minValue',
  'maxValue',
] as const;

/** Algum filtro da barra (busca, posição, condição, clube, idade ou valor) está em uso? */
export function hasBarFilters(draft: FilterDraft, search: string): boolean {
  return search.trim() !== '' || BAR_FILTER_KEYS.some((key) => draft[key] !== EMPTY_DRAFT[key]);
}

/** Há algum filtro além da ordenação? Define a mensagem de lista vazia. */
export function hasActiveFilters(draft: FilterDraft, search: string): boolean {
  return (
    search.trim() !== '' ||
    FILTER_KEYS.some((key) => draft[key] !== EMPTY_DRAFT[key])
  );
}
