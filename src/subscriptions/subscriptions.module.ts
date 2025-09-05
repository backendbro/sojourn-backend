import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionRepository } from 'src/repositories/subscription.repository';
import { SubscriptionPaymentsRepository } from 'src/repositories/subscription-payments.repository';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from 'src/payments/payments.service';
import { BookingsService } from 'src/bookings/bookings.service';
import { EmailServiceService } from 'src/email-service/email-service.service';
import {
  BookingsRepository,
  StaticBookingsRepository,
} from 'src/repositories/bookings.repository';
import {
  SojournCreditsRepository,
  StaticSojournCreditsRepository,
} from 'src/repositories/credits.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import {
  PaymentRepository,
  StaticPaymentRepository,
} from 'src/repositories/payment.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import {
  ReferalsRepository,
  StaticReferalsRepository,
} from 'src/repositories/referals.repository';
import { TasksService } from 'src/tasks/tasks.service';
import { WalletRepository } from 'src/repositories/wallet.repository';
import { RatesRepository } from 'src/repositories/rates.repository';

@Module({
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionRepository,
    SubscriptionPaymentsRepository,
    HostsRepository,
    ConfigService,
    PaymentsService,
    PaymentsService,
    PropertiesRepository,
    GuestRepository,
    HostsRepository,
    BookingsRepository,
    PaymentRepository,
    ConfigService,
    ReferalsRepository,
    SojournCreditsRepository,
    EmailServiceService,
    TasksService,
    SubscriptionRepository,
    SubscriptionPaymentsRepository,
    BookingsService,
    WalletRepository,
    RatesRepository,
    {
      provide: 'StaticSojournCreditsRepository', // Use a unique token
      useClass: StaticSojournCreditsRepository,
    },
    {
      provide: 'StaticReferalsRepository', // Use a unique token
      useClass: StaticReferalsRepository,
    },
    {
      provide: 'StaticPaymentRepository', // Use a unique token
      useClass: StaticPaymentRepository,
    },
    { provide: 'StaticBookingsRepository', useClass: StaticBookingsRepository },
  ],
})
export class SubscriptionsModule {}
