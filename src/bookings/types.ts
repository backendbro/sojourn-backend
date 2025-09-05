import {
  GuestBookingConfirmationEmailTemplateParams,
  GuestBookingRejectionEmailTemplateParams,
  HostBookingConfirmationEmailTemplateParams,
  HostBookingRejectionEmailTemplateParams,
  UpcomingBookingReminderEmailTemplateParams,
} from 'src/email-service/email-service.types';

export enum BookingStatus {
  PENDING,
  PAID_PENDING,
  PROCESSING,
  FINISHED,
  CANCELLED,
}

export interface Booking {
  propertyId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  status: BookingStatus;
  holdingWindow?: Date;
  cryptoPaymentAddress?: string;
  cryptoPaymentAmount?: number;
}

export interface HostBookingConfirmationEvent
  extends HostBookingConfirmationEmailTemplateParams {}

export interface HostBookingRejectionEvent
  extends HostBookingRejectionEmailTemplateParams {}

export interface GuestBookingConfirmationEvent
  extends GuestBookingConfirmationEmailTemplateParams {}

export interface GuestBookingRejectionEvent
  extends GuestBookingRejectionEmailTemplateParams {}

export interface UpcomingBookingReminderEvent
  extends UpcomingBookingReminderEmailTemplateParams {}
