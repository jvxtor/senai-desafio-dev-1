import { foldText, normalizeSpaces } from '../../lib/text';
import type { CreateClubInput } from '../../services/types';

/** O que está nos campos do formulário, sempre como texto. */
export interface ClubFormValues {
  name: string;
  acronym: string;
}

export type ClubFormErrors = Partial<Record<keyof ClubFormValues, string>>;

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
function acronymMatchesName(acronym: string, name: string): boolean {
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

/** Confere o formulário antes de enviar; a API ainda decide nome e sigla repetidos. */
export function validateClubForm(values: ClubFormValues): {
  errors: ClubFormErrors;
  isValid: boolean;
} {
  const name = normalizeSpaces(values.name);
  const nameError = validateName(values.name);
  const acronymError = validateAcronym(values.acronym, nameError === undefined, name);

  const errors: ClubFormErrors = {};
  if (nameError) errors.name = nameError;
  if (acronymError) errors.acronym = acronymError;
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function toCreateInput(values: ClubFormValues): CreateClubInput {
  return { name: normalizeSpaces(values.name), acronym: values.acronym };
}
