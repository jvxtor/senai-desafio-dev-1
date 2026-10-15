import { compareText, foldText } from '../common/text.js';
import type { ClubResponse } from './club-response.js';

export const CLUB_SORT_OPTIONS = [
  'name',
  'net_worth_asc',
  'net_worth_desc',
] as const;

export type ClubSortOption = (typeof CLUB_SORT_OPTIONS)[number];

type Comparator = (a: ClubResponse, b: ClubResponse) => number;

const byName: Comparator = (a, b) =>
  compareText(foldText(a.name), foldText(b.name));

const COMPARATORS: Record<ClubSortOption, Comparator> = {
  name: byName,
  net_worth_asc: (a, b) => a.net_worth - b.net_worth,
  net_worth_desc: (a, b) => b.net_worth - a.net_worth,
};

export function buildClubComparator(sort: ClubSortOption): Comparator {
  const primary = COMPARATORS[sort];

  return (a, b) => primary(a, b) || byName(a, b) || a.id - b.id;
}
