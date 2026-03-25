import { IsEnum, IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MarketCategory, MarketStatus } from '../entities/market.entity';

export class QueryMarketsDto {
  @ApiProperty({ required: false, enum: MarketCategory })
  @IsOptional()
  @IsEnum(MarketCategory)
  category?: MarketCategory;

  @ApiProperty({ required: false, enum: MarketStatus })
  @IsOptional()
  @IsEnum(MarketStatus)
  status?: MarketStatus;

  @ApiProperty({ required: false, example: 'election' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
