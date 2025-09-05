import { Booking } from 'src/bookings/entities/booking.entity';
import { Wallet } from './entities/wallet.entity';

export enum SojournCreditsStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
}

export enum SojournCreditsType {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export type WalletPayload = {
  bankName: string;
  bankAccountNumber: string;
  hostId: string;
};

export type Withdraw = {
  walletId: string;
  hostId: string;
  amount: number;
  accountId: string;
};

export type BankAccount = {
  bankName: string;
  bankAccountNumber: string;
  hostId: string;
  walletId: string;
  wallet: Wallet;
};

export type AddSojournCredits = {
  userId: string;
  amount: number;
  bookingId?: string;
  type?: SojournCreditsType;
  bookingDebitId?: string;
  bookingDebit?: Booking;
  booking?: Booking;
  reference: string;
};
