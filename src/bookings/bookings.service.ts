import { Injectable, Logger } from '@nestjs/common';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import {
  BookingStatus,
  GuestBookingRejectionEvent,
  HostBookingRejectionEvent,
} from './types';
import { CheckListingAvailabilityType } from 'src/properties/types';
import { numberOfNights } from 'src/utils';
import { humazieUuid, SingleBookingView } from 'src/utils/bookings-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
// import PDFDocument from 'pdfkit';
import PDFDocument from 'pdfkit-table';
import axios from 'axios';

@Injectable()
export class BookingsService {
  constructor(
    private bookingsRepository: BookingsRepository,
    private guestRepository: GuestRepository,
    private propertyRepository: PropertiesRepository,
    private paymentRepository: PaymentRepository,
    private eventEmmitter: EventEmitter2,
  ) {}

  async getBookingsByHostId(id: string) {
    return await this.bookingsRepository.getBookingsByHostId(id);
  }

  async getBookingsByGuestId(id: string) {
    return await this.bookingsRepository.getBookingsByGuestId(id);
  }

  async getBookingById(id: string) {
    return await this.bookingsRepository.getBookingById(id);
  }

  async getAllBookings() {
    return await this.bookingsRepository.getAllBookings();
  }

  async getHostBookingById(id: string) {
    return await this.bookingsRepository.getHostBookingById(id);
  }

  async cancelBooking(id: string) {
    const existingBooking =
      await this.bookingsRepository.getBookingForCancellationById(id);

    const address = `${existingBooking.property.houseNumber}, ${existingBooking.property.street} ${existingBooking.property.zip} ${existingBooking.property.city}`;

    const checkIn = new Date(existingBooking.checkIn);
    const checkOut = new Date(existingBooking.checkOut);

    const checkInDate = new Date(checkIn).toDateString();
    const checkOutDate = new Date(checkOut).toDateString();

    const nightsSpent = numberOfNights(checkIn, checkOut);

    const numberOfGuests =
      existingBooking.numberOfAdults +
      existingBooking.numberOfChildren +
      existingBooking.numberOfInfants;

    const hostPhoneNumber = existingBooking.property.contactPhoneNumber;
    const guestPhoneNumber = existingBooking.guest.profile.primaryPhoneNumber
      ? existingBooking.guest.profile.primaryPhoneNumber
      : '';

    if (existingBooking) {
      const booking = await this.bookingsRepository.cancelBooking(id);
      const guestBookingRejected: GuestBookingRejectionEvent = {
        email: existingBooking.guest.email,
        lodgingType: existingBooking.property.typeOfProperty,
        lodgingImage: existingBooking.property.photos[0],
        hostFullName: `${existingBooking.property.host.firstName} ${existingBooking.property.host.lastName}`,
        hostPhoneNumber: hostPhoneNumber,
        propertyRSId: humazieUuid(existingBooking.id),
        lodgingCity: existingBooking.property.city,
        lodgingFullAddress: address,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        lodgingDuration: nightsSpent,
        audience: String(numberOfGuests),
      };

      const hostBookingRejected: HostBookingRejectionEvent = {
        email: existingBooking.property.host.email,
        lodgingType: existingBooking.property.typeOfProperty,
        lodgingImage: existingBooking.property.photos[0],
        guestFullName: `${existingBooking.guest.firstName} ${existingBooking.guest.lastName}`,
        guestPhoneNumber,
        propertyRSId: humazieUuid(existingBooking.id),
        lodgingCity: existingBooking.property.city,
        lodgingFullAddress: address,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        hostPhoneNumber: hostPhoneNumber,
        lodgingDuration: nightsSpent,
        audience: String(numberOfGuests),
      };

      this.eventEmmitter.emit('guest.booking.rejected', guestBookingRejected);
      this.eventEmmitter.emit('host.booking.rejected', hostBookingRejected);
      return booking;
    }
    Logger.log(new Error('Invalid operation: Booking already cancelled'));
    throw new Error('Invalid operation: Booking already cancelled');
  }

  async checkListingAvailability(values: CheckListingAvailabilityType) {
    return await this.bookingsRepository.checkAvailabilityOfListing(values);
  }

