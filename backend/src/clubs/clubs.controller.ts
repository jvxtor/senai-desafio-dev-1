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
import { ClubDetailResponse, ClubResponse } from './club-response.js';
import { ClubsService } from './clubs.service.js';
import { CreateClubDto } from './dto/create-club.dto.js';
import { ListClubsQueryDto } from './dto/list-clubs-query.dto.js';

@ApiTags('Clubes')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um clube',
    description:
      'O clube nasce com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes.',
  })
  @ApiCreatedResponse({
    type: ClubResponse,
    description: 'Clube criado.',
    headers: {
      Location: {
        description: 'Caminho do clube criado',
        schema: { type: 'string', example: '/api/v1/clubs/1' },
      },
    },
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Nome ou sigla fora do formato.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Nome ou sigla já cadastrados, ou limite de 20 clubes.',
  })
  async create(
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.clubsService.create(dto);
    response.location(`/api/v1/clubs/${club.id}`);
    return club;
  }

  @Get()
  @ApiOperation({
    summary: 'Lista os clubes, sem o elenco',
    description:
      'O valor do elenco e o patrimônio são calculados a cada consulta. Sem clubes, devolve uma lista vazia.',
  })
  @ApiOkResponse({ type: [ClubResponse], description: 'Lista de clubes.' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Valor de sort inválido.',
  })
  findAll(@Query() query: ListClubsQueryDto): Promise<ClubResponse[]> {
    return this.clubsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta um clube com o elenco e os contratos',
    description:
      'O elenco vem ordenado por posição (GOL, ZAG, LAT, MEI, ATA), nome e id, com o contrato de cada jogador: fim da fidelidade, dias restantes e percentual de multa se fosse vendido agora.',
  })
  @ApiParam({ name: 'id', description: 'Identificador do clube', example: 1 })
  @ApiOkResponse({
    type: ClubDetailResponse,
    description: 'Clube com caixa, valor do elenco, patrimônio e elenco.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube inexistente, ou id fora do formato.',
  })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<ClubDetailResponse> {
    return this.clubsService.findOne(id);
  }
}
