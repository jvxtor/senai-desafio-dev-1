/** Liga o campo à mensagem de erro ou, sem erro, à dica. */
export function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}
