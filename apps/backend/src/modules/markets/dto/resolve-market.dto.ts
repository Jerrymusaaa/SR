import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MarketOutcome } from '../entities/market.entity';

export class ResolveMarketDto {
  @ApiProperty({ enum: [MarketOutcome.YES, MarketOutcome.NO] })
  @IsEnum([MarketOutcome.YES, MarketOutcome.NO])
  outcome: MarketOutcome.YES | MarketOutcome.NO;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
