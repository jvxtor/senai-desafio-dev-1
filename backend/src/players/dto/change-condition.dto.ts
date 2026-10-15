import { IsIn } from 'class-validator';
import { CONDITIONS, type Condition } from '../player.constants.js';

export class ChangeConditionDto {
  @IsIn(CONDITIONS)
  condition!: Condition;
}
