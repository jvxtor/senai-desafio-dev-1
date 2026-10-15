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
  ApiTags,
} from '@nestjs/swagger';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { BuyPlayerDto } from './dto/buy-player.dto.js';
import { MarketService, type PurchaseResponse } from './market.service.js';

@ApiTags('Mercado')
@Controller('players')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compra um jogador livre e cria o contrato' })
  @ApiOkResponse({
    description: 'Transação de compra, contrato criado e novo caixa do clube.',
  })
  @ApiBadRequestResponse({
    description:
      'club_id ou loyalty_until ausentes, inválidos ou fora do limite.',
  })
  @ApiNotFoundResponse({ description: 'Jogador ou clube inexistente.' })
  @ApiConflictResponse({
    description:
      'Jogador não livre, custo acima de 50% do caixa, elenco cheio ou recompra.',
  })
  buy(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: BuyPlayerDto,
  ): Promise<PurchaseResponse> {
    return this.marketService.buy(id, dto);
  }
}
