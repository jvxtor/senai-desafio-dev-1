import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { MAX_INT, toStrictInteger } from '../../common/query-transforms.js';

const TYPE_LIST = /^(COMPRA|VENDA)(?:,(?!\1$)(?:COMPRA|VENDA))?$/;

export class ListTransactionsQueryDto {
  @ApiPropertyOptional({
    description:
      'Um ou mais tipos, separados por vírgula, sem espaços e sem repetir.',
    example: 'COMPRA,VENDA',
  })
  @IsOptional()
  @Matches(TYPE_LIST, {
    message:
      'type aceita COMPRA e VENDA, separados por vírgula, sem espaços e sem repetição',
  })
  type?: string;

  @ApiPropertyOptional({
    description:
      'Só as transações desse jogador no clube. Jogador inexistente ou excluído responde 404.',
    example: 2,
  })
  @IsOptional()
  @Transform(toStrictInteger, { toClassOnly: true })
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  player_id?: number;
}
