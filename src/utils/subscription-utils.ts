import { SubscriptionPaymentStatus } from 'src/payments/types';

interface SubscriptionPayment {
  id: string;
  amount: number;
  paidOn: Date;
  paymentStatus: SubscriptionPaymentStatus;
}

interface Subscription {
  planName: string;
  planId: string;
  nextPaymentDate: Date;
}

export function transformSubscriptionPayments(sp: SubscriptionPayment[]) {
  return sp.map((p) => {
    return {
      id: p.id,
      amount: p.amount,
      date: new Date(p.paidOn).toDateString(),
      status: p.paymentStatus,
      downloadLink: '',
    };
  });
}

export function transformSubscription(sub: Subscription) {
  return {
    ...sub,
    nextPaymentDate: sub.nextPaymentDate
      ? new Date(sub.nextPaymentDate).toDateString()
      : '',
  };
}
