import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bet } from '../../bets/entities/bet.entity';

export enum MarketStatus {
  PENDING = 'pending',
  OPEN = 'open',
  CLOSED = 'closed',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

export enum MarketCategory {
  POLITICS = 'politics',
  SPORTS = 'sports',
  FINANCE = 'finance',
  ENTERTAINMENT = 'entertainment',
  TECHNOLOGY = 'technology',
  OTHER = 'other',
}

export enum MarketOutcome {
  YES = 'yes',
  NO = 'no',
  UNRESOLVED = 'unresolved',
}

@Entity('markets')
export class Market {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({
    type: 'enum',
    enum: MarketCategory,
    default: MarketCategory.OTHER,
  })
  category: MarketCategory;

  @Column({
    type: 'enum',
    enum: MarketStatus,
    default: MarketStatus.PENDING,
  })
  status: MarketStatus;

  @Column({
    type: 'enum',
    enum: MarketOutcome,
    default: MarketOutcome.UNRESOLVED,
  })
  outcome: MarketOutcome;

  @Column({ type: 'timestamptz' })
  resolutionDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalYesAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalNoAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalVolume: number;

  @Column({ nullable: true, type: 'varchar' })
  resolutionSource: string | null;

  @Column({ nullable: true, type: 'text' })
  resolutionNotes: string | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creatorId: string;

  @OneToMany(() => Bet, (bet) => bet.market)
  bets: Bet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
