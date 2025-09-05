import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailServiceService } from 'src/email-service/email-service.service';
import {
  SubscriptionInvoiceChargeFailedEvent,
  SubscriptionInvoiceCreatedEvent,
  SubscriptionWillNotRenewEvent,
} from '../types';

@Injectable()
export class SubscriptionEventsController {
  constructor(private emailService: EmailServiceService) {}

  @OnEvent('subscription.invoice.created')
  async handleSubscriptionInvoiceFailed(
    payload: SubscriptionInvoiceCreatedEvent,
  ) {
    await this.emailService.sendEmail(
      payload.email,
      'SubscriptionInvoiceCreatedEmailTemplate',
      payload,
    );
  }

  @OnEvent('subscription.charge.failed')
  async handleSubscriptionInvoiceChargeFailed(
    payload: SubscriptionInvoiceChargeFailedEvent,
  ) {
    await this.emailService.sendEmail(
      payload.email,
      'SubscriptionInvoicePaymentFailedEmailTemplate',
      payload,
    );
  }

  @OnEvent('subscription.not.renewing')
  async handleSubscriptionNotRenewing(payload: SubscriptionWillNotRenewEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'SubscriptionWillNotRenewEmailTemplate',
      payload,
    );
  }
}
