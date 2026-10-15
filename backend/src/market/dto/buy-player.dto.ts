import { Transform } from 'class-transformer';
import { IsDate, IsInt, Max, Min } from 'class-validator';
import { parseBrasiliaDateTime } from '../../common/dates.js';
import { MAX_INT } from '../../common/query-transforms.js';

export class BuyPlayerDto {
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  club_id!: number;

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
