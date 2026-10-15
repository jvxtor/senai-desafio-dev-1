import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { MAX_INT } from '../../common/query-transforms.js';
import { FORMATION_NAMES, LINEUP_SIZE, type Formation } from '../formations.js';

export class SetLineupDto {
  /**
   * Formação dos 4 jogadores de linha, de trás para frente, sem o goleiro.
   * @example "2-1-1"
   */
  @IsIn(FORMATION_NAMES)
  formation!: Formation;

  /**
   * Os 5 titulares, em qualquer ordem: 1 goleiro e 4 jogadores de linha
   * que fecham a formação. Ids distintos e do elenco do clube.
   * @example [34, 31, 30, 33, 32]
   */
  @IsArray()
  @ArrayMinSize(LINEUP_SIZE)
  @ArrayMaxSize(LINEUP_SIZE)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(MAX_INT, { each: true })
  player_ids!: number[];
}
