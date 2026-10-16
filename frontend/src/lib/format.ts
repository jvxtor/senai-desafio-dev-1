const MONEY_FORMAT = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const API_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/** Moeda fictícia: sempre 2 casas e vírgula decimal, como 1.234,56. */
export function formatMoney(value: number): string {
  return MONEY_FORMAT.format(value);
}

/**
 * Data e hora da API ("2026-11-02T10:15:00-03:00") no formato "02/11/2026 10:15".
 * A API já responde no horário de Brasília, então o texto é lido sem converter fuso.
 */
export function formatDateTime(value: string): string {
  const match = API_DATE_TIME.exec(value);
  if (!match) return value;

  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

/** Só a data da API ("2026-11-02T10:15:00-03:00") no formato "02/11/2026", sem converter fuso. */
export function formatDate(value: string): string {
  const match = API_DATE_TIME.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Data e hora da API no formato "04/04/2027, 15:45", sem converter fuso. */
export function formatDateAndTime(value: string): string {
  const match = API_DATE_TIME.exec(value);
  if (!match) return value;

  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year}, ${hour}:${minute}`;
}
