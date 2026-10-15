import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
  SORT_OPTIONS,
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
  /**
   * Texto procurado dentro do nome, sem diferenciar maiúsculas e acentos.
   * De 2 a 100 caracteres.
   * @example "lua"
   */
  @IsOptional()
  @Transform(toNormalizedText, toClass)
  @IsSearchText()
  search?: string;

  @ApiPropertyOptional({ enum: POSITIONS, description: 'Filtra pela posição.' })
  @IsOptional()
  @IsIn(POSITIONS)
  position?: Position;

  @ApiPropertyOptional({
    enum: CONDITIONS,
    description: 'Filtra pela condição física.',
  })
  @IsOptional()
  @IsIn(CONDITIONS)
  condition?: Condition;

  /**
   * `true` lista só os jogadores livres e `false` só os que têm clube.
   * `true` não pode ser combinado com `club_id`.
   * @example true
   */
  @IsOptional()
  @Transform(toStrictBoolean, toClass)
  @IsBoolean()
  @ExcludesClubFilter()
  free?: boolean;

  /**
   * Só os jogadores do elenco desse clube. Clube inexistente responde 404.
   * @example 1
   */
  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  club_id?: number;

  /**
   * Idade mínima, de 16 a 45.
   * @example 18
   */
  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(16)
  @Max(45)
  min_age?: number;

  /**
   * Idade máxima, de 16 a 45, nunca menor que `min_age`.
   * @example 30
   */
  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(16)
  @Max(45)
  @IsNotLessThan('min_age')
  max_age?: number;

  /**
   * Valor de mercado mínimo, de 0 a 550, com até 2 casas decimais.
   * @example 10.5
   */
  @IsOptional()
  @Transform(toStrictDecimal, toClass)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(550)
  min_value?: number;

  /**
   * Valor de mercado máximo, de 0 a 550, nunca menor que `min_value`.
   * @example 100
   */
  @IsOptional()
  @Transform(toStrictDecimal, toClass)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(550)
  @IsNotLessThan('min_value')
  max_value?: number;

  @ApiPropertyOptional({
    description: `Até dois critérios separados por vírgula, sem repetir o campo. Valores: ${SORT_OPTIONS.join(', ')}. O padrão é name.`,
    example: 'value_desc,age_asc',
  })
  @IsOptional()
  @IsSortList()
  sort?: string;

  /**
   * Página, a partir de 1. O padrão é 1.
   * @example 1
   */
  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  page?: number;

  /**
   * Itens por página, de 1 a 50. O padrão é 10.
   * @example 10
   */
  @IsOptional()
  @Transform(toStrictInteger, toClass)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
