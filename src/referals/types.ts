export enum ReferalStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
}

export enum ReferalTransactionStatus {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum ReferalType {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export type AddReferal = {
  refererId: string;
  userId?: string;
  paymentStatus: ReferalTransactionStatus;
  paymentType: ReferalType;
  paystackStatus: ReferalStatus;
  amount: number;
  reference?: string;
  bookingId?: string;
};
