import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { PlayersModule } from './players/players.module.js';
import { ClubsModule } from './clubs/clubs.module.js';
import { MarketModule } from './market/market.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    PrismaModule,
    PlayersModule,
    ClubsModule,
    MarketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
