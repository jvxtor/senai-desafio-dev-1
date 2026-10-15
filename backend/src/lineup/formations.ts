export const LINEUP_SIZE = 5;

const FORMATIONS = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
} as const;

export type Formation = keyof typeof FORMATIONS;

export const FORMATION_NAMES = Object.keys(FORMATIONS) as Formation[];

function countOf(positions: string[], wanted: string[]): number {
  return positions.filter((position) => wanted.includes(position)).length;
}

export function fitsFormation(
  positions: string[],
  formation: Formation,
): boolean {
  const sectors = FORMATIONS[formation];

  return (
    countOf(positions, ['GOL']) === 1 &&
    countOf(positions, ['ZAG', 'LAT']) === sectors.defense &&
    countOf(positions, ['MEI']) === sectors.midfield &&
    countOf(positions, ['ATA']) === sectors.attack
  );
}
