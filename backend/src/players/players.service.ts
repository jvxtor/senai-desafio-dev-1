import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateBaseValue, calculateOverall } from './player-calculator.js';
import type { ChangeConditionDto } from './dto/change-condition.dto.js';
import type { CreatePlayerDto } from './dto/create-player.dto.js';
import type { ListPlayersQueryDto } from './dto/list-players-query.dto.js';
import type { UpdatePlayerDto } from './dto/update-player.dto.js';
import {
  applyListing,
  buildWhere,
  type PlayersPage,
} from './player-listing.js';
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

  async findAll(query: ListPlayersQueryDto): Promise<PlayersPage> {
    if (query.club_id !== undefined) {
      const club = await this.prisma.clube.findUnique({
        where: { id: query.club_id },
        select: { id: true },
      });
      if (!club) throw new NotFoundException('Clube não encontrado.');
    }

    const players = await this.prisma.jogador.findMany({
      where: buildWhere(query),
    });

    return applyListing(players.map(toPlayerResponse), query);
  }

  async findOne(id: number): Promise<PlayerResponse> {
    return toPlayerResponse(await this.findActive(id));
  }

  async update(id: number, dto: UpdatePlayerDto): Promise<PlayerResponse> {
    const player = await this.findActive(id);

    if (player.clubeId !== null && dto.position !== player.posicao) {
      throw new ConflictException(
        'Jogador com clube não pode mudar de posição.',
      );
    }
    if (dto.age < player.idade) {
      throw new ConflictException('A idade não pode ser menor que a atual.');
    }

    const updated = await this.prisma.jogador.update({
      where: { id },
      data: {
        nome: dto.name,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
      },
    });

    return toPlayerResponse(updated);
  }

  async changeCondition(
    id: number,
    dto: ChangeConditionDto,
  ): Promise<PlayerResponse> {
    const player = await this.findActive(id);

    if (player.condicao === dto.condition) return toPlayerResponse(player);
    if (player.condicao === 'DOENTE' && dto.condition === 'APTO') {
      throw new ConflictException(
        'Jogador DOENTE não pode voltar direto para APTO.',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.condition === 'DOENTE') {
        await tx.escalacao.deleteMany({ where: { jogadorId: id } });
      }
      return tx.jogador.update({
        where: { id },
        data: { condicao: dto.condition },
      });
    });

    return toPlayerResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const player = await this.findActive(id);

    if (player.clubeId !== null) {
      throw new ConflictException('Só jogador livre pode ser excluído.');
    }

    await this.prisma.jogador.update({
      where: { id },
      data: { excluidoEm: new Date() },
    });
  }

  private async findActive(id: number) {
    const player = await this.prisma.jogador.findFirst({
      where: { id, excluidoEm: null },
    });
    if (!player) throw new NotFoundException('Jogador não encontrado.');

    return player;
  }
}
