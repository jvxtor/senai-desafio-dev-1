const BRASILIA_OFFSET_HOURS = 3;
const INPUT_FORMAT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

export function parseBrasiliaDateTime(input: string): Date | null {
  const match = INPUT_FORMAT.exec(input);
  if (!match) return null;

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const isRealDate =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day &&
    check.getUTCHours() === hour &&
    check.getUTCMinutes() === minute;
  if (!isRealDate) return null;

  return new Date(
    Date.UTC(year, month - 1, day, hour + BRASILIA_OFFSET_HOURS, minute),
  );
}

export function formatBrasiliaDateTime(date: Date): string {
  const local = new Date(date.getTime() - BRASILIA_OFFSET_HOURS * 3_600_000);
  return `${local.toISOString().slice(0, 19)}-03:00`;
}