  async downloadHostBookingInvoice(id: string, res: Response) {
    const booking = (await this.bookingsRepository.getHostBookingById(
      id,
    )) as SingleBookingView;

    const doc = new PDFDocument();

    res.setHeader(
      'Content-disposition',
      `attachment; filename="${booking.bookingReference}.pdf"`,
    );
    res.setHeader('Content-type', 'application/pdf');

    const tableTop = 150;

    doc.pipe(res);

    const response = await axios.get(
      'https://sojourn-v1-assets.s3.eu-north-1.amazonaws.com/public/images/emails/Sojourn-logo-red.png',
      {
        responseType: 'arraybuffer',
      },
    );
    const imgBuffer = Buffer.from(response.data, 'binary');
    doc.image(imgBuffer, 50, 45, { width: 100 }).moveDown();

    doc.registerFont('DejaVu', 'font/DejaVuSans.ttf');

    doc.font('DejaVu');
    // const response = await axios.get(booking.photo, {
    //   responseType: 'arraybuffer',
    // });
    // const imgBuffer = Buffer.from(response.data, 'binary');
    // doc.image(imgBuffer, 380, 45, { width: 150 }).moveDown();

    doc.font('DejaVu', 14).text('Booking Details', 50, 100).moveDown();

    doc
      .fontSize(14)
      .text(`Reference: ${booking.bookingReference}`, 50, 140)
      .moveDown();

    doc
      .font('DejaVu', 14)
      .text(`Status: ${booking.status}`, 50, 180)
      .fontSize(14)
      .moveDown();

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    const data = [
      ['Property', booking.propertyTitle],
      ['Check in', booking.checkInDate],
      ['Check out', booking.checkOutDate],
      ['Address', booking.location],
      ['Base price', `₦${booking.priceOfProperty}`],
      ['Number of adults', `${booking.numberOfAdults}`],
      ['Number of children', `${booking.numberOfChildren}`],
      ['Number of infants', `${booking.numberOfInfants}`],
      ['Guest name', booking.guestName],
      ['Guest phone number', booking.guestPhone],
      ['Date of payment', booking.paymentDate],
      ['Method of payment', booking.paymentMethod],
      ['Service fee', `₦${booking.serviceFee}`],
      ['VAT', `₦${booking.vat}`],
      ['Total', `₦${booking.total}`],
    ];

    let table = {
      headers: ['#', '#'],
      rows: data,
      options: {
        hideHeader: true,
        padding: 5, // {Number} default: 0
        columnSpacing: 5,
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font('DejaVu').fontSize(10);
        },
      },
      divider: {
        header: { disabled: false, width: 2, opacity: 1 },
        horizontal: { disabled: false, width: 4, opacity: 1 },
      },
      columnSize: [200, 300],
    };

    await doc.table(table, {
      width: 450,
    });

    doc
      .font('DejaVu')
      .fontSize(10)
      .text(`Date created: ${new Date().toLocaleDateString()}`, 50, 600)
      .moveDown();

    doc.end();
  }

  async downloadGuestBookingInvoice(id: string, res: Response) {
    const booking = (await this.bookingsRepository.getBookingById(
      id,
    )) as SingleBookingView;

    const doc = new PDFDocument();

    res.setHeader(
      'Content-disposition',
      `attachment; filename="${booking.bookingReference}.pdf"`,
    );
    res.setHeader('Content-type', 'application/pdf');

    const tableTop = 150;

    doc.pipe(res);

    const response = await axios.get(
      'https://sojourn-v1-assets.s3.eu-north-1.amazonaws.com/public/images/emails/Sojourn-logo-red.png',
      {
        responseType: 'arraybuffer',
      },
    );
    const imgBuffer = Buffer.from(response.data, 'binary');
    doc.image(imgBuffer, 50, 45, { width: 100 }).moveDown();

    doc.registerFont('DejaVu', 'font/DejaVuSans.ttf');

    doc.font('DejaVu');
    // const response = await axios.get("https://sojourn-v1-assets.s3.eu-north-1.amazonaws.com/public/images/emails/Sojourn-logo-red.png", {
    //   responseType: 'arraybuffer',
    // });
    // const imgBuffer = Buffer.from(response.data, 'binary');
    // doc.image(imgBuffer, 380, 45, { width: 150 }).moveDown();

    doc.font('DejaVu', 14).text('Booking Details', 50, 100).moveDown();

    doc
      .fontSize(14)
      .text(`Reference: ${booking.bookingReference}`, 50, 140)
      .moveDown();

    doc
      .font('DejaVu', 14)
      .text(`Status: ${booking.status}`, 50, 180)
      .fontSize(14)
      .moveDown();

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    const data = [
      ['Property', booking.propertyTitle],
      ['Check in', booking.checkInDate],
      ['Check out', booking.checkOutDate],
      ['Address', booking.location],
      ['Base price', `₦${booking.priceOfProperty}`],
      ['Number of adults', `${booking.numberOfAdults}`],
      ['Number of children', `${booking.numberOfChildren}`],
      ['Number of infants', `${booking.numberOfInfants}`],
      ['Host name', booking.contactName],
      ['Host email', booking.contactEmail],
      ['Date of payment', booking.paymentDate],
      ['Method of payment', booking.paymentMethod],
      ['Service fee', `₦${booking.serviceFee}`],
      ['VAT', `₦${booking.vat}`],
      ['Total', `₦${booking.total}`],
    ];

    let table = {
      headers: ['#', '#'],
      rows: data,
      options: {
        hideHeader: true,
        padding: 5, // {Number} default: 0
        columnSpacing: 5,
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font('DejaVu').fontSize(10);
        },
      },
      divider: {
        header: { disabled: false, width: 2, opacity: 1 },
        horizontal: { disabled: false, width: 4, opacity: 1 },
      },
      columnSize: [200, 300],
    };

    await doc.table(table, {
      width: 450,
    });

    doc
      .font('DejaVu')
      .fontSize(10)
      .text(`Date created: ${new Date().toLocaleDateString()}`, 50, 600)
      .moveDown();

    doc.end();
  }
}
