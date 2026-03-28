import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferTokensDto {
  @ApiProperty({ example: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' })
  @IsString()
  toWalletAddress: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;
}
