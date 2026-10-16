import { formatMoney } from '../../lib/format';
import type { PlayersFilters } from '../../services/types';

function describeRange(
  min: number | undefined,
  max: number | undefined,
  format: (value: number) => string,
): string | null {
  if (min !== undefined && max !== undefined) return `${format(min)} a ${format(max)}`;
  if (min !== undefined) return `a partir de ${format(min)}`;
  if (max !== undefined) return `até ${format(max)}`;
  return null;
}

// Os textos vêm dos filtros que a API de fato recebeu: uma faixa inválida não é enviada,
// então o botão não anuncia uma faixa que não está valendo.
export const ageSummary = (filters: PlayersFilters) =>
  describeRange(filters.min_age, filters.max_age, String);

export const valueSummary = (filters: PlayersFilters) =>
  describeRange(filters.min_value, filters.max_value, formatMoney);
