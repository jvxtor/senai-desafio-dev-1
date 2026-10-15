import { PickType } from '@nestjs/swagger';
import { CreatePlayerDto } from './create-player.dto.js';

export class UpdatePlayerDto extends PickType(CreatePlayerDto, [
  'name',
  'position',
  'agility',
  'age',
] as const) {}
