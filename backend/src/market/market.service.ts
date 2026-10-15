import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { formatBrasiliaDateTime } from '../common/dates.js';
import { roundMoney } from '../common/money.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateMarketValue } from '../players/player-calculator.js';
import type { Condition } from '../players/player.constants.js';
import type { BuyPlayerDto } from './dto/buy-player.dto.js';
import {
  calculatePurchaseFee,
  isWithinCashLimit,
  MAX_SQUAD_SIZE,
} from './market-calculator.js';
import {
  toTransactionResponse,
  type TransactionResponse,
} from './transaction-response.js';

const MAX_LOYALTY_DAYS = 1095;
const MILLISECONDS_PER_DAY = 86_400_000;

export interface PurchaseResponse extends TransactionResponse {
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: 'ATIVO';
  };
  club_cash: number;
}

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async buy(playerId: number, dto: BuyPlayerDto): Promise<PurchaseResponse> {
    const now = new Date();
    this.assertLoyaltyWithinLimits(dto.loyalty_until, now);

    return this.prisma.$transaction(async (tx) => {
      const player = await tx.jogador.findFirst({
        where: { id: playerId, excluidoEm: null },
      });
      if (!player) throw new NotFoundException('Jogador não encontrado.');

      const club = await tx.clube.findUnique({ where: { id: dto.club_id } });
      if (!club) throw new NotFoundException('Clube não encontrado.');

      if (player.clubeId !== null) {
        throw new ConflictException('O jogador não está livre.');
      }

      const previousSale = await tx.transacao.findFirst({
        where: { clubeId: club.id, jogadorId: player.id, tipo: 'VENDA' },
      });
      if (previousSale) {
        throw new ConflictException(
          'O clube não pode comprar um jogador que ele mesmo vendeu.',
        );
      }

      const squadSize = await tx.jogador.count({
        where: { clubeId: club.id, excluidoEm: null },
      });
      if (squadSize >= MAX_SQUAD_SIZE) {
        throw new ConflictException('O elenco já tem 12 jogadores.');
      }

      const value = calculateMarketValue(
        player.valorBase,
        player.condicao as Condition,
        player.agilidade,
        player.idade,
      );
      const fee = calculatePurchaseFee(value);
      const totalCost = roundMoney(value.plus(fee));
      if (!isWithinCashLimit(totalCost, club.caixa)) {
        throw new ConflictException(
          `O custo da compra (${totalCost.toFixed(2)}) passa do limite de 50% do caixa (${club.caixa.dividedBy(2).toString()}).`,
        );
      }

      const newCash = club.caixa.minus(totalCost);

      const claimed = await tx.jogador.updateMany({
        where: { id: player.id, clubeId: null, excluidoEm: null },
        data: { clubeId: club.id },
      });
      if (claimed.count === 0) {
        throw new ConflictException('O jogador não está livre.');
      }

      const charged = await tx.clube.updateMany({
        where: { id: club.id, caixa: club.caixa },
        data: { caixa: newCash.toFixed(2) },
      });
      if (charged.count === 0) {
        throw new ConflictException(
          'O caixa do clube mudou durante a compra, tente novamente.',
        );
      }

      await tx.contrato.create({
        data: {
          jogadorId: player.id,
          clubeId: club.id,
          valorCompra: value.toFixed(2),
          fidelidadeAte: dto.loyalty_until,
          situacao: 'ATIVO',
          iniciadoEm: now,
        },
      });

      const transaction = await tx.transacao.create({
        data: {
          clubeId: club.id,
          jogadorId: player.id,
          nomeJogador: player.nome,
          tipo: 'COMPRA',
          valor: value.toFixed(2),
          taxa: fee.toFixed(2),
          multa: '0.00',
          lucro: null,
          variacaoCaixa: totalCost.negated().toFixed(2),
          criadoEm: now,
        },
      });

      return {
        ...toTransactionResponse(transaction),
        contract: {
          purchase_value: value.toNumber(),
          loyalty_until: formatBrasiliaDateTime(dto.loyalty_until),
          status: 'ATIVO' as const,
        },
        club_cash: new Decimal(newCash).toNumber(),
      };
    });
  }

  private assertLoyaltyWithinLimits(loyaltyUntil: Date, now: Date): void {
    const limit = now.getTime() + MAX_LOYALTY_DAYS * MILLISECONDS_PER_DAY;

    if (loyaltyUntil.getTime() <= now.getTime()) {
      throw new BadRequestException(
        'O fim da fidelidade deve ser depois do momento da compra.',
      );
    }
    if (loyaltyUntil.getTime() > limit) {
      throw new BadRequestException(
        'O fim da fidelidade pode ser no máximo 1.095 dias depois da compra.',
      );
    }
  }
}
