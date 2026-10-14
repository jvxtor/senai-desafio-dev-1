import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import type { PlayerResponse } from './player-response.js';
import { PlayersService } from './players.service.js';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async create(
    @Body() dto: CreatePlayerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.playersService.create(dto);
    response.location(`/api/v1/players/${player.id}`);
    return player;
  }
}
