import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: 'Get current wallet balance' })
  @Get('balance')
  getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.sub);
  }

  @ApiOperation({ summary: 'Deposit funds into wallet' })
  @Post('deposit')
  deposit(@Request() req, @Body() dto: DepositDto) {
    return this.walletService.deposit(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @Post('withdraw')
  withdraw(@Request() req, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Get transaction history' })
  @Get('transactions')
  getTransactions(@Request() req, @Query() query: QueryTransactionsDto) {
    return this.walletService.getTransactions(req.user.sub, query);
  }

  @ApiOperation({ summary: 'Get a transaction by reference' })
  @Get('transactions/:reference')
  getTransaction(@Param('reference') reference: string, @Request() req) {
    return this.walletService.getTransactionByReference(reference, req.user.sub);
  }
}
