import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreatePlayerDto } from './dto/create-player.dto.js';
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
}
