import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { PlaceBetDto } from './dto/place-bet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Bets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @ApiOperation({ summary: 'Place a bet on a market' })
  @Post()
  placeBet(@Request() req, @Body() dto: PlaceBetDto) {
    return this.betsService.placeBet(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Get all bets for the current user' })
  @Get('my-bets')
  getMyBets(@Request() req) {
    return this.betsService.getUserBets(req.user.sub);
  }

  @ApiOperation({ summary: 'Get a single bet by ID' })
  @Get(':id')
  getBet(@Param('id') id: string, @Request() req) {
    return this.betsService.getBetById(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Get all bets for a market' })
  @Get('market/:marketId')
  getMarketBets(@Param('marketId') marketId: string) {
    return this.betsService.getMarketBets(marketId);
  }
}
