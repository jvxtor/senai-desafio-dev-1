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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErrorResponse } from '../common/error-response.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { ChangeConditionDto } from './dto/change-condition.dto.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { ListPlayersQueryDto } from './dto/list-players-query.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { PlayerResponse, PlayersPage } from './player-response.js';
import { PlayersService } from './players.service.js';

const PLAYER_ID = {
  name: 'id',
  description: 'Identificador do jogador',
  example: 2,
};

@ApiTags('Jogadores')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastra um jogador',
    description:
      'O jogador nasce livre e APTO. O valor base é calculado uma única vez, pelo overall e pelo potencial, e gravado. Campos que o sistema controla, como id, base_value e overall, são ignorados se enviados.',
  })
  @ApiCreatedResponse({
    type: PlayerResponse,
    description: 'Jogador criado, com valor base, valor de mercado e overall.',
    headers: {
      Location: {
        description: 'Caminho do jogador criado',
        schema: { type: 'string', example: '/api/v1/players/2' },
      },
    },
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
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
    description:
      'Os filtros podem ser combinados. A paginação é aplicada depois de buscar, filtrar e ordenar, e os filtros e a ordenação por valor usam o valor de mercado. Em qualquer ordenação, o empate é desfeito pelo nome e depois pelo id.',
  })
  @ApiOkResponse({
    type: PlayersPage,
    description: 'Página de jogadores, com data e meta.',
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Parâmetro inválido ou combinação contraditória.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube do filtro club_id inexistente.',
  })
  findAll(@Query() query: ListPlayersQueryDto): Promise<PlayersPage> {
    return this.playersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta um jogador pelo id',
    description:
      'O valor de mercado e o overall são calculados a cada consulta, e o valor base é o gravado no cadastro.',
  })
  @ApiParam(PLAYER_ID)
  @ApiOkResponse({
    type: PlayerResponse,
    description: 'Jogador com valor de mercado e overall calculados na hora.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Jogador inexistente ou excluído, ou id fora do formato.',
  })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return this.playersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Edita nome, posição, agilidade e idade de um jogador',
    description:
      'Os quatro campos são obrigatórios, mesmo que só um mude. Indicadores, potencial e valor base continuam os do cadastro.',
  })
  @ApiParam(PLAYER_ID)
  @ApiOkResponse({ type: PlayerResponse, description: 'Jogador atualizado.' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Corpo inválido.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Jogador inexistente ou excluído.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Mudança de posição de jogador com clube ou idade menor.',
  })
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ): Promise<PlayerResponse> {
    return this.playersService.update(id, dto);
  }

  @Patch(':id/condition')
  @ApiOperation({
    summary: 'Altera a condição física de um jogador',
    description:
      'Enviar a condição atual é aceito, sem mudança. Ao ficar DOENTE, o jogador sai da escalação do clube.',
  })
  @ApiParam(PLAYER_ID)
  @ApiOkResponse({
    type: PlayerResponse,
    description: 'Jogador com a condição atualizada.',
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Condição ausente, nula ou fora da lista.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Jogador inexistente ou excluído.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'De DOENTE direto para APTO.',
  })
  changeCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: ChangeConditionDto,
  ): Promise<PlayerResponse> {
    return this.playersService.changeCondition(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui logicamente um jogador livre',
    description:
      'Marca o jogador como excluído, sem apagar nada. Depois disso ele conta como inexistente em todos os endpoints.',
  })
  @ApiParam(PLAYER_ID)
  @ApiNoContentResponse({ description: 'Jogador excluído, sem corpo.' })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Jogador inexistente ou já excluído.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Jogador que está em um clube.',
  })
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
