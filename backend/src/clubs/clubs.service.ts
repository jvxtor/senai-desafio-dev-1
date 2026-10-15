import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { SQUAD_ORDER } from '../players/player-listing.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateSquadValue } from './club-calculator.js';
import {
  toClubResponse,
  toSquadPlayerResponse,
  type ClubDetailResponse,
  type ClubResponse,
} from './club-response.js';
import { buildClubComparator } from './club-sorting.js';
import type { CreateClubDto } from './dto/create-club.dto.js';
import type { ListClubsQueryDto } from './dto/list-clubs-query.dto.js';

const MAX_CLUBS = 20;
const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClubDto): Promise<ClubResponse> {
    try {
      const club = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.clube.findMany({
          select: { nome: true, sigla: true },
        });

        if (existing.length >= MAX_CLUBS) {
          throw new ConflictException('A liga aceita no máximo 20 clubes.');
        }
        if (existing.some((club) => club.sigla === dto.acronym)) {
          throw new ConflictException('Sigla já cadastrada.');
        }
        if (existing.some((club) => isSameName(club.nome, dto.name))) {
          throw new ConflictException('Nome de clube já cadastrado.');
        }

        return tx.clube.create({
          data: { nome: dto.name, sigla: dto.acronym },
        });
      });

      return toClubResponse(club, new Decimal(0));
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new ConflictException('Nome ou sigla já cadastrados.');
      }
      throw error;
    }
  }

  async findAll(query: ListClubsQueryDto): Promise<ClubResponse[]> {
    const [clubs, players] = await Promise.all([
      this.prisma.clube.findMany(),
      this.prisma.jogador.findMany({
        where: { clubeId: { not: null }, excluidoEm: null },
      }),
    ]);

    return clubs
      .map((club) =>
        toClubResponse(
          club,
          calculateSquadValue(players.filter((p) => p.clubeId === club.id)),
        ),
      )
      .sort(buildClubComparator(query.sort ?? 'name'));
  }

  async findOne(id: number): Promise<ClubDetailResponse> {
    const club = await this.prisma.clube.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Clube não encontrado.');

    const players = await this.prisma.jogador.findMany({
      where: { clubeId: id, excluidoEm: null },
      include: {
        contratos: {
          where: { clubeId: id, situacao: 'ATIVO' },
          orderBy: { iniciadoEm: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const squad = players
      .filter((player) => player.contratos.length > 0)
      .map((player) => toSquadPlayerResponse(player, player.contratos[0], now))
      .sort(SQUAD_ORDER);

    return {
      ...toClubResponse(club, calculateSquadValue(players)),
      players: squad,
    };
  }
}

function isSameName(stored: string, received: string): boolean {
  return stored.toLowerCase() === received.toLowerCase();
}
