export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;
export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;

export type Position = (typeof POSITIONS)[number];
export type Condition = (typeof CONDITIONS)[number];

export interface Attributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}
