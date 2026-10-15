import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service.js';
import { StandingResponse } from './standing-response.js';

@ApiTags('Liga')
@Controller('standings')
export class StandingsController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({
    summary: 'Classificação de todos os clubes',
    description:
      'Calculada a cada consulta. Mais pontos, depois saldo de gols, gols marcados e nome. Inclui os clubes que ainda não jogaram.',
  })
  @ApiOkResponse({ type: [StandingResponse], description: 'Classificação.' })
  standings(): Promise<StandingResponse[]> {
    return this.matchesService.standings();
  }
}
