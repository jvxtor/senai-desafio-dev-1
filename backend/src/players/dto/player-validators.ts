import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;
const NAME_MIN_WORDS = 2;
const CONTROL_CHARACTER = /\p{Cc}/u;
const LETTER = /\p{L}/u;
const DIGIT = /\d/;

const ATTRIBUTE_KEYS = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
] as const;
const MAX_ATTRIBUTE_SUM = 480;
const OLD_PLAYER_MIN_AGE = 33;

const AGILITY_AGE_LIMIT = 35;
const MAX_AGILITY_FROM_AGE_LIMIT = 85;

type Input = Record<string, unknown>;

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isValidName(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const length = [...value].length;
  const words = value.split(' ').filter((word) => LETTER.test(word));
  return (
    length >= NAME_MIN_LENGTH &&
    length <= NAME_MAX_LENGTH &&
    words.length >= NAME_MIN_WORDS &&
    !DIGIT.test(value) &&
    !CONTROL_CHARACTER.test(value)
  );
}

function attributeRuleError(input: Input): string | null {
  const attributes = ATTRIBUTE_KEYS.map((key) => input[key]);
  const potential = input['potential'];
  if (!attributes.every(isNumber) || !isNumber(potential)) return null;

  if (attributes.reduce((sum, value) => sum + value, 0) > MAX_ATTRIBUTE_SUM) {
    return 'a soma dos seis atributos não pode passar de 480';
  }

  const highest = Math.max(...attributes);
  if (potential < highest) {
    return 'potential não pode ser menor que o maior atributo';
  }

  const age = input['age'];
  if (isNumber(age) && age >= OLD_PLAYER_MIN_AGE && potential !== highest) {
    return 'com 33 anos ou mais, potential deve ser igual ao maior atributo';
  }
  return null;
}

export function IsPlayerName(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isPlayerName',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'name deve ter de 3 a 100 caracteres, pelo menos duas palavras e nenhum dígito',
        ...options,
      },
      validator: { validate: isValidName },
    });
  };
}

export function ValidAgilityForAge() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'validAgilityForAge',
      target: object.constructor,
      propertyName,
      options: {
        message: 'com 35 anos ou mais, agility deve ser no máximo 85',
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const age = (args.object as Input)['age'];
          if (!isNumber(value) || !isNumber(age)) return true;
          return age < AGILITY_AGE_LIMIT || value <= MAX_AGILITY_FROM_AGE_LIMIT;
        },
      },
    });
  };
}

export function ValidAttributeRules() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'validAttributeRules',
      target: object.constructor,
      propertyName,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          return attributeRuleError(args.object as Input) === null;
        },
        defaultMessage(args: ValidationArguments) {
          return attributeRuleError(args.object as Input) ?? '';
        },
      },
    });
  };
}
