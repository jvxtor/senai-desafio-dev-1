import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SQUAD_ORDER } from '../players/player-listing.js';
import { toPlayerResponse } from '../players/player-response.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { fitsFormation, LINEUP_SIZE } from './formations.js';
import type { SetLineupDto } from './dto/set-lineup.dto.js';
import type { LineupResponse } from './lineup-response.js';

@Injectable()
export class LineupService {
  constructor(private readonly prisma: PrismaService) {}

  async set(clubId: number, dto: SetLineupDto): Promise<LineupResponse> {
    await this.findClub(clubId);

    const players = await this.prisma.jogador.findMany({
      where: { id: { in: dto.player_ids }, excluidoEm: null },
    });
    if (players.length !== dto.player_ids.length) {
      throw new NotFoundException('Jogador não encontrado.');
    }
    if (players.some((player) => player.clubeId !== clubId)) {
      throw new ConflictException(
        'Todo titular precisa ser do elenco do clube.',
      );
    }
    if (players.some((player) => player.condicao === 'DOENTE')) {
      throw new ConflictException('Jogador DOENTE não pode ser escalado.');
    }
    if (
      !fitsFormation(
        players.map((player) => player.posicao),
        dto.formation,
      )
    ) {
      throw new ConflictException(
        'As posições dos titulares não fecham a formação.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.clube.update({
        where: { id: clubId },
        data: { formacao: dto.formation },
      });
      await tx.escalacao.deleteMany({ where: { clubeId: clubId } });
      await tx.escalacao.createMany({
        data: dto.player_ids.map((jogadorId) => ({
          clubeId: clubId,
          jogadorId,
        })),
      });
    });

    return this.get(clubId);
  }

  async get(clubId: number): Promise<LineupResponse> {
    const club = await this.findClub(clubId);
    const starters = await this.prisma.escalacao.findMany({
      where: { clubeId: clubId },
      include: { jogador: true },
    });

    const players = starters
      .map((starter) => toPlayerResponse(starter.jogador))
      .sort(SQUAD_ORDER);

    return {
      club_id: clubId,
      formation: club.formacao,
      complete: players.length === LINEUP_SIZE,
      players,
    };
  }

  private async findClub(clubId: number) {
    const club = await this.prisma.clube.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Clube não encontrado.');

    return club;
  }
}
