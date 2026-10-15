import { compareText, foldText } from '../common/text.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { ListPlayersQueryDto } from './dto/list-players-query.dto.js';
import type { PlayerResponse, PlayersPage } from './player-response.js';
import { POSITIONS, type SortOption } from './player.constants.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
const DEFAULT_SORT: SortOption = 'name';

type Comparator = (a: PlayerResponse, b: PlayerResponse) => number;

const byName: Comparator = (a, b) =>
  compareText(foldText(a.name), foldText(b.name));

const COMPARATORS: Record<SortOption, Comparator> = {
  name: byName,
  value_asc: (a, b) => a.market_value - b.market_value,
  value_desc: (a, b) => b.market_value - a.market_value,
  age_asc: (a, b) => a.age - b.age,
  age_desc: (a, b) => b.age - a.age,
  position: (a, b) =>
    POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position),
};

export function buildWhere(
  query: ListPlayersQueryDto,
): Prisma.JogadorWhereInput {
  const withClub = query.free === false ? { not: null } : undefined;

  return {
    excluidoEm: null,
    posicao: query.position,
    condicao: query.condition,
    clubeId: query.club_id ?? (query.free === true ? null : withClub),
    idade: { gte: query.min_age, lte: query.max_age },
  };
}

export function buildComparator(sort: string | undefined): Comparator {
  const options = (sort ?? DEFAULT_SORT).split(',') as SortOption[];
  const criteria = options.map((option) => COMPARATORS[option]);

  return (a, b) => {
    for (const compare of [...criteria, byName]) {
      const difference = compare(a, b);
      if (difference !== 0) return difference;
    }
    return a.id - b.id;
  };
}

export function applyListing(
  players: PlayerResponse[],
  query: ListPlayersQueryDto,
): PlayersPage {
  const search = query.search === undefined ? null : foldText(query.search);
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_LIMIT;

  const matching = players
    .filter(
      (player) => search === null || foldText(player.name).includes(search),
    )
    .filter(
      (player) =>
        (query.min_value === undefined ||
          player.market_value >= query.min_value) &&
        (query.max_value === undefined ||
          player.market_value <= query.max_value),
    )
    .sort(buildComparator(query.sort));

  const start = (page - 1) * limit;

  return {
    data: matching.slice(start, start + limit),
    meta: {
      page,
      limit,
      total_items: matching.length,
      total_pages: Math.ceil(matching.length / limit),
    },
  };
}
