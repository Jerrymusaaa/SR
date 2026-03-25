import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MarketCategory } from '../entities/market.entity';

export class CreateMarketDto {
  @ApiProperty({ example: 'Will Ruto win the 2027 Kenyan election?' })
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  question: string;

  @ApiProperty({ example: 'Based on official IEBC results', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: MarketCategory, example: MarketCategory.POLITICS })
  @IsEnum(MarketCategory)
  category: MarketCategory;

  @ApiProperty({ example: '2027-08-10T00:00:00.000Z' })
  @IsDateString()
  resolutionDate: string;

  @ApiProperty({ example: 'https://iebc.or.ke', required: false })
  @IsOptional()
  @IsString()
  resolutionSource?: string;
}
