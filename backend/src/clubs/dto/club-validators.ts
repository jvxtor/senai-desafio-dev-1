import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { foldText } from '../../common/text.js';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 60;
const NAME_MIN_WORDS = 2;
const NAME_MAX_WORDS = 5;
const NAME_CHARACTERS = /^[\p{L}\p{M} .-]+$/u;
const LETTER = /\p{L}/u;
const ACRONYM_FORMAT = /^[A-Z]{3}$/;

type Input = Record<string, unknown>;

function isValidName(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const length = [...value].length;
  const words = value.split(' ').filter((word) => LETTER.test(word)).length;
  return (
    length >= NAME_MIN_LENGTH &&
    length <= NAME_MAX_LENGTH &&
    words >= NAME_MIN_WORDS &&
    words <= NAME_MAX_WORDS &&
    NAME_CHARACTERS.test(value)
  );
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

function matchesName(acronym: string, name: string): boolean {
  const folded = foldText(name);
  const letters = foldText(acronym);
  return folded.startsWith(letters[0]) && appearsInOrder(letters, folded);
}

function isValidAcronym(value: unknown, name: unknown): boolean {
  if (typeof value !== 'string' || !ACRONYM_FORMAT.test(value)) return false;
  if (new Set(value).size === 1) return false;
  if (typeof name !== 'string') return true;
  return matchesName(value, name);
}

export function IsClubName(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isClubName',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'name deve ter de 3 a 60 caracteres, de 2 a 5 palavras e só letras, espaços, hífen e ponto',
        ...options,
      },
      validator: { validate: isValidName },
    });
  };
}

export function IsClubAcronym(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isClubAcronym',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'acronym deve ter 3 letras maiúsculas de A a Z, não todas iguais, que aparecem no nome nessa ordem, começando pela primeira letra do nome',
        ...options,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          return isValidAcronym(value, (args.object as Input)['name']);
        },
      },
    });
  };
}
