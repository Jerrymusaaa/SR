import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BetPosition } from '../entities/bet.entity';

export class PlaceBetDto {
  @ApiProperty({ example: 'uuid-of-market' })
  @IsString()
  marketId: string;

  @ApiProperty({ enum: BetPosition, example: BetPosition.YES })
  @IsEnum(BetPosition)
  position: BetPosition;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(10)
  amount: number;
}
