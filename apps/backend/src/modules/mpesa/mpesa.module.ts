import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MpesaService } from './mpesa.service';
import { MpesaController } from './mpesa.controller';
import { Transaction } from '../transactions/entities/transaction.entity';
import { WalletModule } from '../wallet/wallet.module';
import mpesaConfig from '../../config/mpesa.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    WalletModule,
    ConfigModule.forFeature(mpesaConfig),
  ],
  providers: [MpesaService],
  controllers: [MpesaController],
  exports: [MpesaService],
})
export class MpesaModule {}
