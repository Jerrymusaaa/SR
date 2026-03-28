import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MarketsModule } from './modules/markets/markets.module';
import { BetsModule } from './modules/bets/bets.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { MpesaModule } from './modules/mpesa/mpesa.module';
import { SolanaModule } from './modules/solana/solana.module';
import { KycModule } from './modules/kyc/kyc.module';
import { User } from './modules/users/entities/user.entity';
import { Market } from './modules/markets/entities/market.entity';
import { Bet } from './modules/bets/entities/bet.entity';
import { Wallet } from './modules/wallet/entities/wallet.entity';
import { Transaction } from './modules/transactions/entities/transaction.entity';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mpesaConfig from './config/mpesa.config';
import solanaConfig from './config/solana.config';
import personaConfig from './config/persona.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, mpesaConfig, solanaConfig, personaConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [User, Market, Bet, Wallet, Transaction],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    MarketsModule,
    BetsModule,
    WalletModule,
    MpesaModule,
    SolanaModule,
    KycModule,
  ],
})
export class AppModule {}
