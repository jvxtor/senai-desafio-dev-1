import type { SelectOption } from '../../components/forms/fields';
import type { Condition, PlayerSort, Position } from '../../services/types';

export const POSITION_LABELS: Record<Position, string> = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  MEI: 'Meio-campo',
  ATA: 'Atacante',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
};

// A ordem é a do elenco: de trás para frente.
export const POSITION_OPTIONS: SelectOption[] = (
  ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as Position[]
).map((value) => ({
  value,
  label: `${value} · ${POSITION_LABELS[value]}`,
}));

export const CONDITION_OPTIONS: SelectOption[] = (
  ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as Condition[]
).map((value) => ({ value, label: CONDITION_LABELS[value] }));

export const SORT_OPTIONS: { value: PlayerSort; label: string }[] = [
  { value: 'name', label: 'Nome' },
  { value: 'value_desc', label: 'Valor de mercado (maior)' },
  { value: 'value_asc', label: 'Valor de mercado (menor)' },
  { value: 'age_asc', label: 'Idade (mais novo)' },
  { value: 'age_desc', label: 'Idade (mais velho)' },
  { value: 'position', label: 'Posição' },
];

export const CONDITION_STYLE: Record<Condition, string> = {
  APTO: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MAL_CONDICIONADO: 'border-amber-200 bg-amber-50 text-amber-700',
  DOENTE: 'border-red-200 bg-red-50 text-red-700',
};

export function initialsOf(name: string): string {
  const words = name.split(' ').filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
