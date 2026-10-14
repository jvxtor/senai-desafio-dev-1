import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateBaseValue, calculateOverall } from './player-calculator.js';
import type { CreatePlayerDto } from './dto/create-player.dto.js';
import { toPlayerResponse, type PlayerResponse } from './player-response.js';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlayerDto): Promise<PlayerResponse> {
    const overall = calculateOverall(dto.position, dto);
    const baseValue = calculateBaseValue(overall, dto.potential, dto.age);

    const player = await this.prisma.jogador.create({
      data: {
        nome: dto.name,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
        valorBase: baseValue.toFixed(2),
        velocidade: dto.pace,
        finalizacao: dto.shooting,
        passe: dto.passing,
        drible: dto.dribbling,
        defesa: dto.defending,
        fisico: dto.physical,
        potencial: dto.potential,
      },
    });

    return toPlayerResponse(player);
  }
}
