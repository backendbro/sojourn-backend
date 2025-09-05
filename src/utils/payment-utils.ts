import { BadRequestException } from '@nestjs/common';
import { Payment } from 'src/payments/entities/payment.entity';
import { PaymentStatus, PaymentTypes } from 'src/payments/types';
import { numberOfNights } from '.';
import { BookingStatus } from 'src/bookings/types';

export function getNowPaymentsEstimatedPrice(
  fiatAmount: number,
  currencyFrom: string,
  currencyTo: string,
) {
  if (!fiatAmount || !currencyFrom || !currencyTo) {
    throw new BadRequestException();
  }
  return `https://api.nowpayments.io/v1/estimate?amount=${fiatAmount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`;
}

export function transformOfficePaymentRecords(payments: Payment[]) {
  let total = 0;

  payments.forEach((p) => {
    if (
      p.paymentStatus === PaymentStatus.COMPLETED &&
      p.paymentType === PaymentTypes.BOOKING
    ) {
      total += +p.amount;
    }
  });
  return payments.map((payment) => ({
    id: payment.id,
    total,
    guestEmail: payment.user.email,
    guestFullName: `${payment.user.firstName} ${payment.user.lastName}`,
    amountPaid: payment.amount,
    paymentMethod: payment.paymentMethod,
    dateCreated: new Date(payment.createdAt).toDateString(),
    paymentStatus: payment.paymentStatus,
    bookingId: payment.booking.id,
  }));
}

export async function transformOfficeWithdrawalRecords(withdrawals: Payment[]) {
  let total = 0;
  withdrawals.forEach((w) => {
    if (w.paymentStatus === PaymentStatus.COMPLETED) {
      total += +w.amount;
    }
  });

  return withdrawals.map((withdrawal) => ({
    id: withdrawal.id,
    total,
    amount: Math.abs(+withdrawal.amount),
    status: withdrawal.paymentStatus,
    hostFullName: `${withdrawal.host.firstName} ${withdrawal.host.lastName}`,
    hostEmail: withdrawal.host.email,
    dateCreated: new Date(withdrawal.createdAt).toDateString(),
    hostId: withdrawal.host.id,
  }));
}

export function transformOfficeWithdrawalRecord(
  payment: Payment,
  allPayments: Payment[],
) {
  return {
    id: payment.id,
    status: payment.paymentStatus,
    requestDate: new Date(payment.createdAt).toDateString(),
    amount: Math.abs(payment.amount),
    hostFullName: `${payment.host.firstName} ${payment.host.lastName}`,
    hostEmail: payment.host.email,
    availableBalance: getAvailableBalance(
      allPayments,
      new Date(payment.createdAt),
    ),
    bankName: payment.withdrawal.account.bankName,
    bankAccountNumber: payment.withdrawal.account.bankAccountNumber,
  };
}

function getAvailableBalance(allPayments: Payment[], dateRequested: Date) {
  const availableBalance = allPayments.reduce((curr, p) => {
    if (
      p?.booking &&
      p.createdAt < dateRequested &&
      p?.booking?.property &&
      p.paymentStatus === PaymentStatus.COMPLETED &&
      p.paymentType === PaymentTypes.BOOKING &&
      (p.booking?.status === BookingStatus.FINISHED ||
        p.booking?.status === BookingStatus.PAID_PENDING ||
        p.booking?.status === BookingStatus.PROCESSING)
    ) {
      let dailyPrice = +p.amount - +p.transactionFee - +p.vat;

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

  const payments = allPayments;
  const withdrawals = payments.filter(
    (payment) => payment.paymentType === PaymentTypes.WITHDRAWAL,
  );

  let totalWithdrawals = 0;
  for (let i = 0; i < withdrawals.length; i++) {
    if (withdrawals[i].createdAt < dateRequested) {
      totalWithdrawals -=
        +withdrawals[i].amount +
        +withdrawals[i].vat +
        +withdrawals[i].transactionFee;
    }
  }

  return availableBalance - totalWithdrawals;
}
