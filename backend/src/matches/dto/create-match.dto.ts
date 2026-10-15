import {
  IsInt,
  Max,
  Min,
  registerDecorator,
  type ValidationArguments,
} from 'class-validator';
import { MAX_INT } from '../../common/query-transforms.js';

function DiffersFrom(otherProperty: string) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'differsFrom',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} não pode ser igual a ${otherProperty}`,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const other = (args.object as Record<string, unknown>)[otherProperty];
          return value !== other;
        },
      },
    });
  };
}

export class CreateMatchDto {
  /**
   * Clube mandante: seus 3 ataques são os duelos de 1 a 3.
   * @example 1
   */
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  home_club_id!: number;

  /**
   * Clube visitante, diferente do mandante: seus 3 ataques são os duelos de 4 a 6.
   * @example 2
   */
  @IsInt()
  @Min(1)
  @Max(MAX_INT)
  @DiffersFrom('home_club_id')
  away_club_id!: number;
}
