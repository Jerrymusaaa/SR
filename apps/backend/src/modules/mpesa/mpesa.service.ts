import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from '../transactions/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { StkPushDto } from './dto/stk-push.dto';
import { MpesaCallbackDto } from './dto/callback.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly walletService: WalletService,
  ) {}

  private get baseUrl(): string {
    const env = this.configService.get<string>('mpesa.environment');
    if (env === 'production') {
      return 'https://api.safaricom.co.ke';
    }
    return 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    const consumerKey = this.configService.get<string>('mpesa.consumerKey');
    const consumerSecret = this.configService.get<string>('mpesa.consumerSecret');

    if (!consumerKey || !consumerSecret) {
      throw new InternalServerErrorException('M-Pesa credentials not configured');
    }

    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${credentials}` },
        },
      );
      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token', error);
      throw new InternalServerErrorException('Failed to connect to M-Pesa');
    }
  }

  private getTimestamp(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
  }

  private getPassword(timestamp: string): string {
    const shortcode = this.configService.get<string>('mpesa.shortcode');
    const passkey = this.configService.get<string>('mpesa.passkey');
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  }

  async initiateStkPush(
    userId: string,
    dto: StkPushDto,
  ): Promise<{ checkoutRequestId: string; message: string }> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = this.getPassword(timestamp);
    const shortcode = this.configService.get<string>('mpesa.shortcode');
    const callbackUrl = this.configService.get<string>('mpesa.callbackUrl');
    const reference = `SOKO-${uuidv4().slice(0, 8).toUpperCase()}`;

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(dto.amount),
      PartyA: dto.phoneNumber,
      PartyB: shortcode,
      PhoneNumber: dto.phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: reference,
      TransactionDesc: dto.description,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { CheckoutRequestID, ResponseCode, ResponseDescription } = response.data;

      if (ResponseCode !== '0') {
        throw new BadRequestException(ResponseDescription || 'STK push failed');
      }

      const transaction = this.transactionRepository.create({
        userId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        paymentMethod: PaymentMethod.MPESA,
        amount: dto.amount,
        currency: 'KES',
        reference,
        externalReference: CheckoutRequestID,
        description: dto.description,
        metadata: {
          phoneNumber: dto.phoneNumber,
          checkoutRequestId: CheckoutRequestID,
        },
      });

      await this.transactionRepository.save(transaction);

      this.logger.log(
        `STK push initiated for user ${userId}: ${CheckoutRequestID}`,
      );

      return {
        checkoutRequestId: CheckoutRequestID,
        message: 'Check your phone and enter your M-Pesa PIN to complete the deposit',
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('STK push failed', error?.response?.data || error.message);
      throw new InternalServerErrorException('Failed to initiate M-Pesa payment');
    }
  }

  async handleCallback(payload: MpesaCallbackDto): Promise<void> {
    const { stkCallback } = payload.Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    this.logger.log(`M-Pesa callback received: ${CheckoutRequestID} - Code: ${ResultCode}`);

    const transaction = await this.transactionRepository.findOne({
      where: { externalReference: CheckoutRequestID },
    });

    if (!transaction) {
      this.logger.warn(`No transaction found for CheckoutRequestID: ${CheckoutRequestID}`);
      return;
    }

    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item ?? [];
      const getMeta = (name: string) => items.find((i) => i.Name === name)?.Value;

      const mpesaReceiptNumber = getMeta('MpesaReceiptNumber') as string;
      const amount = getMeta('Amount') as number;

      transaction.status = TransactionStatus.COMPLETED;
      transaction.metadata = {
        ...((transaction.metadata as object) ?? {}),
        mpesaReceiptNumber,
        confirmedAmount: amount,
      };

      await this.transactionRepository.save(transaction);

      await this.walletService.getOrCreateWallet(transaction.userId);
      const wallet = await this.walletService.getBalance(transaction.userId);
      const updatedBalance = Number(wallet.kesBalance) + Number(amount ?? transaction.amount);

      await this.transactionRepository.manager
        .getRepository('wallets')
        .update({ userId: transaction.userId }, { kesBalance: updatedBalance });

      this.logger.log(`Wallet credited for user ${transaction.userId}: KES ${amount ?? transaction.amount}`);
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.metadata = {
        ...((transaction.metadata as object) ?? {}),
        failureReason: ResultDesc,
      };
      await this.transactionRepository.save(transaction);
      this.logger.warn(`M-Pesa payment failed for ${CheckoutRequestID}: ${ResultDesc}`);
    }
  }

  async checkTransactionStatus(checkoutRequestId: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { externalReference: checkoutRequestId, userId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    return {
      status: transaction.status,
      amount: transaction.amount,
      reference: transaction.reference,
      description: transaction.description,
    };
  }
}
