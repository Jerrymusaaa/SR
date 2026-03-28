import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SolanaService } from './solana.service';
import { LinkWalletDto } from './dto/link-wallet.dto';
import { TransferTokensDto } from './dto/transfer-tokens.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Solana / $SOKO Token')
@Controller('solana')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @ApiOperation({ summary: 'Get Solana network info' })
  @Get('network')
  getNetworkInfo() {
    return this.solanaService.getNetworkInfo();
  }

  @ApiOperation({ summary: 'Get $SOKO token info' })
  @Get('token-info')
  getTokenInfo() {
    return this.solanaService.getTokenInfo();
  }

  @ApiOperation({ summary: 'Get SOL and $SOKO balance for a wallet' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('balance/:walletAddress')
  getWalletBalance(@Param('walletAddress') walletAddress: string) {
    return this.solanaService.getWalletBalance(walletAddress);
  }

  @ApiOperation({ summary: 'Link a Phantom wallet to your account' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('link-wallet')
  linkWallet(@Request() req, @Body() dto: LinkWalletDto) {
    return this.solanaService.linkWallet(req.user.sub, dto.walletAddress);
  }

  @ApiOperation({ summary: 'Airdrop devnet SOL for testing' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('airdrop/:walletAddress')
  airdrop(@Param('walletAddress') walletAddress: string) {
    return this.solanaService.airdropDevnetSol(walletAddress);
  }

  @ApiOperation({ summary: 'Transfer $SOKO tokens to a wallet' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  transferTokens(@Body() dto: TransferTokensDto) {
    return this.solanaService.transferSokoTokens(
      dto.toWalletAddress,
      dto.amount,
    );
  }
}
