import type { Formation, Player, Position } from '../../services/types';

/** Quantos titulares cada setor tem em cada formação (o goleiro é sempre um). */
const FORMATIONS: Record<Formation, { defense: number; midfield: number; attack: number }> = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
};

export const FORMATION_OPTIONS = (Object.keys(FORMATIONS) as Formation[]).map((value) => ({
  value,
  label: value,
}));

export type Sector = 'goalkeeper' | 'defense' | 'midfield' | 'attack';

export const SECTOR_POSITIONS: Record<Sector, Position[]> = {
  goalkeeper: ['GOL'],
  defense: ['ZAG', 'LAT'],
  midfield: ['MEI'],
  attack: ['ATA'],
};

export const SECTOR_LABELS: Record<Sector, string> = {
  goalkeeper: 'Goleiro',
  defense: 'Defesa',
  midfield: 'Meio-campo',
  attack: 'Ataque',
};

/** Do ataque para o goleiro, como o campo visto de cima. */
export const SECTORS_TOP_DOWN: Sector[] = ['attack', 'midfield', 'defense', 'goalkeeper'];

export interface Slot {
  sector: Sector;
  /** Nome da vaga na tela: "Goleiro", "Defesa 2"… */
  label: string;
}

export function sectorOf(position: Position): Sector {
  const found = (Object.keys(SECTOR_POSITIONS) as Sector[]).find((sector) =>
    SECTOR_POSITIONS[sector].includes(position),
  );
  return found ?? 'goalkeeper';
}

export function countInSector(formation: Formation, sector: Sector): number {
  return sector === 'goalkeeper' ? 1 : FORMATIONS[formation][sector];
}

/** As 5 vagas da formação, na ordem em que aparecem no formulário. */
export function slotsOf(formation: Formation): Slot[] {
  return SECTORS_TOP_DOWN.slice()
    .reverse()
    .flatMap((sector) => {
      const total = countInSector(formation, sector);
      return Array.from({ length: total }, (_, index) => ({
        sector,
        label: total > 1 ? `${SECTOR_LABELS[sector]} ${index + 1}` : SECTOR_LABELS[sector],
      }));
    });
}

/** Distribui os titulares de hoje pelas vagas da formação, setor por setor, em ordem. */
export function prefillPicks(formation: Formation, starters: Player[]): string[] {
  const bySector = new Map<Sector, Player[]>();
  for (const player of starters) {
    const sector = sectorOf(player.position);
    bySector.set(sector, [...(bySector.get(sector) ?? []), player]);
  }

  const used = new Map<Sector, number>();
  return slotsOf(formation).map(({ sector }) => {
    const taken = used.get(sector) ?? 0;
    used.set(sector, taken + 1);
    const player = bySector.get(sector)?.[taken];
    return player ? String(player.id) : '';
  });
}
