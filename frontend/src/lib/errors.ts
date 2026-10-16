import { ApiError } from '../services/api';

const FALLBACK_MESSAGE = 'Não foi possível concluir a operação.';

/** Texto para mostrar ao usuário: o `message` da API quando existe. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : FALLBACK_MESSAGE;
}
