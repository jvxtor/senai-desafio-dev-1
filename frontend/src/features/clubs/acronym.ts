import { foldText, normalizeSpaces } from '../../lib/text';
import { acronymMatchesName } from './validation';

const ACRONYM_FORMAT = /^[A-Z]{3}$/;

/**
 * Sugere a sigla de um nome de clube, no mesmo formato que a API exige: 3 letras do nome, na
 * ordem, começando pela primeira. Pula as siglas que outros clubes já usam. Sem sugestão
 * possível (nome curto demais ou todas as opções ocupadas), devolve texto vazio.
 */
export function suggestAcronym(rawName: string, taken: string[]): string {
  const name = normalizeSpaces(rawName);
  const words = foldText(name)
    .split(' ')
    .map((word) => word.replace(/[^a-z]/g, ''))
    .filter(Boolean);
  const letters = words.join('');
  if (letters.length < 3) return '';

  const used = new Set(taken);
  const isFree = (candidate: string) =>
    ACRONYM_FORMAT.test(candidate) &&
    new Set(candidate).size > 1 &&
    !used.has(candidate) &&
    acronymMatchesName(candidate, name);

  const [first, second, third] = words;
  // Do mais comum ao menos comum: AGU para Águias FC, depois as iniciais, depois misturas.
  const preferred = [
    first.slice(0, 3),
    words
      .slice(0, 3)
      .map((word) => word[0])
      .join(''),
    first.slice(0, 2) + (second?.[0] ?? ''),
    first[0] + (second?.[0] ?? '') + (third?.[0] ?? ''),
  ].map((candidate) => candidate.toUpperCase());

  const found = preferred.find(isFree);
  if (found) return found;

  // Último recurso: a primeira letra do nome e quaisquer outras duas, na ordem.
  for (let i = 1; i < letters.length - 1; i++) {
    for (let j = i + 1; j < letters.length; j++) {
      const candidate = (letters[0] + letters[i] + letters[j]).toUpperCase();
      if (isFree(candidate)) return candidate;
    }
  }
  return '';
}
