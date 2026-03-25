import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Market, MarketStatus, MarketOutcome } from './entities/market.entity';
import { Bet, BetStatus } from '../bets/entities/bet.entity';
import { CreateMarketDto } from './dto/create-market.dto';
import { ResolveMarketDto } from './dto/resolve-market.dto';
import { QueryMarketsDto } from './dto/query-markets.dto';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private readonly marketsRepository: Repository<Market>,
    @InjectRepository(Bet)
    private readonly betsRepository: Repository<Bet>,
  ) {}

  async create(creatorId: string, dto: CreateMarketDto): Promise<Market> {
    const resolutionDate = new Date(dto.resolutionDate);
    if (resolutionDate <= new Date()) {
      throw new BadRequestException('Resolution date must be in the future');
    }

    const market = this.marketsRepository.create({
      question: dto.question,
      description: dto.description ?? null,
      category: dto.category,
      resolutionDate,
      resolutionSource: dto.resolutionSource ?? null,
      creatorId,
      status: MarketStatus.OPEN,
    });

    return this.marketsRepository.save(market);
  }

  async findAll(query: QueryMarketsDto) {
    const { category, status, search, page = 1, limit = 20 } = query;

    const where: FindManyOptions<Market>['where'] = {};

    if (category) (where as any).category = category;
    if (status) (where as any).status = status;
    if (search) (where as any).question = Like(`%${search}%`);

    const [markets, total] = await this.marketsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['creator'],
      select: {
        creator: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    });

    return {
      data: markets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Market> {
    const market = await this.marketsRepository.findOne({
      where: { id },
      relations: ['creator'],
      select: {
        creator: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    });
    if (!market) throw new NotFoundException('Market not found');
    return market;
  }

  async resolve(
    marketId: string,
    userId: string,
    dto: ResolveMarketDto,
  ): Promise<Market> {
    const market = await this.findOne(marketId);

    if (market.creatorId !== userId) {
      throw new ForbiddenException('Only the market creator can resolve it');
    }

    if (market.status !== MarketStatus.OPEN) {
      throw new BadRequestException('Only open markets can be resolved');
    }

    market.status = MarketStatus.RESOLVED;
    market.outcome = dto.outcome;
    market.resolutionNotes = dto.resolutionNotes ?? null;

    await this.marketsRepository.save(market);
    await this.settleBets(market);

    return market;
  }

  async cancel(marketId: string, userId: string): Promise<Market> {
    const market = await this.findOne(marketId);

    if (market.creatorId !== userId) {
      throw new ForbiddenException('Only the market creator can cancel it');
    }

    if (market.status === MarketStatus.RESOLVED) {
      throw new BadRequestException('Cannot cancel a resolved market');
    }

    market.status = MarketStatus.CANCELLED;
    await this.marketsRepository.save(market);

    await this.betsRepository.update(
      { marketId, status: BetStatus.ACTIVE },
      { status: BetStatus.REFUNDED },
    );

    return market;
  }

  getOdds(market: Market): { yes: number; no: number } {
    const yes = Number(market.totalYesAmount);
    const no = Number(market.totalNoAmount);
    const total = yes + no;

    if (total === 0) return { yes: 0.5, no: 0.5 };

    return {
      yes: Number((yes / total).toFixed(4)),
      no: Number((no / total).toFixed(4)),
    };
  }

  private async settleBets(market: Market): Promise<void> {
    const activeBets = await this.betsRepository.find({
      where: { marketId: market.id, status: BetStatus.ACTIVE },
    });

    const winningPosition = market.outcome as unknown as string;
    const totalWinning =
      market.outcome === MarketOutcome.YES
        ? Number(market.totalYesAmount)
        : Number(market.totalNoAmount);
    const totalVolume = Number(market.totalVolume);

    for (const bet of activeBets) {
      if ((bet.position as unknown as string) === winningPosition) {
        const share = Number(bet.amount) / totalWinning;
        const payout = share * totalVolume * 0.97; // 3% platform fee
        bet.status = BetStatus.WON;
        bet.payout = Number(payout.toFixed(2));
      } else {
        bet.status = BetStatus.LOST;
        bet.payout = 0;
      }
    }

    await this.betsRepository.save(activeBets);
  }
}
