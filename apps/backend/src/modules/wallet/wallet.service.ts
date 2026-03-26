import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../transactions/entities/transaction.entity';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepository.create({ userId });
      await this.walletRepository.save(wallet);
    }
    return wallet;
  }

  async getBalance(userId: string): Promise<Wallet> {
    return this.getOrCreateWallet(userId);
  }

  async deposit(userId: string, dto: DepositDto): Promise<Transaction> {
    const wallet = await this.getOrCreateWallet(userId);

    // In production this triggers M-Pesa STK push or card charge
    // For now we simulate a completed deposit
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      paymentMethod: dto.paymentMethod,
      amount: dto.amount,
      currency: 'KES',
      reference: `DEP-${uuidv4().slice(0, 8).toUpperCase()}`,
      description: `Deposit via ${dto.paymentMethod}`,
      metadata: dto.phoneNumber ? { phoneNumber: dto.phoneNumber } : null,
    });

    await this.transactionRepository.save(transaction);

    // Credit wallet
    wallet.kesBalance = Number(wallet.kesBalance) + Number(dto.amount);
    await this.walletRepository.save(wallet);

    return transaction;
  }

  async withdraw(userId: string, dto: WithdrawDto): Promise<Transaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const available = Number(wallet.kesBalance) - Number(wallet.lockedBalance);

    if (dto.amount > available) {
      throw new BadRequestException('Insufficient available balance');
    }

    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      amount: dto.amount,
      currency: 'KES',
      reference: `WIT-${uuidv4().slice(0, 8).toUpperCase()}`,
      description: `Withdrawal via ${dto.paymentMethod}`,
      metadata: {
        ...(dto.phoneNumber && { phoneNumber: dto.phoneNumber }),
        ...(dto.cryptoAddress && { cryptoAddress: dto.cryptoAddress }),
      },
    });

    await this.transactionRepository.save(transaction);

    // Deduct from wallet
    wallet.kesBalance = Number(wallet.kesBalance) - Number(dto.amount);
    await this.walletRepository.save(wallet);

    return transaction;
  }

  async lockFunds(userId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    const available = Number(wallet.kesBalance) - Number(wallet.lockedBalance);

    if (amount > available) {
      throw new BadRequestException('Insufficient available balance to place bet');
    }

    wallet.lockedBalance = Number(wallet.lockedBalance) + amount;
    await this.walletRepository.save(wallet);
  }

  async unlockFunds(userId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.lockedBalance = Math.max(0, Number(wallet.lockedBalance) - amount);
    await this.walletRepository.save(wallet);
  }

  async creditWinnings(userId: string, amount: number, betId: string): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.kesBalance = Number(wallet.kesBalance) + amount;
    wallet.lockedBalance = Math.max(0, Number(wallet.lockedBalance) - amount);
    await this.walletRepository.save(wallet);

    await this.transactionRepository.save(
      this.transactionRepository.create({
        userId,
        type: TransactionType.BET_WON,
        status: TransactionStatus.COMPLETED,
        paymentMethod: PaymentMethod.INTERNAL,
        amount,
        currency: 'KES',
        reference: `WIN-${uuidv4().slice(0, 8).toUpperCase()}`,
        description: 'Bet winnings credited',
        relatedEntityId: betId,
      }),
    );
  }

  async getTransactions(userId: string, query: QueryTransactionsDto) {
    const { type, status, page = 1, limit = 20 } = query;

    const where: any = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionByReference(reference: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { reference, userId },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }
}
