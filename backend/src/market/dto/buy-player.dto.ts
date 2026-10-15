import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsInt, Max, Min } from 'class-validator';
import { parseBrasiliaDateTime } from '../../common/dates.js';
import { MAX_INT } from '../../common/query-transforms.js';

export class BuyPlayerDto {
  /**
   * Clube comprador, que precisa existir.
   * @example 1
   */
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  club_id!: number;

  @ApiProperty({
    type: String,
    example: '2027-03-02T10:15-03:00',
    description:
      'Fim da fidelidade, no horário de Brasília, no formato AAAA-MM-DDTHH:MM-03:00. Precisa ser depois da compra e até 1.095 dias depois dela.',
  })
  @Transform(
    ({ value }: { value: unknown }) =>
      typeof value === 'string'
        ? (parseBrasiliaDateTime(value) ?? value)
        : value,
    { toClassOnly: true },
  )
  @IsDate({
    message:
      'loyalty_until deve estar no formato AAAA-MM-DDTHH:MM-03:00 e ser uma data existente',
  })
  loyalty_until!: Date;
}
