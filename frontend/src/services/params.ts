type ParamValue = string | number | boolean | null | undefined;

/**
 * Remove os parâmetros ausentes ou vazios antes de enviar.
 * A API responde 400 a um parâmetro presente com valor vazio (como "position=").
 */
export function cleanParams(
  params: Record<string, ParamValue>,
): Record<string, string | number | boolean> {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] =>
      entry[1] !== undefined && entry[1] !== null && entry[1] !== '',
  );

  return Object.fromEntries(entries);
}
