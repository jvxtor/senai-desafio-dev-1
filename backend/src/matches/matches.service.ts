import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LINEUP_SIZE } from '../lineup/formations.js';
import { toPlayerResponse } from '../players/player-response.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateMatchDto } from './dto/create-match.dto.js';
import type { ListMatchesQueryDto } from './dto/list-matches-query.dto.js';
import { playMatch, type LineupSide } from './match-engine.js';
import {
  toMatchResponse,
  toMatchSummary,
  type MatchResponse,
  type MatchSummaryResponse,
} from './match-response.js';
import type { StandingResponse } from './standing-response.js';
import { calculateStandings } from './standings.js';

const NEWEST_FIRST = [{ jogadaEm: 'desc' }, { id: 'desc' }] as const;

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMatchDto): Promise<MatchResponse> {
    const clubs = await this.prisma.clube.findMany({
      where: { id: { in: [dto.home_club_id, dto.away_club_id] } },
      include: { escalacoes: { include: { jogador: true } } },
    });
    const home = clubs.find((club) => club.id === dto.home_club_id);
    const away = clubs.find((club) => club.id === dto.away_club_id);
    if (!home || !away) throw new NotFoundException('Clube não encontrado.');

    for (const club of [home, away]) {
      if (club.formacao === null || club.escalacoes.length !== LINEUP_SIZE) {
        throw new ConflictException(
          `O clube ${club.nome} não tem a escalação completa.`,
        );
      }
    }

    const toSide = (club: typeof home): LineupSide => ({
      clubId: club.id,
      players: club.escalacoes.map((starter) =>
        toPlayerResponse(starter.jogador),
      ),
    });
    const outcome = playMatch(toSide(home), toSide(away));

    const match = await this.prisma.$transaction((tx) =>
      tx.partida.create({
        data: {
          mandanteId: home.id,
          visitanteId: away.id,
          golsMandante: outcome.homeGoals,
          golsVisitante: outcome.awayGoals,
          formacaoMandante: home.formacao as string,
          formacaoVisitante: away.formacao as string,
          duelos: {
            create: outcome.duels.map((duel) => ({
              ordem: duel.order,
              clubeAtacanteId: duel.attackingClubId,
              atacanteId: duel.attacker.playerId,
              defensorId: duel.defender.playerId,
              nomeAtacante: duel.attacker.playerName,
              nomeDefensor: duel.defender.playerName,
              posicaoAtacante: duel.attacker.position,
              posicaoDefensor: duel.defender.position,
              condicaoAtacante: duel.attacker.condition,
              condicaoDefensor: duel.defender.condition,
              atributoAtaque: duel.attacker.attribute,
              atributoDefesa: duel.defender.attribute,
              valorAtaque: duel.attacker.value,
              valorDefesa: duel.defender.value,
              gol: duel.goal,
            })),
          },
        },
        include: {
          mandante: true,
          visitante: true,
          duelos: { orderBy: { ordem: 'asc' } },
        },
      }),
    );

    return toMatchResponse(match);
  }

  async findAll(query: ListMatchesQueryDto): Promise<MatchSummaryResponse[]> {
    if (query.club_id !== undefined) {
      const club = await this.prisma.clube.findUnique({
        where: { id: query.club_id },
      });
      if (!club) throw new NotFoundException('Clube não encontrado.');
    }

    const matches = await this.prisma.partida.findMany({
      where:
        query.club_id === undefined
          ? undefined
          : {
              OR: [
                { mandanteId: query.club_id },
                { visitanteId: query.club_id },
              ],
            },
      include: { mandante: true, visitante: true },
      orderBy: [...NEWEST_FIRST],
    });

    return matches.map(toMatchSummary);
  }

  async findOne(id: number): Promise<MatchResponse> {
    const match = await this.prisma.partida.findUnique({
      where: { id },
      include: {
        mandante: true,
        visitante: true,
        duelos: { orderBy: { ordem: 'asc' } },
      },
    });
    if (!match) throw new NotFoundException('Partida não encontrada.');

    return toMatchResponse(match);
  }

  async standings(): Promise<StandingResponse[]> {
    const [clubs, matches] = await Promise.all([
      this.prisma.clube.findMany({ select: { id: true, nome: true } }),
      this.prisma.partida.findMany({
        select: {
          mandanteId: true,
          visitanteId: true,
          golsMandante: true,
          golsVisitante: true,
        },
      }),
    ]);

    return calculateStandings(clubs, matches);
  }
}
