import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Market } from '../../markets/entities/market.entity';

export enum BetPosition {
  YES = 'yes',
  NO = 'no',
}

export enum BetStatus {
  ACTIVE = 'active',
  WON = 'won',
  LOST = 'lost',
  REFUNDED = 'refunded',
}

@Entity('bets')
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Market, (market) => market.bets, { eager: false })
  @JoinColumn({ name: 'market_id' })
  market: Market;

  @Column()
  marketId: string;

  @Column({
    type: 'enum',
    enum: BetPosition,
  })
  position: BetPosition;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  potentialPayout: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  oddsAtBet: number;

  @Column({
    type: 'enum',
    enum: BetStatus,
    default: BetStatus.ACTIVE,
  })
  status: BetStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  payout: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
