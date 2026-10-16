const BRASILIA_OFFSET = '-03:00';
const DATE_TIME_WITHOUT_SECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/**
 * Converte o valor de um <input type="datetime-local"> ("2027-03-02T10:15")
 * para o formato que a API exige ("2027-03-02T10:15-03:00").
 * O valor digitado já é tratado como horário de Brasília, sem conversão de fuso.
 */
export function toApiDateTime(localValue: string): string {
  const match = DATE_TIME_WITHOUT_SECONDS.exec(localValue);
  if (!match) return localValue;

  return `${match[0]}${BRASILIA_OFFSET}`;
}
