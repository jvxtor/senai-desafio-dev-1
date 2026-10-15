import { Transform } from 'class-transformer';
import { toNormalizedText } from '../../common/query-transforms.js';
import { IsClubAcronym, IsClubName } from './club-validators.js';

export class CreateClubDto {
  /**
   * Nome com 3 a 60 caracteres, de 2 a 5 palavras e só letras, espaços,
   * hífen e ponto. Único sem diferenciar maiúsculas e minúsculas, mas
   * considerando acentos.
   * @example "Águias FC"
   */
  @Transform(toNormalizedText, { toClassOnly: true })
  @IsClubName()
  name!: string;

  /**
   * Sigla única de 3 letras de A a Z maiúsculas, que aparecem no nome nessa
   * ordem, começando pela primeira letra do nome e não todas iguais.
   * @example "AGU"
   */
  @IsClubAcronym()
  acronym!: string;
}
