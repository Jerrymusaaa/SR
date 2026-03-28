import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkWalletDto {
  @ApiProperty({ example: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' })
  @IsString()
  walletAddress: string;
}
