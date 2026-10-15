import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from '../common/error-response.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { BuyPlayerDto } from './dto/buy-player.dto.js';
import { PurchaseResponse, SaleResponse } from './market-response.js';
import { MarketService } from './market.service.js';

@ApiTags('Mercado')
@Controller('players')
@ApiParam({ name: 'id', description: 'Identificador do jogador', example: 2 })
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compra um jogador livre e cria o contrato',
    description:
      'Paga o valor de mercado do momento mais a taxa de 5% (só quando o valor passa de 30,00). O custo total não pode passar de 50% do caixa, o elenco tem no máximo 12 jogadores e o clube não recompra um jogador que ele mesmo vendeu. Compra, contrato e transação são gravados juntos.',
  })
  @ApiOkResponse({
    type: PurchaseResponse,
    description: 'Transação de compra, contrato criado e novo caixa do clube.',
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description:
      'club_id ou loyalty_until ausentes, inválidos ou fora do limite.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Jogador inexistente ou excluído, ou clube inexistente.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description:
      'Jogador não livre, custo acima de 50% do caixa, elenco cheio ou recompra.',
  })
  buy(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: BuyPlayerDto,
  ): Promise<PurchaseResponse> {
    return this.marketService.buy(id, dto);
  }

  @Post(':id/sell')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vende o jogador pelo clube em que ele está',
    description:
      'Sem corpo. Vende pelo valor de mercado do momento. Antes do fim da fidelidade há multa (limitada a 10,00) e, com lucro, comissão progressiva. O jogador volta a ficar livre e sai da escalação.',
  })
  @ApiOkResponse({
    type: SaleResponse,
    description:
      'Transação de venda, com multa, comissão, crédito e novo caixa do clube.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Jogador inexistente ou excluído.',
  })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Jogador livre, sem clube.',
  })
  sell(@Param('id', ParseIdPipe) id: number): Promise<SaleResponse> {
    return this.marketService.sell(id);
  }
}
