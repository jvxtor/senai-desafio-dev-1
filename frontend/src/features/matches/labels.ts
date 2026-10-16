import type { DuelParticipant, MatchResult } from '../../services/types';

export const RESULT_LABELS: Record<MatchResult, string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
};

export const RESULT_STYLE: Record<MatchResult, string> = {
  MANDANTE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  VISITANTE: 'border-blue-200 bg-blue-50 text-blue-700',
  EMPATE: 'text-muted-foreground',
};

/** O atributo que o duelo usou, com o nome que aparece na tela. */
export const ATTRIBUTE_LABELS: Record<DuelParticipant['attribute'], string> = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
};

export const TIRED_HINT = 'Mal condicionado: o valor usado já tem 15% a menos.';
