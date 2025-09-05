import { PaymentMethod, PaymentStatus } from 'src/payments/types';
import { numberOfNights } from '.';
import { SojournCreditsType } from 'src/wallet/types';
import { BookingStatus as BookingStatusType } from 'src/bookings/types';

type BookingStatus =
  | 'confirmed'
  | 'in-progress'
  | 'pending'
  | 'cancelled'
  | 'completed';

type BookingRowShape =
  | {
      propertyTitle: string;
      id: string;
      checkInAndOut: string;
      people: number;
      isBookingCancellable: boolean;
      status: BookingStatus;
      hostId: string;
      guestName: string;
      holdingWindow: string;
      guestPhone: string;
      payment: number;
      paymentDate: string;
      photo: string;
      downloadUrl: string;
      bookingReference: string;
      date: string;
      cryptoPaymentAddress?: string;
      cryptoPaymentAmount?: number;
    }
  | undefined;

export type SingleBookingView = {
  propertyTitle: string;
  id: string;
  hostId?: string;
  checkInDate: string;
  priceOfProperty: number;
  checkOutDate: string;
  numberOfInfants: number;
  numberOfChildren: number;
  numberOfAdults: number;
  location: string;
  guestEmail: string;
  status: BookingStatus;
  photo: string;
  guestName: string;
  guestPhone: string;
  payment: number;
  paymentDate: string;
  downloadUrl: string;
  holdingWindow: string;
  serviceFee: number;
  paymentMethod: string;
  paymentReference: string;
  contactName: string;
  contactEmail: string;
  bookingReference: string;
  total: number;
  vat: number;
  credits?: number;
};

export function transformBooking(bookings) {
  if (Array.isArray(bookings)) {
    const results = bookings.map((booking) => {
      const bDate = new Date(booking.checkIn);
      const now = new Date();
      const isCancellationWindowOpen = numberOfNights(now, bDate) >= 2;

      if (
        booking?.payment?.paymentStatus !== PaymentStatus.COMPLETED &&
        booking.status === BookingStatusType.CANCELLED
      )
        return undefined;
      return {
        id: booking.id,
        propertyTitle: booking.property.title,
        checkInAndOut: `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`,
        people:
          +booking.numberOfAdults +
          +booking.numberOfChildren +
          +booking.numberOfInfants,
        status: checkBookingStatus(booking.status),
        guestName: booking.guest.firstName,
        guestPhone: 'No phone',
        cryptoPaymentAddress: booking?.payment?.crypto_pay_address
          ? booking.payment.crypto_pay_address
          : '',
        // payment: booking?.payment?.amount
        //   ? booking.payment.amount * numberOfNightsSpent +
        //     (0.075 * (booking.payment.amount * numberOfNightsSpent) +
        //       0.03 * (booking.payment.amount * numberOfNightsSpent))
        //   : 0,
        payment: booking.payment.amount,
        paymentDate: booking?.payment
          ? new Date(booking.payment.createdAt).toDateString()
          : '',
        downloadUrl: `https://localhost:3000/bookings/download/${booking.id}`,
        bookingReference: formatReference(booking.bookingReference),
        hostId: booking.property.hostId,
        date: new Date(booking.createdAt).toDateString(),
        holdingWindow:
          booking.payment.paymentMethod === PaymentMethod.CRYPTO &&
          booking.status !== BookingStatusType.CANCELLED
            ? booking.holdingWindow
              ? booking.holdingWindow
              : ''
            : '',
        cryptoPaymentAmount: booking.cryptoPaymentAmount,
        isBookingCancellable: isCancellationWindowOpen,
        photo: booking.property ? booking.property.photos[0] : '',
      } as BookingRowShape;
    });

    const filteredResults = results.filter((r) => r !== undefined);

    return filteredResults;
  } else {
    let credit = 0;
    if (bookings.credits) {
      bookings.credits.forEach((c) => {
        if (c.type === SojournCreditsType.OUTGOING) {
          credit += c.amount;
        }
      });
    }

    return {
      propertyTitle: bookings.property.title,
      checkInDate: new Date(bookings.checkIn).toLocaleDateString(),
      checkOutDate: new Date(bookings.checkOut).toLocaleDateString(),
      location: `${bookings.property.houseNumber}, ${bookings.property.street} ${bookings.property.city}, ${bookings.property.country}`,
      priceOfProperty: bookings.property.price,
      numberOfAdults: bookings.numberOfAdults,
      numberOfChildren: bookings.numberOfChildren,
      numberOfInfants: bookings.numberOfInfants,
      status: checkBookingStatus(bookings.status),
      guestName: `${bookings.guest.firstName} ${bookings.guest.lastName}`,
      guestPhone: 'no phone',
      guestEmail: bookings.guest.email,
      payment: bookings?.payment?.amount ?? 0,
      paymentDate: new Date(bookings.payment.createdAt).toLocaleDateString(),
      serviceFee: +bookings.payment.transactionFee,
      vat: bookings?.payment ? +bookings.payment.vat : 0,
      paymentMethod: bookings.payment.paymentMethod,
      paymentReference: formatReference(bookings.payment.paymentReference),
      bookingReference: formatReference(bookings.bookingReference),
      hostId: bookings.property.hostId,
      total: +bookings.payment.amount,
      holdingWindow:
        bookings.payment.paymentMethod === PaymentMethod.CRYPTO
          ? bookings.holdingWindow
            ? new Date(bookings.holdingWindow).toDateString()
            : ''
          : '',
      credits: +credit,
      photo: bookings.property ? bookings.property.photos[0] : '',
      contactName: bookings.property ? bookings.property.contactName : '',
      contactEmail: bookings.property ? bookings.property.contactEmail : '',
    } as SingleBookingView;
  }
}

