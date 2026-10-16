import { foldText } from '../../lib/text';
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

/** Um clube só joga partidas com os 5 titulares escalados. */
export const LINEUP_SIZE = 5;

/** Quanto cada atributo vale a menos durante a partida para quem está mal condicionado. */
export const TIRED_DISCOUNT_PERCENT = 15;

export type Sector = 'goalkeeper' | 'defense' | 'midfield' | 'attack';

export const SECTOR_POSITIONS: Record<Sector, Position[]> = {
  goalkeeper: ['GOL'],
  defense: ['ZAG', 'LAT'],
  midfield: ['MEI'],
  attack: ['ATA'],
};

/** Do ataque para o goleiro, como o campo visto de cima. */
export const SECTORS_TOP_DOWN: Sector[] = ['attack', 'midfield', 'defense', 'goalkeeper'];

const SECTOR_NAMES: Record<Sector, { label: string; hint: string }> = {
  goalkeeper: { label: 'Goleiro', hint: 'GOL' },
  defense: { label: 'Defesa', hint: 'ZAG ou LAT' },
  midfield: { label: 'Meio', hint: 'MEI' },
  attack: { label: 'Ataque', hint: 'ATA' },
};

export interface Slot {
  sector: Sector;
  /** "Goleiro", "Defesa"… */
  label: string;
  /** Posições aceitas na vaga, como "ZAG ou LAT". */
  hint: string;
  /** Nome para leitores de tela, com o número quando o setor tem mais de uma vaga. */
  ariaLabel: string;
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

/** Explica a formação em palavras: "Defesa 2, meio 1, ataque 1". */
export function describeFormation(formation: Formation): string {
  const { defense, midfield, attack } = FORMATIONS[formation];
  const parts = [`Defesa ${defense}`];
  if (midfield > 0) parts.push(`meio ${midfield}`);
  parts.push(`ataque ${attack}`);
  return parts.join(', ');
}

/** As 5 vagas da formação, do goleiro ao ataque, na ordem em que aparecem na tabela. */
export function slotsOf(formation: Formation): Slot[] {
  return SECTORS_TOP_DOWN.slice()
    .reverse()
    .flatMap((sector) => {
      const total = countInSector(formation, sector);
      const { label, hint } = SECTOR_NAMES[sector];
      return Array.from({ length: total }, (_, index) => ({
        sector,
        label,
        hint,
        ariaLabel: total > 1 ? `${label} ${index + 1}` : label,
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

const POSITION_ORDER: Position[] = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];

/** A ordem do elenco da API: posição (goleiro ao atacante), nome sem acento e id. */
export interface SquadKey {
  position: Position;
  name: string;
  id: number;
}

export function compareSquad(a: SquadKey, b: SquadKey): number {
  const byPosition = POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position);
  if (byPosition !== 0) return byPosition;

  const nameA = foldText(a.name);
  const nameB = foldText(b.name);
  if (nameA !== nameB) return nameA < nameB ? -1 : 1;
  return a.id - b.id;
}

export interface UsedAttribute {
  label: string;
  value: number;
}

const ATTACK_ATTRIBUTE: Record<Exclude<Position, 'GOL'>, UsedAttribute['label']> = {
  ATA: 'Finalização',
  MEI: 'Passe',
  ZAG: 'Drible',
  LAT: 'Drible',
};

function attributeValue(player: Player, label: string): number {
  switch (label) {
    case 'Finalização':
      return player.shooting;
    case 'Passe':
      return player.passing;
    case 'Drible':
      return player.dribbling;
    default:
      return player.defending;
  }
}

/**
 * Os atributos de cada titular que a partida usa, como o motor da API: o goleiro e os dois
 * jogadores de linha mais recuados defendem (defesa); os três mais avançados atacam, cada um
 * com o atributo da sua posição. O segundo da linha faz as duas coisas.
 */
export function usedAttributes(starters: Player[]): Map<number, UsedAttribute[]> {
  const ordered = [...starters].sort(compareSquad);
  const goalkeeper = ordered.find((player) => player.position === 'GOL');
  const line = ordered.filter((player) => player.position !== 'GOL');

  const pick = (player: Player, label: string): UsedAttribute => ({
    label,
    value: attributeValue(player, label),
  });
  const attack = (player: Player) =>
    pick(player, ATTACK_ATTRIBUTE[player.position as Exclude<Position, 'GOL'>]);

  const result = new Map<number, UsedAttribute[]>();
  if (goalkeeper) result.set(goalkeeper.id, [pick(goalkeeper, 'Defesa')]);
  if (line[0]) result.set(line[0].id, [pick(line[0], 'Defesa')]);
  if (line[1]) result.set(line[1].id, [attack(line[1]), pick(line[1], 'Defesa')]);
  if (line[2]) result.set(line[2].id, [attack(line[2])]);
  if (line[3]) result.set(line[3].id, [attack(line[3])]);
  return result;
}
