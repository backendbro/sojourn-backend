import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import {
  BookingsRepository,
  StaticBookingsRepository,
} from 'src/repositories/bookings.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { EmailServiceModule } from 'src/email-service/email-service.module';
import { BookingEventsController } from './events/BookingEventsController.event';

@Module({
  imports: [EmailServiceModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsRepository,
    GuestRepository,
    PaymentRepository,
    PropertiesRepository,
    BookingEventsController,
    StaticBookingsRepository,
    BookingEventsController,
  ],
})
export class BookingsModule {}
