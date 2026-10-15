import { PlayerResponse } from '../players/player-response.js';

export class LineupResponse {
  /** Clube da escalação. @example 1 */
  club_id!: number;

  /** Formação salva, ou nula enquanto o clube não escalou. @example "2-1-1" */
  formation!: string | null;

  /** Verdadeiro quando os 5 titulares estão escalados. @example true */
  complete!: boolean;

  /** Titulares na ordem do elenco, com os campos de GET /players/{id}. */
  players!: PlayerResponse[];
}
