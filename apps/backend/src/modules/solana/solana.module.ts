import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SolanaService } from './solana.service';
import { SolanaController } from './solana.controller';
import { User } from '../users/entities/user.entity';
import solanaConfig from '../../config/solana.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(solanaConfig),
  ],
  providers: [SolanaService],
  controllers: [SolanaController],
  exports: [SolanaService],
})
export class SolanaModule {}
