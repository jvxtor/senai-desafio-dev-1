import { normalizeSpaces } from './text.js';

export const MAX_INT = 2_147_483_647;

const POSITIVE_INTEGER = /^[1-9]\d*$/;
const DECIMAL = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

interface ParamInput {
  value: unknown;
}

export const toStrictInteger = ({ value }: ParamInput): unknown =>
  typeof value === 'string' && POSITIVE_INTEGER.test(value)
    ? Number(value)
    : value;

export const toStrictDecimal = ({ value }: ParamInput): unknown =>
  typeof value === 'string' && DECIMAL.test(value) ? Number(value) : value;

export const toStrictBoolean = ({ value }: ParamInput): unknown => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export const toNormalizedText = ({ value }: ParamInput): unknown =>
  typeof value === 'string' ? normalizeSpaces(value) : value;
