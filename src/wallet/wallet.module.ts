import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletRepository } from 'src/repositories/wallet.repository';
import { AccountRepository } from 'src/repositories/account.repository';
import { ReferalsRepository } from 'src/repositories/referals.repository';
import {
  SojournCreditsRepository,
  StaticSojournCreditsRepository,
} from 'src/repositories/credits.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletRepository,
    AccountRepository,
    ReferalsRepository,
    SojournCreditsRepository,
    StaticSojournCreditsRepository,
    GuestRepository,
    PaymentRepository,
  ],
})
export class WalletModule {}
