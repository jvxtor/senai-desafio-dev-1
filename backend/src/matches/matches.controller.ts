import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErrorResponse } from '../common/error-response.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { ListMatchesQueryDto } from './dto/list-matches-query.dto.js';
import { MatchResponse, MatchSummaryResponse } from './match-response.js';
import { MatchesService } from './matches.service.js';

@ApiTags('Liga')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({
    summary: 'Joga uma partida entre dois clubes com escalação completa',
    description:
      'Não há sorteio: o placar sai de 6 duelos entre os titulares. A partida não muda o caixa, a escalação nem os jogadores.',
  })
  @ApiCreatedResponse({
    type: MatchResponse,
    description: 'Partida jogada, com o placar e os 6 duelos.',
    headers: {
      Location: {
        description: 'Caminho da partida criada',
        schema: { type: 'string', example: '/api/v1/matches/1' },
      },
    },
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Ids ausentes ou inválidos, ou mandante igual ao visitante.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube inexistente.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Clube sem a escalação completa.',
  })
  async create(
    @Body() dto: CreateMatchDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchResponse> {
    const match = await this.matchesService.create(dto);
    response.location(`/api/v1/matches/${match.id}`);
    return match;
  }

  @Get()
  @ApiOperation({
    summary: 'Histórico de partidas, da mais recente para a mais antiga',
    description: 'Cada partida vem sem os duelos. Sem partidas, lista vazia.',
  })
  @ApiOkResponse({ type: [MatchSummaryResponse], description: 'Partidas.' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'club_id inválido.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube inexistente.',
  })
  findAll(
    @Query() query: ListMatchesQueryDto,
  ): Promise<MatchSummaryResponse[]> {
    return this.matchesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta uma partida com os 6 duelos' })
  @ApiParam({ name: 'id', description: 'Identificador da partida', example: 1 })
  @ApiOkResponse({ type: MatchResponse, description: 'Partida com os duelos.' })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Partida inexistente.',
  })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<MatchResponse> {
    return this.matchesService.findOne(id);
  }
}
