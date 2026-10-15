import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service.js';
import { ClubsController } from './clubs.controller.js';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService],
})
export class ClubsModule {}
