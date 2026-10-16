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

// O que cada condição muda no valor de mercado (as faixas de agilidade são as da API).
export const CONDITION_DESCRIPTIONS: Record<Condition, string> = {
  APTO: 'Sem desconto por condição.',
  MAL_CONDICIONADO:
    'Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.',
  DOENTE: 'Desconto de 30%, com o mesmo ajuste de agilidade.',
};

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

// Uma cor por posição, do goleiro ao atacante: avatar e selo usam a mesma, em toda a tela.
const POSITION_TONE: Record<Position, string> = {
  GOL: 'bg-amber-100 text-amber-800',
  ZAG: 'bg-blue-100 text-blue-800',
  LAT: 'bg-cyan-100 text-cyan-800',
  MEI: 'bg-emerald-100 text-emerald-800',
  ATA: 'bg-rose-100 text-rose-800',
};

export const positionTone = (position: Position): string => POSITION_TONE[position];
