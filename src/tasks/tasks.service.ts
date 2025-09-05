import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import axios from 'axios';
import { CronJob } from 'cron';
import {
  BookingStatus,
  UpcomingBookingReminderEvent,
} from 'src/bookings/types';
import { NOW_PAYMENTS_CONFIRMATION_URL } from 'src/constants';
import { Payment } from 'src/payments/entities/payment.entity';
import {
  NowPaymentsConfirmationType,
  PaymentMethod,
  PaymentStatus,
} from 'src/payments/types';
import { ReferalStatus } from 'src/referals/types';
import { StaticBookingsRepository } from 'src/repositories/bookings.repository';
import { StaticSojournCreditsRepository } from 'src/repositories/credits.repository';
import { StaticPaymentRepository } from 'src/repositories/payment.repository';
import { StaticReferalsRepository } from 'src/repositories/referals.repository';
import { numberOfNights } from 'src/utils';
import { SojournCreditsStatus } from 'src/wallet/types';

@Injectable()
export class TasksService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @Inject('StaticPaymentRepository')
    private readonly paymentRepo: StaticPaymentRepository,
    @Inject('StaticReferalsRepository')
    private readonly referrals: StaticReferalsRepository,
    @Inject('StaticSojournCreditsRepository')
    private readonly credits: StaticSojournCreditsRepository,
    @Inject('StaticBookingsRepository')
    private readonly bookings: StaticBookingsRepository,
    private emiiter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleBookingsInProgress() {
    const bookings = await this.bookings.getAllNoConstraints();
    if (bookings.length) {
      await Promise.all(
        bookings.map(async (booking) => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          const now = new Date();
          if (
            checkIn.getTime() <= now.getTime() &&
            checkOut > now &&
            booking.status !== BookingStatus.CANCELLED
          ) {
            booking.status = BookingStatus.PROCESSING;
            booking.holdingWindow = null;
            return await this.bookings.save(booking);
          }

          if (
            checkIn.getTime() > now.getTime() &&
            booking.status !== BookingStatus.CANCELLED
          ) {
            booking.status = BookingStatus.PAID_PENDING;
            booking.holdingWindow = null;
            return await this.bookings.save(booking);
          }
        }),
      );
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleFinshedBookings() {
    const bookings = await this.bookings.getAllNoConstraints();

    if (bookings.length) {
      await Promise.all(
        bookings.map(async (booking) => {
          const bcDate = new Date(booking.checkOut);
          const now = new Date();
          if (
            now.getTime() >= bcDate.getTime() &&
            booking.status !== BookingStatus.CANCELLED
          ) {
            booking.holdingWindow = null;
            booking.status = BookingStatus.FINISHED;
            return await this.bookings.save(booking);
          }
        }),
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleBookingsReminder() {
    const bookings = await this.bookings.getAllPendingBookings();
    if (bookings.length) {
      for (const booking of bookings) {
        if (booking.payment.paymentStatus === PaymentStatus.COMPLETED) {
          const bDate = new Date(booking.checkIn);
          const now = new Date();
          const cancellationDate = new Date(
            bDate.getTime() - 86400000 * 2,
          ).toString();

          const hostFullName = `${booking.property.host.firstName} ${booking.property.host.lastName}`;

          const nights = numberOfNights(now, bDate);

          if (nights <= 3 && nights > 0) {
            const upcomingBooking: UpcomingBookingReminderEvent = {
              propertyRSId: booking.id,
              lodgingCity: booking.property.city,
              lodgingFullAddress: `${booking.property.houseNumber} ${booking.property.street}, ${booking.property.zip}`,
              checkInDate: new Date(booking.checkIn).toDateString(),
              checkOutDate: new Date(booking.checkOut).toDateString(),
              hostPhoneNumber: booking.property.host.profile.primaryPhoneNumber,
              lodgingDuration: numberOfNights(
                new Date(booking.checkIn),
                new Date(booking.checkOut),
              ),
              audience: String(
                booking.numberOfAdults +
                  booking.numberOfChildren +
                  booking.numberOfInfants,
              ),
              email: booking.guest.email,
              freeCancelDate: cancellationDate,
              hostFullName: hostFullName,
            };
            this.emiiter.emit('booking.reminder', upcomingBooking);
          }
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCancelBookings() {
    const bookings = await this.bookings.getAllBookings();
    if (bookings.length) {
      await Promise.all(
        bookings.map(async (booking) => {
          if (
            !booking.holdingWindow ||
            booking.payment.paymentStatus === PaymentStatus.COMPLETED ||
            booking.cryptoPaymentAddress
          )
            return;
          const window = new Date(booking?.holdingWindow);
          const now = new Date();
          if (window.getTime() <= now.getTime()) {
            booking.status = BookingStatus.CANCELLED;
            booking.holdingWindow = null;
            return await this.bookings.save(booking);
          }
        }),
      );
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCancelCryptoBookings() {
    const bookings = await this.bookings.getAllBookings();
    if (bookings.length) {
      await Promise.all(
        bookings.map(async (booking) => {
          if (
            !booking.holdingWindow ||
            booking.payment.paymentStatus === PaymentStatus.COMPLETED ||
            !booking.cryptoPaymentAddress
          )
            return;
          const window = new Date(booking?.holdingWindow);
          const now = new Date();
          if (window.getTime() <= now.getTime()) {
            booking.status = BookingStatus.CANCELLED;
            booking.holdingWindow = null;
            return await this.bookings.save(booking);
          }
        }),
      );
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleUpdateCryptoPaymentsToPaid() {
    const transactions = await this.paymentRepo.getAll();
    await Promise.all(
      transactions.map(async (t) => {
        if (
          t.paymentMethod === PaymentMethod.CRYPTO &&
          t.paymentStatus === PaymentStatus.PENDING &&
          t.booking.holdingWindow
        ) {
          let status = '';
          try {
            const response = await axios.get<NowPaymentsConfirmationType>(
              ` ${NOW_PAYMENTS_CONFIRMATION_URL}${t.paystackReference}`,
              {
                headers: {
                  'x-api-key': process.env.NOW_PAYMENTS_API_KEY,
                  'Content-Type': 'application/json',
                },
              },
            );

            status = response.data.payment_status;
          } catch (error) {
            Logger.log(error);
            throw new BadRequestException(error.message);
          }

          let payment: Payment;
          if (status === 'finished') {
            payment = await this.paymentRepo.getPaymentByReference(
              t.paystackReference,
            );
            payment.paymentStatus = PaymentStatus.COMPLETED;
            return await this.paymentRepo.save(payment);
          }
        }
      }),
    );
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleUpdatePayments() {
    const transactions = await this.paymentRepo.getAll();

    const fulfilledTransactions = transactions.filter(
      (t) => t.paymentStatus === PaymentStatus.COMPLETED,
    );

    const transactionPromises = fulfilledTransactions.map(async (ft) => {
      const ref = await this.referrals.getReferalByUserReference(
        ft.paystackReference,
      );
      ref.paystackStatus = ReferalStatus.PAID;
      return this.referrals.save(ref);
    });

    await Promise.allSettled(transactionPromises);

    const sojournCredits = fulfilledTransactions.map(async (ft) => {
      const sc = await this.credits.getSingleSojournCreditByPayStackReference(
        ft.paystackReference,
      );
      if (sc) {
        sc.status = SojournCreditsStatus.CONFIRMED;
        return this.credits.save(sc);
      }
    });

    await Promise.allSettled(sojournCredits);
  }

  addCronJobValidateCryptoPayment(
    name: string,
    cronTime: string,
    paymentId: string,
  ) {
    try {
      if (!this.schedulerRegistry.doesExist('cron', paymentId)) {
        this.jobScheduler(cronTime, paymentId, name);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async jobScheduler(cronTime: string, paymentId: string, name: string) {
    const job = new CronJob(cronTime, async () => {
      let status = null;
      try {
        const response = await axios.get<NowPaymentsConfirmationType>(
          ` ${NOW_PAYMENTS_CONFIRMATION_URL}${paymentId}`,
          {
            headers: {
              'x-api-key': process.env.NOW_PAYMENTS_API_KEY,
              'Content-Type': 'application/json',
            },
          },
        );

        status = response.data.payment_status;
      } catch (error) {
        throw new BadRequestException(error.message);
      }

      let payment: Payment;
      if (status === 'finished') {
        payment = await this.paymentRepo.getPaymentByReference(paymentId);
        payment.paymentStatus = PaymentStatus.COMPLETED;
        await this.paymentRepo.save(payment);
        this.deleteCronJob(name);
      }

      const isBookingWindowExpired = payment?.booking?.holdingWindow
        ? new Date(payment.booking.holdingWindow).getTime() <=
          new Date().getTime()
        : false;
      if (isBookingWindowExpired) {
        this.deleteCronJob(name);
      }
    });
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    console.log(`Job ${name} started`);
  }

  deleteCronJob(name: string) {
    try {
      this.schedulerRegistry.deleteCronJob(name);
      console.log(`Job ${name} deleted`);
    } catch (error) {
      console.error(error);
    }
  }
}
