export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;
export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;
export const SORT_OPTIONS = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;

export type Position = (typeof POSITIONS)[number];
export type Condition = (typeof CONDITIONS)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface Attributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}
