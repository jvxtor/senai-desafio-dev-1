const ACCENT_MARKS = /\p{Mn}/gu;
const REPEATED_SPACES = / {2,}/g;

/** Tira os espaços das pontas e junta os repetidos, como a API faz com os nomes. */
export function normalizeSpaces(value: string): string {
  return value.trim().replace(REPEATED_SPACES, ' ');
}

/** Minúsculas e sem acentos, para comparar e buscar ("Águias" vira "aguias"). */
export function foldText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(ACCENT_MARKS, '');
}
