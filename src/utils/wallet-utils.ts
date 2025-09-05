import { PaymentStatus, PaymentTypes } from 'src/payments/types';
import { formatReference } from './bookings-utils';
import { numberOfNights } from '.';
import { BookingStatus } from 'src/bookings/types';

type WalletType = {
  propertyTitle: string;
  id: string;
  paymentType: string;
  paymentMethod: string;
  amount: number;
  transactionFee: number;
  paymentReference: string;
  description: string;
  date: string;
};

export function transformWalletRecords(records: any[]) {
  return records.map((record) => {
    const checkIn = record.booking
      ? new Date(record.booking.checkIn)
      : new Date();
    const checkOut = record.booking
      ? new Date(record.booking.checkOut)
      : new Date();

    const nightsSpent = record.booking ? numberOfNights(checkIn, checkOut) : 0;

    let actualPrice = 0;

    actualPrice = record.amount - +record.vat - +record.transactionFee;

    if (record.sojournCreditsAmount) {
      actualPrice -= +record.sojournCreditsAmount;
    }

    if (record.cautionFee) {
      actualPrice -= +record.cautionFee;
    }

    const serviceFee = record.booking
      ? 0.02 * actualPrice * nightsSpent
      : record.transactionFee;

    const withdrawalTotal =
      parseFloat(record.amount) +
      parseFloat(record.vat) +
      parseFloat(record.transactionFee);

    const bookingPriceOrWithdrawalTotal = record.booking
      ? actualPrice * nightsSpent
      : withdrawalTotal;
    return {
      propertyTitle: record.booking ? record.booking.property.title : 'nil',
      id: record.id,
      paymentMethod: record.paymentMethod,
      paymentType: checkPaymentType(record.paymentType),
      amount: bookingPriceOrWithdrawalTotal,
      transactionFee: serviceFee,
      paymentReference: formatReference(record.paymentReference),
      description: record.description,
      date: new Date(record.createdAt).toDateString(),
    } as WalletType;
  });
}

export function checkPaymentType(type: number) {
  let paymentType = '';
  switch (type) {
    case 0:
      paymentType = 'booking';
      break;
    case 1:
      paymentType = 'withdrawal';
      break;
    case 2:
      paymentType = 'refund';
      break;
    default:
      paymentType = 'booking';
      break;
  }
  return paymentType;
}

export function applyWithdrawals(result: { payments: Array<any> }) {
  const paymentObj = { ...result, walletBalance: 0 } as {
    payments: Array<any>;
    walletBalance: number;
    availableBalance: number;
  };

  if (paymentObj === null) return paymentObj;

  const availableBalance = paymentObj.payments.reduce((curr, p) => {
    if (
      p.booking &&
      p.booking.property &&
      p.paymentStatus === PaymentStatus.COMPLETED &&
      p.paymentType === PaymentTypes.BOOKING &&
      (p.booking.status === BookingStatus.FINISHED ||
        p.booking.status === BookingStatus.PROCESSING)
    ) {
      let dailyPrice = +p.amount - +p.serviceFee - +p.vat;

      if (Number(p.sojournCreditsAmount)) {
        dailyPrice -= +p.sojournCreditsAmount;
      }

      if (Number(p.cautionFee)) {
        dailyPrice -= +p.cautionFee as number;
      }

      const checkIn = new Date(p.booking.checkIn);
      const checkOut = new Date(p.booking.checkOut);

      const totalNumberOfDaysOfBooking = numberOfNights(checkIn, checkOut);

      dailyPrice = dailyPrice / totalNumberOfDaysOfBooking;

      const today = new Date();
      let numberOfDays = 0;

      if (checkOut > today) {
        numberOfDays = numberOfNights(checkIn, today);
      } else {
        numberOfDays = totalNumberOfDaysOfBooking;
      }

      return (curr +=
        numberOfDays * dailyPrice - dailyPrice * numberOfDays * 0.02);
    }
    return curr;
  }, 0);

  const payments = paymentObj.payments;
  const withdrawals = payments.filter(
    (payment) => payment.paymentType === PaymentTypes.WITHDRAWAL,
  );
  const deposits = payments.filter(
    (payment) =>
      payment.paymentType === PaymentTypes.BOOKING &&
      payment.paymentStatus === PaymentStatus.COMPLETED,
  );

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  for (let i = 0; i < withdrawals.length; i++) {
    totalWithdrawals -=
      parseFloat(withdrawals[i].amount) +
      parseFloat(withdrawals[i].vat) +
      parseFloat(withdrawals[i].serviceFee);
  }

  for (let i = 0; i < deposits.length; i++) {
    const payment = deposits[i];
    const b = deposits[i].booking;
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    let dailyPrice = +payment.amount - +payment.serviceFee - +payment.vat;
    if (payment.sojournCreditsAmount) {
      dailyPrice -= +payment.sojournCreditsAmount;
    }

    if (payment.cautionFee) {
      dailyPrice -= +payment.cautionFee;
    }
    const nightsSpent = numberOfNights(checkIn, checkOut);

    dailyPrice = dailyPrice / nightsSpent;

    totalDeposits += dailyPrice * nightsSpent;
  }

  paymentObj.walletBalance = totalDeposits - totalWithdrawals;
  paymentObj.availableBalance = availableBalance - totalWithdrawals;

  return paymentObj;
}

export function transfromPaymentRecord(payment) {
  let actualPrice = 0;

  const paymentType = checkPaymentType(payment.paymentType);

  if (paymentType === 'withdrawal') {
    actualPrice = payment.amount;
  } else {
    actualPrice = payment.amount - +payment.vat - +payment.transactionFee;
  }

  if (payment.sojournCreditsAmount) {
    actualPrice -= +payment.sojournCreditsAmount;
  }

  if (payment.cautionFee) {
    actualPrice -= +payment.cautionFee;
  }
  const serviceFee = actualPrice * 0.02;

  return {
    id: payment.id,
    date: new Date(payment.createdAt).toDateString(),
    paymentMethod: payment.paymentMethod,
    description: payment.description,
    paymentType,
    amount: actualPrice,
    paymentReference: formatReference(payment.paymentReference),
    ...(paymentType === 'withdrawal' && { transactionFee: serviceFee }),
    ...(paymentType === 'withdrawal' && { vat: payment.vat }),
    ...(payment.user && {
      firstName: payment.user.firstName,
      lastName: payment.user.lastName,
      email: payment.user.email,
    }),
    ...(payment?.booking &&
      payment?.booking?.property && {
        propertyTitle: payment.booking.property.title,
      }),
  };
}

export function formatSojournCredits(
  values: {
    amount: number;
    createdAt: Date;
    id: string;
  }[],
) {
  let total = 0;
  values.forEach((v) => {
    total += v.amount;
  });

  return values.map((v) => {
    return {
      total,
      amount: v.amount,
      date: new Date(v.createdAt).toDateString(),
      type: v.amount < 0 ? 'outgoing' : 'incoming',
      id: v.id,
    };
  });
}

export function calculateTotalCredits(
  values: {
    amount: number;
    createdAt: Date;
    id: string;
  }[],
) {
  const total = values.reduce((prev, curr) => (curr.amount += prev), 0);
  return total;
}
