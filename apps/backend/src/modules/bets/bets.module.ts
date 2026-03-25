import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bet } from './entities/bet.entity';
import { Market } from '../markets/entities/market.entity';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { MarketsModule } from '../markets/markets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bet, Market]), MarketsModule],
  providers: [BetsService],
  controllers: [BetsController],
})
export class BetsModule {}
