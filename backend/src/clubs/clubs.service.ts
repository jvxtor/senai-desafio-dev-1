import { ConflictException, Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { toClubResponse, type ClubResponse } from './club-response.js';
import type { CreateClubDto } from './dto/create-club.dto.js';

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
}

function isSameName(stored: string, received: string): boolean {
  return stored.toLowerCase() === received.toLowerCase();
}
