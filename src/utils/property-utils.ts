import { Booking } from 'src/bookings/entities/booking.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import {
  CreateInspectionForm,
  CreateProperty,
  PropertyInspectionStatus,
  PropertyInspectionStatusList,
} from 'src/properties/types';
import { numberOfNights } from '.';
import { BookingStatus } from 'src/bookings/types';

export const transfromInspections = (
  inspections: Array<
    CreateInspectionForm & { status: PropertyInspectionStatus; id: string }
  >,
) => {
  return inspections.map(
    ({
      id,
      title,
      inspectionDate,
      inspectionTime,
      status,
      typeOfProperty,
      contactPhoneNumber,
      city,
      street,
      photos,
      houseNumber,
      hostId,
    }) => {
      return {
        id,
        title,
        photos,
        inspectionDate: `${inspectionDate.toLocaleDateString()} ${inspectionTime}`,
        status: PropertyInspectionStatusList[status],
        type: typeOfProperty,
        phone: contactPhoneNumber,
        location: `${city}, ${street} ${houseNumber}`,
        hostId,
      };
    },
  );
};

function calculateRevenue(bookings: Booking[]) {
  let total = 0;
  bookings.forEach((booking) => {
    if (
      booking.status !== BookingStatus.CANCELLED &&
      booking.status !== BookingStatus.PENDING
    ) {
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

      total += payment;
    }
  });

  return total;
}

export const transfromProperties = (
  inspections: Array<
    CreateProperty & {
      id: string;
      views?: number;
      bookings: Booking[];
      propertyInspection: {
        status: PropertyInspectionStatus;
        dateApproved: Date | null;
      };
    }
  >,
) => {
  return inspections.map(
    ({
      title,
      id,
      bookings,
      propertyInspection: { status, dateApproved },
      typeOfProperty,
      city,
      street,
      views,
      photos,
      houseNumber,
      hostId,
      activeStatus,
    }) => {
      const numberOfBookings = bookings
        ? bookings.filter(
            (b) =>
              b.status === BookingStatus.FINISHED ||
              b.status === BookingStatus.PAID_PENDING ||
              b.status === BookingStatus.PROCESSING,
          ).length
        : 0;

      return {
        id: id,
        photos,
        title: title,
        status: PropertyInspectionStatusList[status],
        type: typeOfProperty,
        views: views,
        activeStatus,
        location: `${city}, ${street} ${houseNumber}`,
        bookings: numberOfBookings,
        revenue: bookings ? calculateRevenue(bookings) : [],
        activeFrom: dateApproved ? new Date(dateApproved).toDateString() : null,
        hostId: hostId,
      };
    },
  );
};

export const parseInspectionRequest = (body: { [x: string]: any }) => {
  const data = body;
  const keys = Object.keys(body);
  for (let key of keys) {
    if (body[key][0] === '[') data[key] = JSON.parse(body[key]);
  }
  return data;
};

export function formatPropertyTypes(values: string[]) {
  if (values.length === 0 || !values) return [];
  return values
    .filter((v) => v !== '')
    .map((v) => {
      if (v === 'townHouse') {
        return 'town-house';
      } else if (v === 'smartShare') {
        return 'smart-share';
      } else if (v === 'primeInn') {
        return 'prime-inn';
      }
      return v;
    });
}
