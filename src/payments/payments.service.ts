import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GuestRepository } from 'src/repositories/guest.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import {
  InitializeSubscription,
  initializeTransactionDto,
} from 'src/validators/payments-validators';
import {
  CreateSubscription,
  CreateSubscriptionPayment,
  NowPaymentsConfirmationType,
  NowPaymentsCreatePaymentReturnType,
  NowPaymentsCreatePaymentType,
  NowPaymentsCurrenciesAvailableType,
  NowPaymentsEstimatedPriceType,
  NowPaymentsMinimumAmountPayableType,
  PaymentMethod,
  PaymentStatus,
  PaymentTypes,
  PaystackCallbackDto,
  PaystackCreateTransactionDto,
  PaystackCreateTransactionResponseDto,
  PayStackMetadata,
  PaystackVerifyTransactionResponseDto,
  PaystackWebhookDto,
  SubscriptionActiveStatus,
  SubscriptionInvoiceChargeFailedEvent,
  SubscriptionInvoiceCreatedEvent,
  SubscriptionPaymentStatus,
  SubscriptionWillNotRenewEvent,
} from './types';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import {
  EARN_CREDITS_RATE,
  NOW_PAYMENTS_CONFIRMATION_URL,
  NOW_PAYMENTS_CREATE_PAYMENT_URL,
  NOW_PAYMENTS_GET_CURRENCIES_URL,
  NOW_PAYMENTS_MINIMUM_AMOUNT_PAYABLE,
  PAYSTACK_SUCCESS_STATUS,
  PAYSTACK_TRANSACTION_INI_URL,
  PAYSTACK_TRANSACTION_VERIFY_BASE_URL,
  PAYSTACK_WEBHOOK_CRYPTO_ALGO,
  REFERAL_AMOUNT,
  SOJOURN_CREDITS_AMOUNT,
} from 'src/constants';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import {
  BookingStatus,
  GuestBookingConfirmationEvent,
  HostBookingConfirmationEvent,
} from 'src/bookings/types';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { createHmac, timingSafeEqual } from 'crypto';
import { numberOfNights } from 'src/utils';
import { ReferalsRepository } from 'src/repositories/referals.repository';
import { AddReferal, ReferalStatus, ReferalType } from 'src/referals/types';
import { SojournCreditsRepository } from 'src/repositories/credits.repository';
import { SojournCreditsStatus, SojournCreditsType } from 'src/wallet/types';
import { EmailServiceService } from 'src/email-service/email-service.service';
import { humazieUuid, SingleBookingView } from 'src/utils/bookings-utils';
import { getNowPaymentsEstimatedPrice } from 'src/utils/payment-utils';
import { Payment } from './entities/payment.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { CronExpression } from '@nestjs/schedule';
import { Referals } from 'src/referals/entities/referals.entity';
import { SojournCredits } from 'src/wallet/entities/sojourn-credits.entity';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { SubscriptionRepository } from 'src/repositories/subscription.repository';
import { SubscriptionPaymentsRepository } from 'src/repositories/subscription-payments.repository';
import { BookingsService } from 'src/bookings/bookings.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletRepository } from 'src/repositories/wallet.repository';
import { RatesRepository } from 'src/repositories/rates.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private propertiesRepo: PropertiesRepository,
    private guestRepo: GuestRepository,
    private configService: ConfigService,
    private bookingRepo: BookingsRepository,
    private walletRepo: WalletRepository,
    private paymentRepo: PaymentRepository,
    private referalsRepo: ReferalsRepository,
    private sojournCreditRepo: SojournCreditsRepository,
    private tasksService: TasksService,
    private hostRepo: HostsRepository,
    private subscriptions: SubscriptionRepository,
    private subscriptionPayments: SubscriptionPaymentsRepository,
    private bookingService: BookingsService,
    private eventEmitter: EventEmitter2,
    private rateRepository: RatesRepository,
  ) {}

  async getAllPayments() {
    try {
      return await this.paymentRepo.getAllBookingPayments();
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getRate() {
    return await this.rateRepository.getRate();
  }

  async getAllWithdrawals() {
    try {
      return await this.paymentRepo.getAllWithdrawals();
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getWithdrawalByPaymentId(paymentId: string, hostId: string) {
    const paymentRecordExists =
      await this.paymentRepo.paymentRecordExists(paymentId);
    if (!paymentRecordExists) {
      throw new NotFoundException('record not found');
    }
    return await this.paymentRepo.getWithdrawalRecordByPaymentId(
      paymentId,
      hostId,
    );
  }

  async initializeTransaction(dto: initializeTransactionDto) {
    const today = new Date();

    const bookingExists =
      await this.bookingService.checkListingAvailability(dto);
    if (!bookingExists) {
      throw new BadRequestException(
        'The dates on this booking are no longer available.',
      );
    }

    const isCheckInDateValid =
      numberOfNights(today, new Date(dto.checkInDate)) >= 1;
    if (!isCheckInDateValid) {
      throw new BadRequestException(
        'check in date cannot be earlier than the current day.',
      );
    }

    const isCheckoutDateValid =
      new Date(dto.checkOutDate) > new Date(dto.checkInDate);

    if (!isCheckoutDateValid) {
      throw new BadRequestException(
        'check out date cannot be earlier than the check in date.',
      );
    }

    const isCheckinAndCheckoutDateValid =
      numberOfNights(new Date(dto.checkInDate), new Date(dto.checkOutDate)) >=
      1;
    if (!isCheckinAndCheckoutDateValid) {
      throw new BadRequestException(
        'number of days between check in and check out must be >= 1.',
      );
    }

    const numberOfGuests =
      dto.numberOfAdults + dto.numberOfChildren + dto.numberOfChildren;

    if (numberOfGuests < 1) {
      throw new BadRequestException('number of guests staying must be >= 1.');
    }

    const property = await this.propertiesRepo.getPropertyById(dto.propertyId);
    const guest = await this.guestRepo.getGuestById(dto.userId);

    const result = await this.propertiesRepo.getHostByPropertyId(
      dto.propertyId,
    );

    const metadata: PayStackMetadata = {
      propertyId: property.id,
      userId: guest.id,
      custom_fields: [
        {
          display_name: 'Name',
          variable_name: 'name',
          value: `${guest.firstName} ${guest.lastName}`,
        },
        {
          display_name: 'listing',
          variable_name: 'property_name',
          value: property.title,
        },
        {
          display_name: 'Host Name',
          variable_name: 'host_name',
          value: `${result.host.firstName} ${result.host.lastName}`,
        },
      ],
    };

    const totalSojournCredits =
      await this.sojournCreditRepo.getTotalSojournCreditsByUserId(guest.id);
    let creditsToApply = 0;
    if (dto.credits <= totalSojournCredits) {
      creditsToApply = dto.credits;
    }

    const serviceFee = Math.round(
      (10 / 100) *
        (property.price * numberOfNights(dto.checkInDate, dto.checkOutDate)),
    );
    const vat = Math.round(
      (7.5 / 100) *
        (property.price * numberOfNights(dto.checkInDate, dto.checkOutDate)),
    );

    const paystackCreateTransactionDto: PaystackCreateTransactionDto = {
      email: guest.email,
      amount: +`${
        property.price * numberOfNights(dto.checkInDate, dto.checkOutDate) +
        serviceFee +
        property.cautionFee +
        vat -
        creditsToApply
      }00`,
      metadata,
    };

    const paystackCallbackUrl = this.configService.get('PAYSTACK_CALLBACK_URL');
    if (paystackCallbackUrl) {
      paystackCreateTransactionDto.callback_url = paystackCallbackUrl;
    }

    const payload = JSON.stringify(paystackCreateTransactionDto);

    let paystackResult: PaystackCreateTransactionResponseDto;

    try {
      const response = await axios.post<PaystackCreateTransactionResponseDto>(
        PAYSTACK_TRANSACTION_INI_URL,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>(
              'PAYSTACK_SECRET_KEY',
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      paystackResult = response.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const data = paystackResult.data;

    if (paystackResult.status === true) {
      const currentDate = new Date();
      const holdingWindow = new Date(currentDate.getTime() + 30 * 60000); // Add 30 minutes (30 minutes * 60 seconds * 1000 milliseconds)
      const booking = await this.bookingRepo.createBooking({
        propertyId: property.id,
        guestId: guest.id,
        status: BookingStatus.PENDING,
        numberOfAdults: dto.numberOfAdults,
        numberOfChildren: dto.numberOfChildren,
        numberOfInfants: dto.numberOfInfants,
        checkIn: dto.checkInDate,
        holdingWindow,
        checkOut: dto.checkOutDate,
      });

      const wallet = await this.walletRepo.getHostWalletByHostId(
        property.hostId,
      );

      const payment = await this.paymentRepo.createPayment({
        userId: guest.id,
        hostId: result.host.id,
        paymentType: PaymentTypes.BOOKING,
        amount:
          property.price * numberOfNights(dto.checkInDate, dto.checkOutDate) +
          serviceFee +
          property.cautionFee +
          vat -
          creditsToApply,
        vat,
        sojournCreditsAmount: creditsToApply,
        cautionFee: +property.cautionFee,
        transactionFee: serviceFee,
        bookingId: booking.id,
        description: `booking payment for ${property.title}`,
        paystackReference: data.reference,
        paymentLink: data.authorization_url,
        paystackAccessCode: data.access_code,
        wallet,
      });

      if (creditsToApply > 0) {
        await this.sojournCreditRepo.addSojournCredits({
          userId: guest.id,
          amount: -creditsToApply,
          booking: booking,
          type: SojournCreditsType.OUTGOING,
          reference: paystackResult.data.reference,
        });
      }

      if (guest.refererId) {
        const referalRecord = await this.referalsRepo.getReferalByUserId(
          guest.refererId,
          guest.id,
        );

        if (!referalRecord) {
          const record = {
            refererId: guest.refererId,
            userId: guest.id,
            amount: REFERAL_AMOUNT,
            paymentType: ReferalType.INCOMING,
            reference: paystackResult.data.reference,
            bookingId: booking.id,
          } as AddReferal;
          await this.referalsRepo.addReferal(record);
        }
      }

      const creditsEarned2Percent = Math.ceil(
        EARN_CREDITS_RATE *
          (property.price * numberOfNights(dto.checkInDate, dto.checkOutDate) +
            +serviceFee +
            +property.cautionFee +
            +vat -
            +creditsToApply),
      );

      await this.sojournCreditRepo.addSojournCredits({
        userId: guest.id,
        amount: creditsEarned2Percent,
        booking: booking,
        reference: paystackResult.data.reference,
      });
      return payment;
    }

    throw new BadRequestException(
      `Error initiating transaction ${paystackResult}`,
    );
  }

  async verifyTransaction(query: PaystackCallbackDto) {
    const transaction = await this.paymentRepo.getPaymentByReference(
      query.reference,
    );

    if (!transaction) return null;

    const url = `${PAYSTACK_TRANSACTION_VERIFY_BASE_URL}/${transaction.paystackReference}`;

    let response: AxiosResponse<PaystackVerifyTransactionResponseDto>;

    try {
      response = await axios.get<PaystackVerifyTransactionResponseDto>(url, {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'PAYSTACK_SECRET_KEY',
          )}`,
        },
      });
    } catch (error) {
      throw new BadRequestException();
    }

    if (!response) {
      return null;
    }

    const result = response.data;

    const transactionStatus = result?.data?.status;
    const paymentConfirmed = transactionStatus === PAYSTACK_SUCCESS_STATUS;

    const referal = await this.referalsRepo.getReferalByUserReference(
      response.data.data.reference,
    );

    const sojournCredits =
      await this.sojournCreditRepo.getSojournCreditByPayStackReference(
        response.data.data.reference,
      );

    let credits = [];

    if (paymentConfirmed) {
      transaction.paymentStatus = PaymentStatus.COMPLETED;
      referal.paystackStatus = ReferalStatus.PAID;
      credits = sojournCredits.map(
        (sojournCredit) =>
          (sojournCredit.status = SojournCreditsStatus.CONFIRMED),
      );
    } else {
      transaction.paymentStatus = PaymentStatus.PENDING;
      referal.paystackStatus = ReferalStatus.UNPAID;
      credits = sojournCredits.map(
        (sojournCredit) =>
          (sojournCredit.status = SojournCreditsStatus.PENDING),
      );
    }

    const transactionResult = await this.paymentRepo.save(transaction);
    await this.referalsRepo.save(referal);
    await Promise.all(
      credits.map(async (c) => await this.sojournCreditRepo.save(c)),
    );
    return transactionResult;
  }

  async handlePaystackSubscriptionsWebhook(
    dto: PaystackWebhookDto,
    signature: string,
  ): Promise<boolean> {
    if (!dto.data) {
      return false;
    }

    let isValidEvent = false;

    try {
      const hash = createHmac(
        PAYSTACK_WEBHOOK_CRYPTO_ALGO,
        this.configService.get<string>('PAYSTACK_SECRET_KEY'),
      )
        .update(JSON.stringify(dto))
        .digest('hex');

      const hashBuffer = Buffer.from(hash);
      const signatureBuffer = Buffer.from(signature);
      timingSafeEqual(
        new Uint8Array(hashBuffer),
        new Uint8Array(signatureBuffer),
      );

      isValidEvent =
        hash &&
        signature &&
        timingSafeEqual(
          new Uint8Array(hashBuffer),
          new Uint8Array(signatureBuffer),
        );
      // timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch (error) {
      throw new InternalServerErrorException();
    }

    if (!isValidEvent) {
      return false;
    }

    let flag = false;

    switch (dto.event) {
      case 'subscription.create':
        flag = await this.updateSubscription(dto);
        break;
      // Sent when a subscription is created successfully
      case 'charge.success':
        flag = await this.updatePayment(dto);
        break;

      // Sent when a subscription payment is made successfully
      case 'invoice.create':
        flag = await this.subscriptionInvoiceCreated(dto);
      // Sent when an invoice is created to capture an upcoming subscription charge. Should happen 2-3 days before the charge happens
      case 'invoice.update':
        flag = await this.invoiceUpdated(dto);
        break;

      //contains the final status of the invoice and if the charge was success or not
      case 'invoice.payment_failed':
        flag = await this.subscriptionInvoicePaymentFailed(dto);
        break;

      // Sent when a subscription payment fails
      case 'subscription.not_renew':
        flag = await this.subscriptionNotRenewing(dto);
        break;

      // Sent when a subscription is canceled to indicate that it won't be charged on the next payment date
      case 'subscription.disable':
        flag = await this.cancelledSubscription(dto);
        break;

      // Sent when a canceled subscription reaches the end of the subscription period
      case 'subscription.expiring_cards': // Sent at the beginning of each month with info on what cards are expiring that month
      default:
        break;
    }

    return flag;
  }

  private async subscriptionNotRenewing(dto: PaystackWebhookDto) {
    let result = false;

    const subscription =
      await this.subscriptions.getSubscriptionByCustomerEmail(
        dto.data.customer.email,
      );
    if (subscription) {
      const payload: SubscriptionWillNotRenewEvent = {
        email: subscription.paystackCustomerEmail,
        nextPaymentDate: new Date(subscription.nextPaymentDate).toDateString(),
      };

      this.eventEmitter.emit('subscription.not.renewing', payload);
      result = true;
    }

    return result;
  }

  private async subscriptionInvoicePaymentFailed(dto: PaystackWebhookDto) {
    let result = false;
    const subscription =
      await this.subscriptions.getSubscriptionByCustomerEmail(
        dto.data.customer.email,
      );
    if (subscription) {
      const payload: SubscriptionInvoiceChargeFailedEvent = {
        email: subscription.paystackCustomerEmail,
      };
      this.eventEmitter.emit('subscription.charge.failed', payload);
      result = true;
    }
    return result;
  }

  private async subscriptionInvoiceCreated(dto: PaystackWebhookDto) {
    let result = false;
    const subscription =
      await this.subscriptions.getSubscriptionByCustomerEmail(
        dto.data.customer.email,
      );

    if (subscription) {
      subscription.activeStatus = SubscriptionActiveStatus.ACTIVE;
      subscription.paystack_email_token = dto.data.subscription.email_token;
      subscription.nextPaymentDate = new Date(
        dto.data.subscription.next_payment_date,
      );
      await this.subscriptions.save(subscription);
      const payload: SubscriptionInvoiceCreatedEvent = {
        email: subscription.paystackCustomerEmail,
        nextPaymentDate: new Date(subscription.nextPaymentDate).toDateString(),
      };
      this.eventEmitter.emit('subscription.invoice.created', payload);

      result = true;
    }

    return result;
  }

  private async cancelledSubscription(dto: PaystackWebhookDto) {
    const subcription = await this.subscriptions.getSubscriptionByCustomerId(
      dto.data.customer.id,
    );
    if (subcription) {
      subcription.activeStatus = SubscriptionActiveStatus.NOT_ACTIVE;
      await this.subscriptions.save(subcription);
      return true;
    }
    return false;
  }

  private async invoiceUpdated(dto: PaystackWebhookDto) {
    let result = false;
    if (dto.data.status === 'success' && dto.data.paid) {
      const subscription =
        await this.subscriptions.getSubscriptionByCustomerEmail(
          dto.data.customer.email,
        );
      if (subscription) {
        subscription.activeStatus = SubscriptionActiveStatus.ACTIVE;
        // subscription.paystack_email_token = dto.data.subscription.email_token;
        subscription.nextPaymentDate = new Date(
          dto.data.subscription.next_payment_date,
        );
        await this.subscriptions.save(subscription);
        result = true;
      }
      result = false;
    }
    return result;
  }

  private async updatePayment(dto: PaystackWebhookDto) {
    let flag = false;

    const transaction = await this.paymentRepo.getPaymentByReference(
      dto.data.reference,
    );

    if (transaction && dto.data.reference) {
      const referal = await this.referalsRepo.getReferalByUserReference(
        dto.data.reference,
      );

      let credits = [];

      const sojournCredits =
        await this.sojournCreditRepo.getSojournCreditByPayStackReference(
          dto.data.reference,
        );
      const transactionStatus = dto.data.status;
      const paymentConfirmed = transactionStatus === PAYSTACK_SUCCESS_STATUS;

      if (paymentConfirmed) {
        transaction.paymentStatus = PaymentStatus.COMPLETED;
        if (referal) {
          referal.paystackStatus = ReferalStatus.PAID;
        }
        credits = sojournCredits.map((sojournCredit) => {
          sojournCredit.status = SojournCreditsStatus.CONFIRMED;
          return sojournCredit;
        });

        const totalNumberOfGuests =
          transaction.booking.numberOfAdults +
          transaction.booking.numberOfChildren +
          transaction.booking.numberOfInfants;

        const checkIn = new Date(transaction.booking.checkIn);
        const checkOut = new Date(transaction.booking.checkOut);

        const checkInDate = new Date(
          transaction.booking.checkIn,
        ).toDateString();
        const checkOutDate = new Date(
          transaction.booking.checkOut,
        ).toDateString();

        const nightsSpent = numberOfNights(checkIn, checkOut);

        const address = `${transaction.booking.property.houseNumber}, ${transaction.booking.property.street} ${transaction.booking.property.zip}, ${transaction.booking.property.city}`;

        const bookingDateToMills = new Date(
          transaction.booking.checkIn,
        ).getTime();
        const cancellationDate = new Date(
          bookingDateToMills - 86400000 * 2,
        ).toDateString();

        const guestPhoneNumber = transaction.user.profile.primaryPhoneNumber
          ? transaction.user.profile.primaryPhoneNumber
          : '';

        const guestBookingConfirmed: GuestBookingConfirmationEvent = {
          hostFullName: `${transaction.host.firstName} ${transaction.host.lastName}`,
          email: transaction.user.email,
          lodgingType: `${transaction.booking.property.title}-${transaction.booking.property.typeOfProperty}`,
          lodgingImage: transaction.booking.property.photos[0],
          hostPhoneNumber: transaction.booking.property.contactPhoneNumber,
          audience: String(totalNumberOfGuests),
          freeCancelDate: cancellationDate,
          tenantFullName: `${transaction.user.firstName} ${transaction.user.lastName}`,
          lodgingBasePrice: transaction.booking.property.price,
          lodgingPrice: transaction.booking.property.price * nightsSpent,
          serviceFeeAmount: transaction.transactionFee,
          damageFeeAmount: transaction.booking.property.cautionFee,
          maintenanceFeeAmount: transaction.booking.property.cautionFee,
          vatShareAmount: transaction.vat,
          lodgingTotalPrice: transaction.amount,
          lodgingFullAddress: address,
          lodgingCity: transaction.booking.property.city,
          lodgingDuration: nightsSpent,
          propertyRSId: humazieUuid(transaction.booking.id),
          checkInDate: checkIn.toDateString(),
          checkOutDate: checkOut.toDateString(),
        };
        const numberOfNightsSpent = numberOfNights(checkIn, checkOut);

        const hostTotalEarning =
          transaction.booking.property.price * numberOfNightsSpent -
          0.03 * (transaction.booking.property.price * numberOfNightsSpent);

        const hostBookingConfirmed: HostBookingConfirmationEvent = {
          email: transaction.host.email,
          hostFullName: `${transaction.host.firstName} ${transaction.host.lastName}`,
          lodgingType: `${transaction.booking.property.title}-${transaction.booking.property.typeOfProperty}`,
          lodgingImage: transaction.booking.property.photos[0],
          lodgingTotalEarning: hostTotalEarning,
          guestFullName: `${transaction.user.firstName} ${transaction.user.lastName}`,
          guestPhoneNumber,
          audience: String(totalNumberOfGuests),
          freeCancelDate: cancellationDate,
          tenantFullName: `${transaction.user.firstName} ${transaction.user.lastName}`,
          lodgingBasePrice: transaction.booking.property.price,
          lodgingPrice: transaction.booking.property.price * nightsSpent,
          serviceFeeAmount: transaction.transactionFee,
          damageFeeAmount: transaction.booking.property.cautionFee,
          maintenanceFeeAmount: transaction.booking.property.cautionFee,
          vatShareAmount: transaction.vat,
          lodgingTotalPrice: transaction.amount,
          propertyRSId: humazieUuid(transaction.booking.id),
          lodgingCity: transaction.booking.property.city,
          lodgingFullAddress: address,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          hostPhoneNumber: transaction.booking.property.contactPhoneNumber,
          lodgingDuration: nightsSpent,
        };
        this.eventEmitter.emit('guest.booking.created', guestBookingConfirmed);
        flag = true;
        this.eventEmitter.emit('host.booking.confirmed', hostBookingConfirmed);
      } else {
        if (referal) {
          referal.paystackStatus = ReferalStatus.UNPAID;
        }

        transaction.paymentStatus = PaymentStatus.PENDING;
        credits = sojournCredits.map((sojournCredit) => {
          sojournCredit.status = SojournCreditsStatus.PENDING;
          return sojournCredit;
        });
      }

      if (referal) {
        await this.referalsRepo.save(referal);
      }

      await this.paymentRepo.save(transaction);
      if (credits.length) {
        await Promise.all(
          credits.map(async (c) => await this.sojournCreditRepo.save(c)),
        );
      }
    } else {
      const subscription =
        await this.subscriptions.getSubscriptionByCustomerEmail(
          dto.data.customer.email,
        );

      if (subscription) {
        subscription.activeStatus = SubscriptionActiveStatus.ACTIVE;
        await this.subscriptions.save(subscription);

        const normalizedAmountFromKoboToNaira = Number(dto.data.amount) / 100;

        const payment: CreateSubscriptionPayment = {
          subscription,
          amount: normalizedAmountFromKoboToNaira,
          paymentDate: new Date(dto.data.paid_at),
          paystackReference: dto.data.reference,
          paidOn: new Date(dto.data.paid_at),
          paymentStatus: SubscriptionPaymentStatus.PAID,
        };
        await this.subscriptionPayments.createSubscriptionPayment(payment);
        flag = true;
      }
    }
    return flag;
  }

  private async updateSubscription(dto: PaystackWebhookDto) {
    const subscription =
      await this.subscriptions.getSubscriptionByCustomerEmail(
        dto.data.customer.email,
      );
    if (subscription) {
      subscription.paystackAuthorizationCode =
        dto.data.authorization.authorization_code;
      subscription.paystackSubscriptionCode = dto.data.subscription_code;
      subscription.paystackCustomerId = dto.data.customer.id;
      subscription.paystackCustomerCode = dto.data.customer.customer_code;
      subscription.nextPaymentDate = new Date(dto.data.next_payment_date);
      // subscription.paystack_email_token = dto.data.subscription.email_token;
      subscription.activeStatus = SubscriptionActiveStatus.ACTIVE;
      await this.subscriptions.save(subscription);
      return true;
    }
    return false;
  }

  async initializeCryptoTransaction(dto: initializeTransactionDto) {
    const today = new Date();

    const bookingExists =
      await this.bookingService.checkListingAvailability(dto);
    if (!bookingExists) {
      throw new BadRequestException(
        'The dates on this booking are no longer available.',
      );
    }

    const isCheckInDateValid =
      numberOfNights(today, new Date(dto.checkInDate)) >= 1;
    if (!isCheckInDateValid) {
      throw new BadRequestException(
        'check in date cannot be earlier than the current day.',
      );
    }

    const isCheckoutDateValid =
      new Date(dto.checkOutDate) > new Date(dto.checkInDate);

    if (!isCheckoutDateValid) {
      throw new BadRequestException(
        'check out date cannot be earlier than the check in date.',
      );
    }

    const isCheckinAndCheckoutDateValid =
      numberOfNights(new Date(dto.checkInDate), new Date(dto.checkOutDate)) >=
      1;
    if (!isCheckinAndCheckoutDateValid) {
      throw new BadRequestException(
        'number of days between check in and check out must be >= 1.',
      );
    }

    const numberOfGuests =
      dto.numberOfAdults + dto.numberOfChildren + dto.numberOfChildren;

    if (numberOfGuests < 1) {
      throw new BadRequestException('number of guests staying must be >= 1.');
    }

    const property = await this.propertiesRepo.getPropertyById(dto.propertyId);
    const guest = await this.guestRepo.getGuestById(dto.userId);

    const result = await this.propertiesRepo.getHostByPropertyId(
      dto.propertyId,
    );

    const totalSojournCredits =
      await this.sojournCreditRepo.getTotalSojournCreditsByUserId(guest.id);
    let creditsToApply = 0;
    if (dto.credits <= totalSojournCredits) {
      creditsToApply = dto.credits;
    }

    const serviceFee = Math.round(
      (10 / 100) *
        (property.price * numberOfNights(dto.checkInDate, dto.checkOutDate)),
    );
    const vat = Math.round(
      (7.5 / 100) *
        (property.price * numberOfNights(dto.checkInDate, dto.checkOutDate)),
    );

    let currencies: string[] = [];

    //check if booking dates are still available here

    try {
      const response = await axios.get<NowPaymentsCurrenciesAvailableType>(
        NOW_PAYMENTS_GET_CURRENCIES_URL,
        {
          headers: {
            'x-api-key': `${this.configService.get<string>(
              'NOW_PAYMENTS_API_KEY',
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      currencies = response.data.currencies.map((c) => c.currency);
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException('Error get available currencies');
    }

    if (!currencies.includes('usdttrc20')) {
      throw new BadRequestException(
        'usdttrc20 payments not available at the moment',
      );
    }

    let minimumPayableAmount: number = 0;

    try {
      const response = await axios.get<NowPaymentsMinimumAmountPayableType>(
        NOW_PAYMENTS_MINIMUM_AMOUNT_PAYABLE,
        {
          headers: {
            'x-api-key': `${this.configService.get<string>(
              'NOW_PAYMENTS_API_KEY',
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      minimumPayableAmount = response.data.min_amount;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }

    const totalPriceInNaira =
      property.price * numberOfNights(dto.checkInDate, dto.checkOutDate) +
      serviceFee +
      property.cautionFee +
      vat -
      creditsToApply;

    let rate = 1700;
    const dollarRate = await this.rateRepository.getRate();
    if (rate) {
      rate = dollarRate.rate;
    }

    const nairaToDollar = totalPriceInNaira / rate;

    let estimatedAmount = 0;

    try {
      const response = await axios.get<NowPaymentsEstimatedPriceType>(
        getNowPaymentsEstimatedPrice(nairaToDollar, 'USD', 'usdttrc20'),
        {
          headers: {
            'x-api-key': `${this.configService.get<string>(
              'NOW_PAYMENTS_API_KEY',
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      estimatedAmount = response.data.estimated_amount;
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('could not get estimated amount');
    }

    if (estimatedAmount < minimumPayableAmount) {
      throw new BadRequestException(
        'the estimated amount is less than the minimum payable amount.',
      );
    }

    const createCryptoPaymentPayload: NowPaymentsCreatePaymentType = {
      price_amount: nairaToDollar,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
    };

    let responseCryptoPaymentPayload: NowPaymentsCreatePaymentReturnType;

    try {
      const response = await axios.post<NowPaymentsCreatePaymentReturnType>(
        NOW_PAYMENTS_CREATE_PAYMENT_URL,
        createCryptoPaymentPayload,
        {
          headers: {
            'x-api-key': `${this.configService.get<string>(
              'NOW_PAYMENTS_API_KEY',
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );

      responseCryptoPaymentPayload = response.data;

      if (responseCryptoPaymentPayload.payment_status === 'failed') {
        throw new BadRequestException(
          'your transaction cannot be completed at the moment. please try again.',
        );
      }
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(
        'Could not complete payment at the moment.',
      );
    }

    if (responseCryptoPaymentPayload.payment_status === 'waiting') {
      const currentDate = new Date();
      const holdingWindow = new Date(currentDate.getTime() + 30 * 60000); // Add 30 minutes (30 minutes * 60 seconds * 1000 milliseconds)

      const booking = await this.bookingRepo.createBooking({
        propertyId: property.id,
        guestId: guest.id,
        status: BookingStatus.PENDING,
        numberOfAdults: dto.numberOfAdults,
        numberOfChildren: dto.numberOfChildren,
        numberOfInfants: dto.numberOfInfants,
        checkIn: dto.checkInDate,
        checkOut: dto.checkOutDate,
        holdingWindow,
        cryptoPaymentAddress: responseCryptoPaymentPayload.pay_address,
        cryptoPaymentAmount: responseCryptoPaymentPayload.pay_amount,
      });

      const wallet = await this.walletRepo.getHostWalletByHostId(
        property.hostId,
      );

      const payment = await this.paymentRepo.createPayment({
        userId: guest.id,
        hostId: result.host.id,
        paymentType: PaymentTypes.BOOKING,
        amount:
          property.price * numberOfNights(dto.checkInDate, dto.checkOutDate) +
          serviceFee +
          property.cautionFee +
          vat -
          creditsToApply,
        vat,
        sojournCreditsAmount: creditsToApply,
        cautionFee: +property.cautionFee,
        transactionFee: serviceFee,
        bookingId: booking.id,
        description: `booking payment for ${property.title}`,
        paystackReference: responseCryptoPaymentPayload.payment_id,
        paymentMethod: PaymentMethod.CRYPTO,
        crypto_pay_amount: responseCryptoPaymentPayload.pay_amount,
        crypto_pay_amount_currency: responseCryptoPaymentPayload.pay_currency,
        crypto_pay_fiat_amount: responseCryptoPaymentPayload.price_amount,
        crypto_pay_fiat_currency: responseCryptoPaymentPayload.price_currency,
        crypto_pay_address: responseCryptoPaymentPayload.pay_address,
        wallet,
      });

      if (creditsToApply > 0) {
        await this.sojournCreditRepo.addSojournCredits({
          userId: guest.id,
          amount: -creditsToApply,
          booking: booking,
          type: SojournCreditsType.OUTGOING,
          reference: responseCryptoPaymentPayload.payment_id,
        });
      }

      if (guest.refererId) {
        const referalRecord = await this.referalsRepo.getReferalByUserId(
          guest.refererId,
          guest.id,
        );

        if (!referalRecord) {
          const record = {
            refererId: guest.refererId,
            userId: guest.id,
            amount: REFERAL_AMOUNT,
            paymentType: ReferalType.INCOMING,
            reference: responseCryptoPaymentPayload.payment_id,
            bookingId: booking.id,
          } as AddReferal;
          await this.referalsRepo.addReferal(record);
        }
      }

      const creditsEarned2Percent = Math.ceil(
        EARN_CREDITS_RATE *
          (property.price * numberOfNights(dto.checkInDate, dto.checkOutDate) +
            +serviceFee +
            +property.cautionFee +
            +vat -
            +creditsToApply),
      );

      await this.sojournCreditRepo.addSojournCredits({
        userId: guest.id,
        amount: creditsEarned2Percent,
        booking: booking,
        reference: responseCryptoPaymentPayload.payment_id,
      });
      return {
        paymentAddress: responseCryptoPaymentPayload.pay_address,
        amount: responseCryptoPaymentPayload.pay_amount,
        currency: responseCryptoPaymentPayload.pay_currency,
        paymentId: responseCryptoPaymentPayload.payment_id,
      };
    }

    throw new BadRequestException(
      `Error initiating transaction ${createCryptoPaymentPayload}`,
    );
  }

  async verifyCryptoTransaction(paymentId: string) {
    let status = '';
    let payment: Payment =
      await this.paymentRepo.getPaymentByReference(paymentId);

    if (payment.paymentStatus === PaymentStatus.COMPLETED) {
      payment.paymentStatus = PaymentStatus.COMPLETED;
      await this.paymentRepo.save(payment);

      const totalNumberOfGuests =
        payment.booking.numberOfAdults +
        payment.booking.numberOfChildren +
        payment.booking.numberOfInfants;

      const checkIn = new Date(payment.booking.checkIn);
      const checkOut = new Date(payment.booking.checkOut);

      const checkInDate = new Date(payment.booking.checkIn).toDateString();
      const checkOutDate = new Date(payment.booking.checkOut).toDateString();

      const nightsSpent = numberOfNights(checkIn, checkOut);

      const address = `${payment.booking.property.houseNumber}, ${payment.booking.property.street} ${payment.booking.property.zip}, ${payment.booking.property.city}`;
      const guestPhoneNumber = payment.user.profile.primaryPhoneNumber
        ? payment.user.profile.primaryPhoneNumber
        : '';
      const bookingDateToMills = new Date(payment.booking.checkIn).getTime();
      const cancellationDate = new Date(
        bookingDateToMills - 86400000 * 2,
      ).toDateString();
      const guestBookingConfirmed: GuestBookingConfirmationEvent = {
        hostFullName: `${payment.host.firstName} ${payment.host.lastName}`,
        email: payment.user.email,
        lodgingType: `${payment.booking.property.title}-${payment.booking.property.typeOfProperty}`,
        lodgingImage: payment.booking.property.photos[0],
        hostPhoneNumber: payment.booking.property.contactPhoneNumber,
        audience: String(totalNumberOfGuests),
        freeCancelDate: cancellationDate,
        tenantFullName: `${payment.user.firstName} ${payment.user.lastName}`,
        lodgingBasePrice: payment.booking.property.price,
        lodgingPrice: payment.booking.property.price * nightsSpent,
        serviceFeeAmount: payment.transactionFee,
        damageFeeAmount: payment.booking.property.cautionFee,
        maintenanceFeeAmount: payment.booking.property.cautionFee,
        vatShareAmount: payment.vat,
        lodgingTotalPrice: payment.amount,
        lodgingFullAddress: address,
        lodgingCity: payment.booking.property.city,
        lodgingDuration: nightsSpent,
        propertyRSId: humazieUuid(payment.booking.id),
        checkInDate: checkIn.toDateString(),
        checkOutDate: checkOut.toDateString(),
      };

      const numberOfNightsSpent = numberOfNights(checkIn, checkOut);

      const hostTotalEarning =
        payment.booking.property.price * numberOfNightsSpent -
        0.03 * (payment.booking.property.price * numberOfNightsSpent);

      const hostBookingConfirmed: HostBookingConfirmationEvent = {
        email: payment.host.email,
        hostFullName: `${payment.host.firstName} ${payment.host.lastName}`,
        lodgingType: `${payment.booking.property.title}-${payment.booking.property.typeOfProperty}`,
        lodgingImage: payment.booking.property.photos[0],
        lodgingTotalEarning: hostTotalEarning,
        guestFullName: `${payment.user.firstName} ${payment.user.lastName}`,
        guestPhoneNumber,
        audience: String(totalNumberOfGuests),
        freeCancelDate: cancellationDate,
        tenantFullName: `${payment.user.firstName} ${payment.user.lastName}`,
        lodgingBasePrice: payment.booking.property.price,
        lodgingPrice: payment.booking.property.price * nightsSpent,
        serviceFeeAmount: payment.transactionFee,
        damageFeeAmount: payment.booking.property.cautionFee,
        maintenanceFeeAmount: payment.booking.property.cautionFee,
        vatShareAmount: payment.vat,
        lodgingTotalPrice: payment.amount,
        propertyRSId: humazieUuid(payment.booking.id),
        lodgingCity: payment.booking.property.city,
        lodgingFullAddress: address,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        hostPhoneNumber: payment.booking.property.contactPhoneNumber,
        lodgingDuration: nightsSpent,
      };
      this.eventEmitter.emit('guest.booking.created', guestBookingConfirmed);
      this.eventEmitter.emit('host.booking.confirmed', hostBookingConfirmed);
      status = 'finished';
    }
    return status;
  }

  async initializaSubscription(dto: InitializeSubscription) {
    const host = await this.hostRepo.getHostAllFieldsById(dto.hostId);
    const existingSubscription =
      await this.subscriptions.getSubscriptionByHostId(dto.hostId);
    if (!host) {
      throw new BadRequestException('host does not exist.');
    }

    let paystackResult: PaystackCreateTransactionResponseDto;

    const payload = {
      email: host.email,
      plan: dto.planId,
      amount: dto.amount,
      // callback_url: this.configService.get('SUBSCRIPTIONS_VERIFY_CALLBACK'),
    };

    try {
      const response = await axios.post<PaystackCreateTransactionResponseDto>(
        PAYSTACK_TRANSACTION_INI_URL,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>(
              'PAYSTACK_SECRET_KEY',
            )}`,
          },
        },
      );
      paystackResult = response.data;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }

    if (paystackResult.status === true) {
      if (!existingSubscription) {
        const subscription: CreateSubscription = {
          hostId: host.id,
          planId: dto.planId,
          planName: dto.planName,
          paystackCustomerEmail: host.email,
          initialPaymentReference: paystackResult.data.reference,
          activeStatus: SubscriptionActiveStatus.NOT_ACTIVE,
        };

        await this.subscriptions.createSubscription(subscription);
      } else {
        existingSubscription.activeStatus = SubscriptionActiveStatus.NOT_ACTIVE;
        existingSubscription.planId = dto.planId;
        existingSubscription.planName = dto.planName;
        existingSubscription.initialPaymentReference =
          paystackResult.data.reference;
        await this.subscriptions.save(existingSubscription);
      }

      return {
        hostId: host.id,
        accessCode: paystackResult.data.access_code,
      };
    }

    throw new BadRequestException(
      'could not complete transaction at the moment',
    );
  }

  async updateWithdrawalById(paymentId: string) {
    try {
      return this.paymentRepo.updateWithdrawalById(paymentId);
    } catch (error) {
      throw new InternalServerErrorException(
        'could not complete transaction at the moment',
      );
    }
  }
}
