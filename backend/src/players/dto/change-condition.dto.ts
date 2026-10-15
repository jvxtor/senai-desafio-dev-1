import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CONDITIONS, type Condition } from '../player.constants.js';

export class ChangeConditionDto {
  @ApiProperty({
    enum: CONDITIONS,
    description:
      'Nova condição física. De DOENTE não se vai direto para APTO, e ficar DOENTE tira o jogador da escalação.',
    example: 'MAL_CONDICIONADO',
  })
  @IsIn(CONDITIONS)
  condition!: Condition;
}
