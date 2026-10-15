import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from '../common/error-response.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { TransactionsPageResponse } from './transaction-response.js';
import { TransactionsService } from './transactions.service.js';

@ApiTags('Mercado')
@Controller('clubs/:id/transactions')
@ApiParam({ name: 'id', description: 'Identificador do clube', example: 1 })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Histórico de compras e vendas do clube',
    description:
      'Da mais recente para a mais antiga. O summary soma as transações filtradas.',
  })
  @ApiOkResponse({
    type: TransactionsPageResponse,
    description:
      'Transações e totais. Sem resultados, data vazio e totais zerados.',
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Filtro inválido.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube ou jogador do filtro inexistente.',
  })
  list(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionsPageResponse> {
    return this.transactionsService.list(id, query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header(
    'Content-Disposition',
    'attachment; filename="historico-transacoes.csv"',
  )
  @ApiOperation({
    summary: 'Exporta o histórico do clube em CSV',
    description:
      'Mesmos filtros do histórico. Colunas separadas por ponto e vírgula, valores com vírgula decimal e fim de linha LF.',
  })
  @ApiProduces('text/csv')
  @ApiOkResponse({ description: 'Arquivo CSV.' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Filtro inválido.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'Clube ou jogador do filtro inexistente.',
  })
  export(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<string> {
    return this.transactionsService.exportCsv(id, query);
  }
}
