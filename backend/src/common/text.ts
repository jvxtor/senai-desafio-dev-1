const EDGE_SPACES = /^ +| +$/g;
const REPEATED_SPACES = / {2,}/g;
const ACCENT_MARKS = /\p{Mn}/gu;

export function normalizeSpaces(value: string): string {
  return value.replace(EDGE_SPACES, '').replace(REPEATED_SPACES, ' ');
}

export function foldText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(ACCENT_MARKS, '');
}

export function compareText(a: string, b: string): number {
  const first = [...a];
  const second = [...b];
  const shortest = Math.min(first.length, second.length);

  for (let index = 0; index < shortest; index++) {
    const difference =
      (first[index].codePointAt(0) ?? 0) - (second[index].codePointAt(0) ?? 0);
    if (difference !== 0) return difference;
  }
  return first.length - second.length;
}
