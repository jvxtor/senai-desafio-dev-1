import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import {
  MAX_INT,
  toNormalizedText,
  toStrictBoolean,
  toStrictDecimal,
  toStrictInteger,
} from '../../common/query-transforms.js';
import {
  CONDITIONS,
  POSITIONS,
  type Condition,
  type Position,
} from '../player.constants.js';
import {
  ExcludesClubFilter,
  IsNotLessThan,
  IsSearchText,
  IsSortList,
} from './list-players.validators.js';

const toClass = { toClassOnly: true };

export class ListPlayersQueryDto {
  @IsOptional()
  @Transform(toNormalizedText, toClass)
  @IsSearchText()
  search?: string;

  @IsOptional()
  @IsIn(POSITIONS)
  position?: Position;

  @IsOptional()
  @IsIn(CONDITIONS)
  condition?: Condition;

  @IsOptional()
  @Transform(toStrictBoolean, toClass)
  @IsBoolean()
  @ExcludesClubFilter()
  free?: boolean;

  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  club_id?: number;

  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(16)
  @Max(45)
  min_age?: number;

  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(16)
  @Max(45)
  @IsNotLessThan('min_age')
  max_age?: number;

  @IsOptional()
  @Transform(toStrictDecimal, toClass)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(550)
  min_value?: number;

  @IsOptional()
  @Transform(toStrictDecimal, toClass)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(550)
  @IsNotLessThan('min_value')
  max_value?: number;

  @IsOptional()
  @IsSortList()
  sort?: string;

  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  page?: number;

  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
