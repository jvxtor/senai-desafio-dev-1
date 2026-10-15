import { ApiProperty } from '@nestjs/swagger';
import type { Jogador } from '../generated/prisma/client.js';
import { calculateMarketValue, calculateOverall } from './player-calculator.js';
import {
  CONDITIONS,
  POSITIONS,
  type Condition,
  type Position,
} from './player.constants.js';

export class PlayerResponse {
  /** Identificador do jogador. @example 2 */
  id!: number;

  /** Nome do jogador. @example "Meia Lua" */
  name!: string;

  @ApiProperty({
    enum: POSITIONS,
    example: 'MEI',
    description: 'Posição do jogador: GOL, ZAG, LAT, MEI ou ATA.',
  })
  position!: Position;

  /** Agilidade, de 1 a 100. @example 85 */
  agility!: number;

  /** Idade atual, de 16 a 45. @example 25 */
  age!: number;

  @ApiProperty({
    enum: CONDITIONS,
    example: 'MAL_CONDICIONADO',
    description:
      'Condição física atual: APTO, MAL_CONDICIONADO ou DOENTE. Ela muda o valor de mercado.',
  })
  condition!: Condition;

  /** Valor base, calculado uma única vez no cadastro. @example 40 */
  base_value!: number;

  /** Valor de mercado atual, calculado a cada consulta. @example 37 */
  market_value!: number;

  /** Velocidade, de 1 a 99. @example 70 */
  pace!: number;

  /** Finalização, de 1 a 99. @example 68 */
  shooting!: number;

  /** Passe, de 1 a 99. @example 82 */
  passing!: number;

  /** Drible, de 1 a 99. @example 79 */
  dribbling!: number;

  /** Defesa, de 1 a 99. @example 55 */
  defending!: number;

  /** Físico, de 1 a 99. @example 64 */
  physical!: number;

  /** Potencial, de 1 a 99. @example 86 */
  potential!: number;

  /** Overall, calculado a cada consulta pela posição atual. @example 75 */
  overall!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Clube do jogador, ou nulo quando está livre.',
    example: null,
  })
  club_id!: number | null;
}

export class PlayersPageMeta {
  /** Página devolvida. @example 1 */
  page!: number;

  /** Itens por página. @example 10 */
  limit!: number;

  /** Total de jogadores que atendem à busca e aos filtros. @example 23 */
  total_items!: number;

  /** Total de páginas, ou 0 quando não há itens. @example 3 */
  total_pages!: number;
}

export class PlayersPage {
  data!: PlayerResponse[];
  meta!: PlayersPageMeta;
}

export function toPlayerResponse(player: Jogador): PlayerResponse {
  const position = player.posicao as Position;
  const condition = player.condicao as Condition;
  const attributes = {
    pace: player.velocidade,
    shooting: player.finalizacao,
    passing: player.passe,
    dribbling: player.drible,
    defending: player.defesa,
    physical: player.fisico,
  };

  return {
    id: player.id,
    name: player.nome,
    position,
    agility: player.agilidade,
    age: player.idade,
    condition,
    base_value: player.valorBase.toNumber(),
    market_value: calculateMarketValue(
      player.valorBase,
      condition,
      player.agilidade,
      player.idade,
    ).toNumber(),
    ...attributes,
    potential: player.potencial,
    overall: calculateOverall(position, attributes),
    club_id: player.clubeId,
  };
}
