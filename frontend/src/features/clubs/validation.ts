import { foldText, normalizeSpaces } from '../../lib/text';
import type { Club, CreateClubInput } from '../../services/types';

/** O que está nos campos do formulário, sempre como texto. */
export interface ClubFormValues {
  name: string;
  acronym: string;
}

export type ClubField = keyof ClubFormValues;
export type ClubFormErrors = Partial<Record<ClubField, string>>;

/** Nome ou sigla que já são de outro clube: aparece num alerta, com o campo marcado. */
export interface ClubConflict {
  messages: string[];
  fields: ClubField[];
}

export const EMPTY_CLUB_FORM: ClubFormValues = { name: '', acronym: '' };

const NAME_LENGTH = { min: 3, max: 60 };
const NAME_WORDS = { min: 2, max: 5 };
const NAME_CHARACTERS = /^[\p{L}\p{M} .-]+$/u;
const LETTER = /\p{L}/u;
const ACRONYM_FORMAT = /^[A-Z]{3}$/;

/** A sigla só aceita letras de A a Z maiúsculas, no máximo 3: acentos viram a letra simples. */
export function toAcronymInput(raw: string): string {
  return foldText(raw)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
}

function appearsInOrder(letters: string, text: string): boolean {
  let position = 0;
  for (const letter of letters) {
    position = text.indexOf(letter, position);
    if (position === -1) return false;
    position += 1;
  }
  return true;
}

// As letras da sigla aparecem no nome nessa ordem, começando pela primeira letra do nome.
export function acronymMatchesName(acronym: string, name: string): boolean {
  const folded = foldText(name);
  const letters = foldText(acronym);
  return folded.startsWith(letters[0]) && appearsInOrder(letters, folded);
}

function validateName(raw: string): string | undefined {
  const name = normalizeSpaces(raw);
  if (name === '') return 'Informe o nome do clube.';

  const length = [...name].length;
  if (length < NAME_LENGTH.min || length > NAME_LENGTH.max) {
    return `O nome deve ter de ${NAME_LENGTH.min} a ${NAME_LENGTH.max} caracteres.`;
  }
  if (!NAME_CHARACTERS.test(name)) {
    return 'O nome só pode ter letras, espaços, hífen e ponto.';
  }

  const words = name.split(' ').filter((word) => LETTER.test(word)).length;
  if (words < NAME_WORDS.min || words > NAME_WORDS.max) {
    return `O nome deve ter de ${NAME_WORDS.min} a ${NAME_WORDS.max} palavras.`;
  }
  return undefined;
}

function validateAcronym(acronym: string, nameIsValid: boolean, name: string): string | undefined {
  if (acronym === '') return 'Informe a sigla.';
  if (!ACRONYM_FORMAT.test(acronym)) return 'A sigla deve ter 3 letras de A a Z.';
  if (new Set(acronym).size === 1) return 'A sigla não pode ter as 3 letras iguais.';
  if (nameIsValid && !acronymMatchesName(acronym, name)) {
    return 'A sigla deve usar letras do nome, na ordem, e começar pela primeira letra do nome.';
  }
  return undefined;
}

// Como a API: o nome repetido ignora maiúsculas e minúsculas, mas NÃO ignora acentos
// ("Aguias FC" e "Águias FC" são clubes diferentes). A sigla já vem em maiúsculas.
function findConflict(
  values: ClubFormValues,
  errors: ClubFormErrors,
  existing: Club[],
): ClubConflict | undefined {
  const name = normalizeSpaces(values.name);
  const messages: string[] = [];
  const fields: ClubField[] = [];

  const sameName = errors.name
    ? undefined
    : existing.find((club) => club.name.toLowerCase() === name.toLowerCase());
  if (sameName) {
    messages.push(`Já existe um clube com o nome “${sameName.name}”.`);
    fields.push('name');
  }
  if (!errors.acronym && existing.some((club) => club.acronym === values.acronym)) {
    messages.push(`Já existe um clube com a sigla “${values.acronym}”.`);
    fields.push('acronym');
  }
  return messages.length > 0 ? { messages, fields } : undefined;
}

/**
 * Confere o formulário antes de enviar. Erros de formato aparecem junto do campo; nome ou
 * sigla repetidos (contra a lista já carregada) viram um conflito. A API ainda decide por
 * último, porque a lista pode estar desatualizada.
 */
export function validateClubForm(
  values: ClubFormValues,
  existing: Club[] = [],
): { errors: ClubFormErrors; conflict?: ClubConflict; isValid: boolean } {
  const name = normalizeSpaces(values.name);
  const nameError = validateName(values.name);
  const acronymError = validateAcronym(values.acronym, nameError === undefined, name);

  const errors: ClubFormErrors = {};
  if (nameError) errors.name = nameError;
  if (acronymError) errors.acronym = acronymError;

  const conflict = findConflict(values, errors, existing);
  return { errors, conflict, isValid: Object.keys(errors).length === 0 && !conflict };
}

export function toCreateInput(values: ClubFormValues): CreateClubInput {
  return { name: normalizeSpaces(values.name), acronym: values.acronym };
}

/** Descobre a que campo a recusa da API se refere, pelo texto da mensagem. */
export function fieldsOfApiConflict(message: string): ClubField[] {
  const text = message.toLowerCase();
  if (text.includes('nome ou sigla')) return ['name', 'acronym'];
  if (text.includes('sigla')) return ['acronym'];
  if (text.includes('nome')) return ['name'];
  return [];
}
