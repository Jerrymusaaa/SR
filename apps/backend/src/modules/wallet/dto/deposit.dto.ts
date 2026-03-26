import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../transactions/entities/transaction.entity';

export class DepositDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MPESA })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '254712345678', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
