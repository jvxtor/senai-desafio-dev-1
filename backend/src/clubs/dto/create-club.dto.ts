import { Transform } from 'class-transformer';
import { toNormalizedText } from '../../common/query-transforms.js';
import { IsClubAcronym, IsClubName } from './club-validators.js';

export class CreateClubDto {
  @Transform(toNormalizedText, { toClassOnly: true })
  @IsClubName()
  name!: string;

  @IsClubAcronym()
  acronym!: string;
}
