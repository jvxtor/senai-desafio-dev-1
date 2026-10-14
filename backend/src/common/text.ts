const EDGE_SPACES = /^ +| +$/g;
const REPEATED_SPACES = / {2,}/g;

export function normalizeSpaces(value: string): string {
  return value.replace(EDGE_SPACES, '').replace(REPEATED_SPACES, ' ');
}
