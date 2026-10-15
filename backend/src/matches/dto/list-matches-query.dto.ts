import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_INT, toStrictInteger } from '../../common/query-transforms.js';

export class ListMatchesQueryDto {
  @ApiPropertyOptional({
    description:
      'Só as partidas em que o clube foi mandante ou visitante. Clube inexistente responde 404.',
    example: 1,
  })
  @IsOptional()
  @Transform(toStrictInteger, { toClassOnly: true })
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  club_id?: number;
}
