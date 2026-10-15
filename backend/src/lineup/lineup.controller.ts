import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from '../common/error-response.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { SetLineupDto } from './dto/set-lineup.dto.js';
import { LineupResponse } from './lineup-response.js';
import { LineupService } from './lineup.service.js';

@ApiTags('Liga')
@Controller('clubs/:id/lineup')
@ApiParam({ name: 'id', description: 'Identificador do clube', example: 1 })
export class LineupController {
  constructor(private readonly lineupService: LineupService) {}

  @Put()
  @ApiOperation({
    summary: 'Escolhe a formação e escala os 5 titulares do clube',
    description:
      'Substitui a escalação inteira. São 1 goleiro e 4 jogadores de linha que fecham a formação, todos do elenco do clube e nenhum DOENTE. Não muda o caixa.',
  })
  @ApiOkResponse({ type: LineupResponse, description: 'Escalação salva.' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Formação ou player_ids fora do formato.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube ou jogador inexistente.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description:
      'Jogador fora do elenco, DOENTE, ou posições que não fecham a formação.',
  })
  set(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: SetLineupDto,
  ): Promise<LineupResponse> {
    return this.lineupService.set(id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Consulta a escalação atual do clube',
    description:
      'Sem escalação, a formação vem nula e a lista vazia. Com titular a menos, a formação é mantida e complete vem falso.',
  })
  @ApiOkResponse({ type: LineupResponse, description: 'Escalação do clube.' })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube inexistente.',
  })
  get(@Param('id', ParseIdPipe) id: number): Promise<LineupResponse> {
    return this.lineupService.get(id);
  }
}
