import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { ChangeConditionDto } from './dto/change-condition.dto.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { ListPlayersQueryDto } from './dto/list-players-query.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import type { PlayersPage } from './player-listing.js';
import type { PlayerResponse } from './player-response.js';
import { PlayersService } from './players.service.js';

@ApiTags('Jogadores')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um jogador livre e APTO' })
  @ApiCreatedResponse({
    description: 'Jogador criado, com valor base, valor de mercado e overall.',
    headers: {
      Location: {
        description: 'Caminho do jogador criado',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Corpo inválido (campo, tipo, limite ou regra).',
  })
  async create(
    @Body() dto: CreatePlayerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.playersService.create(dto);
    response.location(`/api/v1/players/${player.id}`);
    return player;
  }

  @Get()
  @ApiOperation({
    summary: 'Lista jogadores com busca, filtros, ordenação e paginação',
  })
  @ApiOkResponse({ description: 'Página de jogadores, com data e meta.' })
  @ApiBadRequestResponse({
    description: 'Parâmetro inválido ou combinação contraditória.',
  })
  @ApiNotFoundResponse({ description: 'Clube do filtro club_id inexistente.' })
  findAll(@Query() query: ListPlayersQueryDto): Promise<PlayersPage> {
    return this.playersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um jogador pelo id' })
  @ApiOkResponse({
    description: 'Jogador com valor de mercado e overall calculados na hora.',
  })
  @ApiNotFoundResponse({ description: 'Jogador inexistente ou excluído.' })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return this.playersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Edita nome, posição, agilidade e idade de um jogador',
  })
  @ApiOkResponse({ description: 'Jogador atualizado.' })
  @ApiBadRequestResponse({ description: 'Corpo inválido.' })
  @ApiNotFoundResponse({ description: 'Jogador inexistente ou excluído.' })
  @ApiConflictResponse({
    description: 'Mudança de posição de jogador com clube ou idade menor.',
  })
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ): Promise<PlayerResponse> {
    return this.playersService.update(id, dto);
  }

  @Patch(':id/condition')
  @ApiOperation({ summary: 'Altera a condição física de um jogador' })
  @ApiOkResponse({ description: 'Jogador com a condição atualizada.' })
  @ApiBadRequestResponse({ description: 'Condição ausente ou inválida.' })
  @ApiNotFoundResponse({ description: 'Jogador inexistente ou excluído.' })
  @ApiConflictResponse({ description: 'De DOENTE direto para APTO.' })
  changeCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: ChangeConditionDto,
  ): Promise<PlayerResponse> {
    return this.playersService.changeCondition(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui logicamente um jogador livre' })
  @ApiNoContentResponse({ description: 'Jogador excluído, sem corpo.' })
  @ApiNotFoundResponse({ description: 'Jogador inexistente ou já excluído.' })
  @ApiConflictResponse({ description: 'Jogador que está em um clube.' })
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
