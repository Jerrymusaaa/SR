import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum KycStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  passwordHash: string | null;

  @Column({ nullable: true, type: 'varchar' })
  firstName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NONE,
  })
  kycStatus: KycStatus;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, type: 'varchar' })
  twoFactorSecret: string | null;

  @Column({ nullable: true, type: 'varchar' })
  refreshToken: string | null;

  @Column({ nullable: true, type: 'varchar' })
  googleId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
