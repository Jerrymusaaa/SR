import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { StkPushDto } from './dto/stk-push.dto';
import { MpesaCallbackDto } from './dto/callback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('M-Pesa')
@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @ApiOperation({ summary: 'Initiate M-Pesa STK Push deposit' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('stk-push')
  async stkPush(@Request() req, @Body() dto: StkPushDto) {
    return this.mpesaService.initiateStkPush(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'M-Pesa payment callback (called by Safaricom)' })
  @HttpCode(HttpStatus.OK)
  @Post('callback')
  async callback(@Body() payload: MpesaCallbackDto) {
    await this.mpesaService.handleCallback(payload);
    return { ResultCode: 0, ResultDesc: 'Success' };
  }

  @ApiOperation({ summary: 'Check M-Pesa transaction status' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('status/:checkoutRequestId')
  async checkStatus(
    @Param('checkoutRequestId') checkoutRequestId: string,
    @Request() req,
  ) {
    return this.mpesaService.checkTransactionStatus(checkoutRequestId, req.user.sub);
  }
}
