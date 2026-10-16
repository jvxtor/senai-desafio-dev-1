import type { ClubSort } from '../../services/types';

export const CLUB_SORT_OPTIONS: { value: ClubSort; label: string }[] = [
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'net_worth_desc', label: 'Patrimônio (maior)' },
  { value: 'net_worth_asc', label: 'Patrimônio (menor)' },
];

/** Limite de clubes da liga, o mesmo que a API aplica no cadastro. */
export const MAX_CLUBS = 20;

/** Caixa com que todo clube novo nasce (o padrão do banco). */
export const INITIAL_CASH = 300;
