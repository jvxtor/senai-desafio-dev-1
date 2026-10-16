import type { CreatePlayerInput, Position, UpdatePlayerInput } from '../../services/types';

/** O que está nos campos do formulário, sempre como texto. */
export interface PlayerFormValues {
  name: string;
  position: Position | '';
  agility: string;
  age: string;
  pace: string;
  shooting: string;
  passing: string;
  dribbling: string;
  defending: string;
  physical: string;
  potential: string;
}

export type PlayerFormErrors = Partial<Record<keyof PlayerFormValues, string>>;

export const EMPTY_PLAYER_FORM: PlayerFormValues = {
  name: '',
  position: '',
  agility: '',
  age: '',
  pace: '',
  shooting: '',
  passing: '',
  dribbling: '',
  defending: '',
  physical: '',
  potential: '',
};

const NAME_LENGTH = { min: 3, max: 100 };
const INTEGER = /^\d+$/;

const NUMBER_RULES = [
  { field: 'agility', label: 'A agilidade', min: 1, max: 100 },
  { field: 'age', label: 'A idade', min: 16, max: 45 },
  { field: 'pace', label: 'A velocidade', min: 1, max: 99 },
  { field: 'shooting', label: 'A finalização', min: 1, max: 99 },
  { field: 'passing', label: 'O passe', min: 1, max: 99 },
  { field: 'dribbling', label: 'O drible', min: 1, max: 99 },
  { field: 'defending', label: 'A defesa', min: 1, max: 99 },
  { field: 'physical', label: 'O físico', min: 1, max: 99 },
  { field: 'potential', label: 'O potencial', min: 1, max: 99 },
] as const;

// Na edição só mudam o nome, a posição, a agilidade e a idade; os indicadores ficam como no cadastro.
const EDIT_NUMBER_FIELDS = new Set<string>(['agility', 'age']);

type Mode = 'create' | 'edit';

/**
 * Confere os campos que dependem de um só valor: obrigatório, tamanho do nome e faixas.
 * As regras que cruzam campos (soma dos atributos, potencial, agilidade por idade)
 * e as que dependem do banco ficam na API, e a tela mostra o `message` dela.
 */
export function validatePlayerForm(values: PlayerFormValues, mode: Mode) {
  const errors: PlayerFormErrors = {};
  const length = [...values.name.trim()].length;

  if (length < NAME_LENGTH.min || length > NAME_LENGTH.max) {
    errors.name = `O nome deve ter de ${NAME_LENGTH.min} a ${NAME_LENGTH.max} caracteres.`;
  }
  if (!values.position) errors.position = 'Escolha a posição.';

  const fields = NUMBER_RULES.filter(
    (rule) => mode === 'create' || EDIT_NUMBER_FIELDS.has(rule.field),
  );
  for (const rule of fields) {
    const raw = values[rule.field].trim();
    const value = INTEGER.test(raw) ? Number(raw) : NaN;

    if (!(value >= rule.min && value <= rule.max)) {
      errors[rule.field] = `${rule.label} é um número inteiro de ${rule.min} a ${rule.max}.`;
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

const toNumber = (raw: string) => Number(raw.trim());

/** Só chamar depois de `validatePlayerForm` aprovar os campos. */
export function toUpdateInput(values: PlayerFormValues): UpdatePlayerInput {
  return {
    name: values.name.trim(),
    position: values.position as Position,
    agility: toNumber(values.agility),
    age: toNumber(values.age),
  };
}

export function toCreateInput(values: PlayerFormValues): CreatePlayerInput {
  return {
    ...toUpdateInput(values),
    pace: toNumber(values.pace),
    shooting: toNumber(values.shooting),
    passing: toNumber(values.passing),
    dribbling: toNumber(values.dribbling),
    defending: toNumber(values.defending),
    physical: toNumber(values.physical),
    potential: toNumber(values.potential),
  };
}
