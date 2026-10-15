export class StandingResponse {
  /** Posição, de 1 ao total de clubes. @example 1 */
  position!: number;

  /** Identificador do clube. @example 2 */
  club_id!: number;

  /** Nome do clube. @example "Delta FC" */
  club_name!: string;

  /** Partidas jogadas. @example 1 */
  played!: number;

  /** Vitórias. @example 1 */
  wins!: number;

  /** Empates. @example 0 */
  draws!: number;

  /** Derrotas. @example 0 */
  losses!: number;

  /** Gols marcados. @example 2 */
  goals_for!: number;

  /** Gols sofridos. @example 1 */
  goals_against!: number;

  /** Saldo de gols. @example 1 */
  goal_difference!: number;

  /** Pontos: vitória 3, empate 1, derrota 0. @example 3 */
  points!: number;
}
