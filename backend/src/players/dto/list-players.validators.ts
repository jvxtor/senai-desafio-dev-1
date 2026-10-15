import { registerDecorator, type ValidationArguments } from 'class-validator';
import { SORT_OPTIONS } from '../player.constants.js';

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 100;
const MAX_SORT_CRITERIA = 2;
const CONTROL_CHARACTER = /\p{Cc}/u;

type Input = Record<string, unknown>;

function isValidSearch(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const length = [...value].length;
  return (
    length >= SEARCH_MIN_LENGTH &&
    length <= SEARCH_MAX_LENGTH &&
    !CONTROL_CHARACTER.test(value)
  );
}

function isValidSortList(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const options = value.split(',');
  const fields = options.map((option) => option.split('_')[0]);
  return (
    options.length <= MAX_SORT_CRITERIA &&
    options.every((option) =>
      (SORT_OPTIONS as readonly string[]).includes(option),
    ) &&
    new Set(fields).size === fields.length
  );
}

export function IsSearchText() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isSearchText',
      target: object.constructor,
      propertyName,
      options: { message: 'search deve ter de 2 a 100 caracteres' },
      validator: { validate: isValidSearch },
    });
  };
}

export function IsSortList() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isSortList',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'sort aceita até dois critérios válidos, sem repetir o campo e separados por vírgula',
      },
      validator: { validate: isValidSortList },
    });
  };
}

export function IsNotLessThan(otherProperty: string) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotLessThan',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} não pode ser menor que ${otherProperty}`,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const other = (args.object as Input)[otherProperty];
          if (typeof value !== 'number' || typeof other !== 'number') {
            return true;
          }
          return value >= other;
        },
      },
    });
  };
}

export function ExcludesClubFilter() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'excludesClubFilter',
      target: object.constructor,
      propertyName,
      options: { message: 'free=true não pode ser combinado com club_id' },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const clubId = (args.object as Input)['club_id'];
          return !(value === true && clubId !== undefined);
        },
      },
    });
  };
}
