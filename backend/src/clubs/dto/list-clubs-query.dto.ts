import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CLUB_SORT_OPTIONS, type ClubSortOption } from '../club-sorting.js';

export class ListClubsQueryDto {
  @ApiPropertyOptional({
    enum: CLUB_SORT_OPTIONS,
    description:
      'Ordenação pelo nome (padrão) ou pelo patrimônio. O empate é desfeito pelo nome e depois pelo id.',
  })
  @IsOptional()
  @IsIn(CLUB_SORT_OPTIONS)
  sort?: ClubSortOption;
}
