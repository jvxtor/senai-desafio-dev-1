import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { normalizeSpaces } from '../../common/text.js';
import { POSITIONS, type Position } from '../player.constants.js';
import {
  IsPlayerName,
  ValidAgilityForAge,
  ValidAttributeRules,
} from './player-validators.js';

export class CreatePlayerDto {
  /**
   * Nome com 3 a 100 caracteres, pelo menos duas palavras e nenhum dígito.
   * @example "Meia Lua"
   */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeSpaces(value) : value,
  )
  @IsPlayerName()
  name!: string;

  @ApiProperty({ enum: POSITIONS, example: 'MEI' })
  @IsIn(POSITIONS)
  position!: Position;

  /**
   * Agilidade, de 1 a 100. Com 35 anos ou mais, no máximo 85.
   * @example 85
   */
  @IsInt()
  @Min(1)
  @Max(100)
  @ValidAgilityForAge()
  agility!: number;

  /**
   * Idade, de 16 a 45.
   * @example 25
   */
  @IsInt()
  @Min(16)
  @Max(45)
  age!: number;

  /**
   * Velocidade, de 1 a 99. A soma dos seis atributos não pode passar de 480.
   * @example 70
   */
  @IsInt()
  @Min(1)
  @Max(99)
  pace!: number;

  /**
   * Finalização, de 1 a 99.
   * @example 68
   */
  @IsInt()
  @Min(1)
  @Max(99)
  shooting!: number;

  /**
   * Passe, de 1 a 99.
   * @example 82
   */
  @IsInt()
  @Min(1)
  @Max(99)
  passing!: number;

  /**
   * Drible, de 1 a 99.
   * @example 79
   */
  @IsInt()
  @Min(1)
  @Max(99)
  dribbling!: number;

  /**
   * Defesa, de 1 a 99.
   * @example 55
   */
  @IsInt()
  @Min(1)
  @Max(99)
  defending!: number;

  /**
   * Físico, de 1 a 99.
   * @example 64
   */
  @IsInt()
  @Min(1)
  @Max(99)
  physical!: number;

  /**
   * Potencial, de 1 a 99, nunca menor que o maior atributo. Com 33 anos ou
   * mais, igual ao maior atributo.
   * @example 86
   */
  @IsInt()
  @Min(1)
  @Max(99)
  @ValidAttributeRules()
  potential!: number;
}