export function transformHostBooking(bookings) {
  if (Array.isArray(bookings)) {
    const results = bookings.map((booking) => {
      const numberOfNightsSpent = numberOfNights(
        new Date(booking.checkIn),
        new Date(booking.checkOut),
      );

      const bDate = new Date(booking.checkIn);
      const now = new Date();
      const isCancellationWindowOpen = numberOfNights(now, bDate) >= 2;

      let payment =
        +booking?.payment?.amount -
        +booking.payment.vat -
        +booking.payment.transactionFee;
      if (booking.payment.sojournCreditsAmount) {
        payment -= Number(booking.payment.sojournCreditsAmount);
      }
      if (booking.payment.cautionFee) {
        payment -= Number(booking.payment.cautionFee);
      }

      return {
        id: booking.id,
        propertyTitle: booking.property.title,
        checkInAndOut: `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`,
        people:
          +booking.numberOfAdults +
          +booking.numberOfChildren +
          +booking.numberOfInfants,
        status: checkBookingStatus(booking.status),
        guestName: booking.guest.firstName,
        guestPhone: 'no phone',
        payment,
        paymentDate: booking?.payment
          ? new Date(booking.payment.createdAt).toDateString()
          : '',
        downloadUrl: `https://localhost:3000/bookings/download/${booking.id}`,
        bookingReference: formatReference(booking.bookingReference),
        hostId: booking.property.hostId,
        date: new Date(booking.createdAt).toDateString(),
        holdingWindow:
          booking.payment.paymentMethod === PaymentMethod.CRYPTO
            ? booking.holdingWindow
              ? new Date(booking.holdingWindow).toDateString()
              : ''
            : '',
        isBookingCancellable: isCancellationWindowOpen,
        photo: booking.property ? booking.property.photos[0] : '',
      } as BookingRowShape;
    });

    return results;
  } else {
    const numberOfNightsSpent = numberOfNights(
      new Date(bookings.checkIn),
      new Date(bookings.checkOut),
    );

    let payment =
      +bookings?.payment?.amount -
      +bookings.payment.vat -
      +bookings.payment.transactionFee;
    if (bookings.payment.sojournCreditsAmount) {
      payment -= Number(bookings.payment.sojournCreditsAmount);
    }
    if (bookings.payment.cautionFee) {
      payment -= Number(bookings.payment.cautionFee);
    }

    let whatYouEarn = 0;
    let transactionFee = 0;
    let vat = 0;

    if (payment) transactionFee = 0.02 * payment;

    if (payment) vat = 0.075 * payment;

    if (payment) whatYouEarn = payment - transactionFee;

    return {
      propertyTitle: bookings.property.title,
      checkInDate: new Date(bookings.checkIn).toLocaleDateString(),
      checkOutDate: new Date(bookings.checkOut).toLocaleDateString(),
      location: `${bookings.property.houseNumber}, ${bookings.property.street} ${bookings.property.city}, ${bookings.property.country}`,
      priceOfProperty: bookings.property.price,
      numberOfAdults: bookings.numberOfAdults,
      numberOfChildren: bookings.numberOfChildren,
      numberOfInfants: bookings.numberOfInfants,
      status: checkBookingStatus(bookings.status),
      guestName: `${bookings.guest.firstName} ${bookings.guest.lastName}`,
      guestPhone: '',
      guestEmail: bookings.guest.email,
      payment: whatYouEarn,
      paymentDate: new Date(bookings.payment.createdAt).toLocaleDateString(),
      serviceFee: transactionFee,
      vat,
      paymentMethod: bookings.payment.paymentMethod,
      paymentReference: formatReference(bookings.payment.paymentReference),
      bookingReference: formatReference(bookings.bookingReference),
      hostId: bookings.property.hostId,
      total: bookings?.payment?.amount ? payment * numberOfNightsSpent : 0,
      holdingWindow:
        bookings.payment.paymentMethod === PaymentMethod.CRYPTO
          ? bookings.holdingWindow
            ? new Date(bookings.holdingWindow).toDateString()
            : ''
          : '',
      photo: bookings.property.photos.length ? bookings.property.photos[0] : '',
    } as SingleBookingView;
  }
}

export function formatReference(ref: string) {
  return ref.replaceAll('-', '');
}

function checkBookingStatus(status: number) {
  let statusText: BookingStatus = 'pending';
  switch (status) {
    case 0:
      statusText = 'pending';
      break;
    case 1:
      statusText = 'confirmed';
      break;
    case 2:
      statusText = 'in-progress';
      break;
    case 3:
      statusText = 'completed';
      break;
    case 4:
      statusText = 'cancelled';
      break;
    default:
      statusText = 'pending';
      break;
  }
  return statusText;
}

export function humazieUuid(uuid: string) {
  const humanized = `SOJ-${uuid.slice(0, 8)}`;
  return humanized;
}
