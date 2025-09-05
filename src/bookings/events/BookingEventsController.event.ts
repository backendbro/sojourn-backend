import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailServiceService } from 'src/email-service/email-service.service';
import {
  GuestBookingConfirmationEvent,
  GuestBookingRejectionEvent,
  HostBookingConfirmationEvent,
  HostBookingRejectionEvent,
  UpcomingBookingReminderEvent,
} from '../types';

@Injectable()
export class BookingEventsController {
  constructor(private emailService: EmailServiceService) {}

  @OnEvent('guest.booking.created')
  async handleGuestBookingConfirmed(payload: GuestBookingConfirmationEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'GuestBookingConfirmationEmailTemplate',
      payload,
    );
  }

  @OnEvent('guest.booking.rejected')
  async handleGuestBookingRejected(payload: GuestBookingRejectionEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'GuestBookingRejectionEmailTemplate',
      payload,
    );
  }

  @OnEvent('host.booking.created')
  async handleHostBookingConfirmed(payload: HostBookingConfirmationEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'HostBookingConfirmationEmailTemplate',
      payload,
    );
  }

  @OnEvent('host.booking.rejected')
  async handleHostBookingRejected(payload: HostBookingRejectionEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'HostBookingRejectionEmailTemplate',
      payload,
    );
  }

  @OnEvent('booking.reminder')
  async handleBookingsReminder(payload: UpcomingBookingReminderEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'UpcomingBookingReminderEmailTemplate',
      payload,
    );
  }
}
