import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { toTransactionsCsv } from './transaction-csv.js';
import {
  toTransactionResponse,
  type TransactionsPageResponse,
} from './transaction-response.js';
import { calculateSummary } from './transaction-summary.js';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    clubId: number,
    query: ListTransactionsQueryDto,
  ): Promise<TransactionsPageResponse> {
    const transactions = await this.find(clubId, query);

    return {
      data: transactions.map(toTransactionResponse),
      summary: calculateSummary(transactions),
    };
  }

  async exportCsv(
    clubId: number,
    query: ListTransactionsQueryDto,
  ): Promise<string> {
    return toTransactionsCsv(await this.find(clubId, query));
  }

  private async find(clubId: number, query: ListTransactionsQueryDto) {
    const club = await this.prisma.clube.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Clube não encontrado.');

    if (query.player_id !== undefined) {
      const player = await this.prisma.jogador.findFirst({
        where: { id: query.player_id, excluidoEm: null },
      });
      if (!player) throw new NotFoundException('Jogador não encontrado.');
    }

    return this.prisma.transacao.findMany({
      where: {
        clubeId: clubId,
        tipo: query.type ? { in: query.type.split(',') } : undefined,
        jogadorId: query.player_id,
      },
      orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    });
  }
}
