import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { ConfigService } from '@nestjs/config';
import {
  BookingsRepository,
  StaticBookingsRepository,
} from 'src/repositories/bookings.repository';
import {
  PaymentRepository,
  StaticPaymentRepository,
} from 'src/repositories/payment.repository';
import {
  ReferalsRepository,
  StaticReferalsRepository,
} from 'src/repositories/referals.repository';
import {
  SojournCreditsRepository,
  StaticSojournCreditsRepository,
} from 'src/repositories/credits.repository';
import { TasksService } from 'src/tasks/tasks.service';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { SubscriptionRepository } from 'src/repositories/subscription.repository';
import { SubscriptionPaymentsRepository } from 'src/repositories/subscription-payments.repository';
import { BookingsService } from 'src/bookings/bookings.service';
import { BookingEventsController } from 'src/bookings/events/BookingEventsController.event';
import { EmailServiceService } from 'src/email-service/email-service.service';
import { SubscriptionEventsController } from './events/PaymentsEventController';
import { WalletRepository } from 'src/repositories/wallet.repository';
import { RatesRepository } from 'src/repositories/rates.repository';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PropertiesRepository,
    GuestRepository,
    HostsRepository,
    BookingsRepository,
    PaymentRepository,
    ConfigService,
    ReferalsRepository,
    SojournCreditsRepository,
    TasksService,
    SubscriptionRepository,
    SubscriptionPaymentsRepository,
    BookingsService,
    EmailServiceService,
    BookingEventsController,
    SubscriptionEventsController,
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
  exports: [PaymentsService],
})
export class PaymentsModule {}
