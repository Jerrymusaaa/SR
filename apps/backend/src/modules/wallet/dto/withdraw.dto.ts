import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../transactions/entities/transaction.entity';

export class WithdrawDto {
  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(50)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MPESA })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '254712345678', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '0x123...abc', required: false })
  @IsOptional()
  @IsString()
  cryptoAddress?: string;
}
