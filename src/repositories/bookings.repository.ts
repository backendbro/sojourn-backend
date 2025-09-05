import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository, StaticBaseRepository } from './base.repository';
import { DataSource, Equal, Not, Or } from 'typeorm';
import { Booking as BookingEntity } from '../bookings/entities/booking.entity';
import { Booking, BookingStatus } from '../bookings/types';
import {
  transformBooking,
  transformHostBooking,
} from '../utils/bookings-utils';
import { CheckListingAvailabilityType } from '../properties/types';
import { PaymentStatus } from '../payments/types';
@Injectable({ scope: Scope.REQUEST })
export class BookingsRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async count() {
    const bookings = this.getRepository(BookingEntity);
    return await bookings.count();
  }

  async createBooking(booking: Booking) {
    const bookings = this.getRepository(BookingEntity);
    const bookingsObj = bookings.create(booking);
    return bookings.save(bookingsObj);
  }

  async getAllBookings() {
    const bookings = this.getRepository(BookingEntity);
    const results = await bookings.find({
      select: {
        id: true,
        checkIn: true,
        status: true,
        checkOut: true,
        numberOfAdults: true,
        numberOfChildren: true,
        numberOfInfants: true,
        bookingReference: true,
        createdAt: true,
        property: {
          title: true,
          price: true,
          photos: true,
        },
        guest: {
          firstName: true,
          profile: {
            primaryPhoneNumber: true,
          },
        },
        payment: {
          amount: true,
          createdAt: true,
          cautionFee: true,
          vat: true,
          transactionFee: true,
          sojournCreditsAmount: true,
        },
      },
      relations: {
        property: true,
        guest: true,
        payment: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return transformBooking(results);
  }

  async getUnFormattedBookingById(id: string) {
    const bookings = this.getRepository(BookingEntity);
    return await bookings.findOne({
      where: { id },
      select: { id: true, property: { id: true } },
      relations: { property: true },
    });
  }

  async getBookingsByHostId(id: string) {
    const bookings = this.getRepository(BookingEntity);
    const propertyBookings = await bookings.find({
      where: {
        property: {
          hostId: id,
        },
        payment: {
          paymentStatus: PaymentStatus.COMPLETED,
        },
      },
      select: {
        id: true,
        checkIn: true,
        status: true,
        checkOut: true,
        numberOfAdults: true,
        numberOfChildren: true,
        numberOfInfants: true,
        bookingReference: true,
        createdAt: true,
        property: {
          title: true,
          price: true,
          photos: true,
        },
        guest: {
          firstName: true,
          profile: {
            primaryPhoneNumber: true,
          },
        },
        payment: {
          amount: true,
          createdAt: true,
          cautionFee: true,
          vat: true,
          transactionFee: true,
          sojournCreditsAmount: true,
        },
      },
      relations: {
        property: true,
        guest: true,
        payment: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return transformHostBooking(propertyBookings);
  }

  async getBookingsByGuestId(id: string) {
    const bookings = this.getRepository(BookingEntity);
    const propertyBookings = await bookings.find({
      where: {
        guestId: id,
      },
      select: {
        id: true,
        checkIn: true,
        status: true,
        checkOut: true,
        bookingReference: true,
        numberOfAdults: true,
        numberOfChildren: true,
        numberOfInfants: true,
        holdingWindow: true,
        cryptoPaymentAmount: true,
        property: {
          title: true,
          hostId: true,
          photos: true,
        },
        guest: {
          firstName: true,
          profile: {
            primaryPhoneNumber: true,
          },
        },
        payment: {
          amount: true,
          createdAt: true,
          paymentMethod: true,
          crypto_pay_address: true,
          paymentStatus: true,
          vat: true,
          transactionFee: true,
          cautionFee: true,
          sojournCreditsAmount: true,
        },
      },
      relations: {
        property: true,
        guest: true,
        payment: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return transformBooking(propertyBookings);
  }

  async getBookingById(id: string) {
    const bookings = this.getRepository(BookingEntity);
    const booking = await bookings.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        bookingReference: true,
        checkIn: true,
        checkOut: true,
        status: true,
        numberOfAdults: true,
        numberOfChildren: true,
        numberOfInfants: true,
        cryptoPaymentAddress: true,
        credits: {
          id: true,
          amount: true,
          type: true,
        },
        property: {
          title: true,
          country: true,
          price: true,
          city: true,
          photos: true,
          contactEmail: true,
          contactName: true,
          street: true,
          houseNumber: true,
          hostId: true,
        },
        guest: {
          firstName: true,
          lastName: true,
          email: true,
          profile: {
            primaryPhoneNumber: true,
          },
        },
        payment: {
          amount: true,
          createdAt: true,
          paymentReference: true,
          paymentMethod: true,
          transactionFee: true,
          cautionFee: true,
          sojournCreditsAmount: true,
          vat: true,
        },
      },
      relations: {
        property: true,
        guest: true,
        payment: true,
        credits: true,
      },
    });
    return transformBooking(booking);
  }

  async getBookingForCancellationById(id: string) {
    const bookings = this.getRepository(BookingEntity);
    const booking = await bookings.findOne({
      where: {
        id,
        status: Not(BookingStatus.CANCELLED),
      },
      relations: ['guest.profile', 'property.host.profile'],
    });

    return booking;
  }

  async getHostBookingById(id: string) {
    const bookings = this.getRepository(BookingEntity);
    const booking = await bookings.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        bookingReference: true,
        checkIn: true,
        checkOut: true,
        status: true,
        numberOfAdults: true,
        numberOfChildren: true,
        numberOfInfants: true,
        property: {
          title: true,
          country: true,
          price: true,
          city: true,
          street: true,
          photos: true,
          houseNumber: true,
          hostId: true,
        },
        guest: {
          firstName: true,
          lastName: true,
          email: true,
          profile: {
            primaryPhoneNumber: true,
          },
        },
        payment: {
          amount: true,
          createdAt: true,
          paymentReference: true,
          cautionFee: true,
          sojournCreditsAmount: true,
          paymentMethod: true,
          transactionFee: true,
          vat: true,
        },
      },
      relations: {
        property: true,
        guest: true,
        payment: true,
      },
    });
    return transformHostBooking(booking);
  }

  async cancelBooking(id: string) {
    const booking = this.getRepository(BookingEntity);
    await booking.update(id, { status: BookingStatus.CANCELLED });
    const cancelledBooking = await booking.findOne({
      where: { id },
      relations: { guest: true, property: true },
    });
    return cancelledBooking;
  }

  async checkAvailabilityOfListing(values: CheckListingAvailabilityType) {
    const bookingRepository = this.getRepository(BookingEntity);
    const conflictingBooking = await bookingRepository
      .createQueryBuilder('booking')
      .where(
        'booking.propertyId = :propertyId AND booking.status <> :status AND booking.status <> :finishedStatus',
        {
          propertyId: values.propertyId,
          status: BookingStatus.CANCELLED,
          finishedStatus: BookingStatus.FINISHED,
        },
      )
      .andWhere(
        '(:checkIn >= booking.checkIn AND :checkIn <= booking.checkOut) OR ' +
          '(:checkIn <= booking.checkIn AND :checkOut >= booking.checkIn)',
        // '(:checkIn >= booking.checkIn AND :checkIn <= booking.checkOut) OR ' +
        //   '(:checkOut >= booking.checkIn AND :checkOut <= booking.checkOut) OR ' +
        //   '(:checkIn <= booking.checkIn AND :checkOut >= booking.checkOut)',
      )
      .setParameter('checkIn', new Date(values.checkInDate))
      .setParameter('checkOut', new Date(values.checkOutDate))
      .getOne();

    return !conflictingBooking;
  }
}

@Injectable()
export class StaticBookingsRepository extends StaticBaseRepository {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getAllBookings() {
    const repo = this.getRepository(BookingEntity);
    return await repo.find({
      where: { status: BookingStatus.PENDING },
      relations: ['payment'],
    });
  }

  async getAllPendingBookings() {
    const repo = this.getRepository(BookingEntity);
    return await repo.find({
      where: {
        status: Or(
          Equal(BookingStatus.PENDING),
          Equal(BookingStatus.PAID_PENDING),
        ),
        holdingWindow: null,
      },
      relations: ['guest', 'property.host.profile', 'payment'],
    });
  }

  async getAllNoConstraints() {
    const repo = this.getRepository(BookingEntity);
    return await repo.find({
      where: {
        payment: {
          paymentStatus: PaymentStatus.COMPLETED,
        },
      },

      relations: {
        payment: true,
      },
    });
  }

  async save(booking: BookingEntity) {
    const repo = this.getRepository(BookingEntity);
    await repo.save(booking);
  }
}
