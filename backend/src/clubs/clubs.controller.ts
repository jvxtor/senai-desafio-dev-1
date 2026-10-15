import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { ClubResponse } from './club-response.js';
import { ClubsService } from './clubs.service.js';
import { CreateClubDto } from './dto/create-club.dto.js';

@ApiTags('Clubes')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um clube com caixa inicial de 300,00' })
  @ApiCreatedResponse({
    description: 'Clube criado.',
    headers: {
      Location: {
        description: 'Caminho do clube criado',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Nome ou sigla fora do formato.' })
  @ApiConflictResponse({
    description: 'Nome ou sigla já cadastrados, ou limite de 20 clubes.',
  })
  async create(
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.clubsService.create(dto);
    response.location(`/api/v1/clubs/${club.id}`);
    return club;
  }
}
