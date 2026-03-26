import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET_PLACED = 'bet_placed',
  BET_WON = 'bet_won',
  BET_REFUND = 'bet_refund',
  FEE = 'fee',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export enum PaymentMethod {
  MPESA = 'mpesa',
  CARD = 'card',
  CRYPTO = 'crypto',
  INTERNAL = 'internal',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.INTERNAL,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ default: 'KES' })
  currency: string;

  @Column({ nullable: true, type: 'varchar' })
  reference: string | null;

  @Column({ nullable: true, type: 'varchar' })
  externalReference: string | null;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  relatedEntityId: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
