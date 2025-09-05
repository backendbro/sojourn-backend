import { Host } from 'src/users/entities/users.entity';
import { Subscriptions } from './entities/subscription.entity';
import {
  SubscriptionInvoiceCreatedEmailTemplateParams,
  SubscriptionInvoicePaymentFailedEmailTemplate,
  SubscriptionWillNotRenewEmailTemplateParams,
} from 'src/email-service/email-service.types';
import { Wallet } from 'src/wallet/entities/wallet.entity';

export enum PaymentTypes {
  BOOKING,
  WITHDRAWAL,
  REFUND,
}

export type PaystackMetadataCustomField = {
  display_name: string;
  variable_name: string;
  value: string | number;
};

export type PayStackMetadata = {
  propertyId: string;
  userId: string;
  custom_fields: PaystackMetadataCustomField[];
};

export type PaystackCreateTransactionDto = {
  amount: number;
  email: string;
  callback_url?: string;
  metadata: PayStackMetadata;
};

export type PaystackCreateTransactionResponseDto = {
  status: boolean;
  message: string;
  data: { authorization_url: string; access_code: string; reference: string };
};

export class PaystackCallbackDto {
  reference: string;
}

export type PaystackVerifyTransactionResponseDto = {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
  };
};

export type PaystackWebhookDto = {
  event: string;
  data: Data;
};

export type Data = {
  id?: number;
  domain?: string;
  paid: boolean;
  status?: string;
  reference?: string;
  amount?: number;
  subscription_code: string;
  gateway_response?: string;
  subscription: {
    email_token: string;
    subscription_code: string;
    next_payment_date: string;
  };
  paid_at?: string;
  created_at?: string;
  channel?: string;
  currency?: string;
  ip_address?: string;
  metadata?: any;
  message?: any;
  fees: any;
  log: any;
  next_payment_date?: string;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    customer_code: string;
  };
  authorization: {
    authorization_code: string;
  };
  plan: any;
};

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface Payment {
  bookingId?: string;
  userId?: string;
  hostId: string;
  paymentType: PaymentTypes;
  amount: number;
  transactionFee: number;
  description: string;
  vat: number;
  wallet: Wallet;
  paystackReference?: string;
  paymentLink?: string;
  paymentMethod?: PaymentMethod;
  paystackAccessCode?: string;
  crypto_pay_amount?: number;
  crypto_pay_amount_currency?: string;
  crypto_pay_fiat_amount?: number;
  crypto_pay_fiat_currency?: string;
  crypto_pay_address?: string;
  sojournCreditsAmount?: number;
  cautionFee?: number;
}

export enum PaymentMethod {
  CARD = 'card',
  TRANSFER = 'transfer',
  CRYPTO = 'crypto',
}

export type NowPaymentsCurrenciesAvailableType = {
  currencies: { currency: string }[];
};

export type NowPaymentsMinimumAmountPayableType = {
  currency_from: string;
  currency_to: string;
  min_amount: number;
  fiat_equivalent: number;
};

export type NowPaymentsEstimatedPriceType = {
  currency_from: string;
  amount_from: number;
  currency_to: string;
  estimated_amount: number;
};

export type NowPaymentsCreatePaymentType = {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  ipn_callback_url?: string;
  order_id?: string;
  order_description?: string;
};

type CryptoPaymentStatus =
  | 'waiting'
  | 'failed'
  | 'confirming'
  | 'confirmed'
  | 'sending'
  | 'partially_paid '
  | 'finished '
  | 'expired';

export type NowPaymentsCreatePaymentReturnType = {
  payment_id: string;
  payment_status: CryptoPaymentStatus;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url?: string;
  created_at: string;
  updated_at: string;
  purchase_id: string;
  amount_received: null | string;
  payin_extra_id: null | string;
  smart_contract: string;
  network: string;
  network_precision: number;
  time_limit: null | number;
  burning_percent: null | number;
  expiration_estimate_date: string;
};

export type NowPaymentsConfirmationType = {
  payment_id: number;
  invoice_id: null | string;
  payment_status: CryptoPaymentStatus;
  pay_address: string;
  payin_extra_id: null | string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: null | string;
  order_description: null | string;
  purchase_id: number;
  outcome_amount: number;
  outcome_currency: string;
  payout_hash: string;
  payin_hash: string;
  created_at: Date;
  updated_at: Date;
  burning_percent: null | string;
  type: string;
  payment_extra_ids: number[];
};

export enum SubscriptionActiveStatus {
  ACTIVE = 'active',
  NOT_ACTIVE = 'not-active',
}

export enum SubscriptionPaymentStatus {
  PAID = 'paid',
  NOT_PAID = 'not-paid',
}

export type CreateSubscription = {
  paystackCustomerId?: number;
  paystackCustomerEmail: string;
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  paystackAuthorizationCode?: string;
  host?: Host;
  hostId?: string;
  activeStatus?: SubscriptionActiveStatus;
  planId: string;
  planName: string;
  initialPaymentReference: string;
};

export type CreateSubscriptionPayment = {
  subscription?: Subscriptions;
  subscriptionId?: string;
  amount: number;
  paymentDate: Date;
  paystackReference: string;
  paidOn: Date;
  paymentStatus: SubscriptionPaymentStatus;
};

export interface SubscriptionInvoiceCreatedEvent
  extends SubscriptionInvoiceCreatedEmailTemplateParams {}

export interface SubscriptionInvoiceChargeFailedEvent
  extends SubscriptionInvoicePaymentFailedEmailTemplate {}

export interface SubscriptionWillNotRenewEvent
  extends SubscriptionWillNotRenewEmailTemplateParams {}
