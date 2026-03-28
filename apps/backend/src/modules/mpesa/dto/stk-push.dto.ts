import { IsNumber, IsString, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StkPushDto {
  @ApiProperty({ example: '254712345678' })
  @IsString()
  @Matches(/^254[0-9]{9}$/, {
    message: 'Phone number must be in format 254XXXXXXXXX',
  })
  phoneNumber: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiProperty({ example: 'Wallet deposit' })
  @IsString()
  description: string;
}
