import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet, BetStatus } from './entities/bet.entity';
import { Market, MarketStatus } from '../markets/entities/market.entity';
import { PlaceBetDto } from './dto/place-bet.dto';
import { MarketsService } from '../markets/markets.service';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private readonly betsRepository: Repository<Bet>,
    @InjectRepository(Market)
    private readonly marketsRepository: Repository<Market>,
    private readonly marketsService: MarketsService,
  ) {}

  async placeBet(userId: string, dto: PlaceBetDto): Promise<Bet> {
    const market = await this.marketsRepository.findOne({
      where: { id: dto.marketId },
    });

    if (!market) throw new NotFoundException('Market not found');
    if (market.status !== MarketStatus.OPEN) {
      throw new BadRequestException('Market is not open for betting');
    }
    if (new Date() > market.resolutionDate) {
      throw new BadRequestException('Market has passed its resolution date');
    }

    const odds = this.marketsService.getOdds(market);
    const oddsAtBet = dto.position === 'yes' ? odds.yes : odds.no;
    const potentialPayout =
      oddsAtBet > 0
        ? Number((dto.amount / oddsAtBet).toFixed(2))
        : dto.amount * 2;

    const bet = this.betsRepository.create({
      userId,
      marketId: dto.marketId,
      position: dto.position,
      amount: dto.amount,
      oddsAtBet,
      potentialPayout,
      status: BetStatus.ACTIVE,
    });

    await this.betsRepository.save(bet);

    // Update market totals
    if (dto.position === 'yes') {
      market.totalYesAmount =
        Number(market.totalYesAmount) + Number(dto.amount);
    } else {
      market.totalNoAmount = Number(market.totalNoAmount) + Number(dto.amount);
    }
    market.totalVolume = Number(market.totalVolume) + Number(dto.amount);
    await this.marketsRepository.save(market);

    return bet;
  }

  async getUserBets(userId: string): Promise<Bet[]> {
    return this.betsRepository.find({
      where: { userId },
      relations: ['market'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMarketBets(marketId: string): Promise<Bet[]> {
    return this.betsRepository.find({
      where: { marketId },
      order: { createdAt: 'DESC' },
    });
  }

  async getBetById(betId: string, userId: string): Promise<Bet> {
    const bet = await this.betsRepository.findOne({
      where: { id: betId, userId },
      relations: ['market'],
    });
    if (!bet) throw new NotFoundException('Bet not found');
    return bet;
  }
}
