import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller.js';
import { MatchesService } from './matches.service.js';
import { StandingsController } from './standings.controller.js';

@Module({
  controllers: [MatchesController, StandingsController],
  providers: [MatchesService],
})
export class MatchesModule {}
