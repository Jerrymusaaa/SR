import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Market } from './entities/market.entity';
import { Bet } from '../bets/entities/bet.entity';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Market, Bet])],
  providers: [MarketsService],
  controllers: [MarketsController],
  exports: [MarketsService],
})
export class MarketsModule {}
