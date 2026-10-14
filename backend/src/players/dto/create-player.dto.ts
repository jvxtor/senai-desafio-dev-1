import { Transform } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { normalizeSpaces } from '../../common/text.js';
import { POSITIONS, type Position } from '../player.constants.js';
import {
  IsPlayerName,
  ValidAgilityForAge,
  ValidAttributeRules,
} from './player-validators.js';

export class CreatePlayerDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeSpaces(value) : value,
  )
  @IsPlayerName()
  name!: string;

  @IsIn(POSITIONS)
  position!: Position;

  @IsInt()
  @Min(1)
  @Max(100)
  @ValidAgilityForAge()
  agility!: number;

  @IsInt()
  @Min(16)
  @Max(45)
  age!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  pace!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  shooting!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  passing!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  dribbling!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  defending!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  physical!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  @ValidAttributeRules()
  potential!: number;
}
