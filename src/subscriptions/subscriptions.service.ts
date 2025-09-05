import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { SubscriptionPaymentsRepository } from 'src/repositories/subscription-payments.repository';
import { SubscriptionRepository } from 'src/repositories/subscription.repository';
import {
  CancelSubscriptionPayloadType,
  GetSubscriptionPayloadType,
} from './types';
import {
  CANCEL_SUBSCRIPTIONS_URL,
  FETCH_SUBSCRIPTION_URL,
} from 'src/constants';
import { ConfigService } from '@nestjs/config';
import { SubscriptionActiveStatus } from 'src/payments/types';

@Injectable()
export class SubscriptionsService {
  constructor(
    private subscriptions: SubscriptionRepository,
    private subscriptionPayments: SubscriptionPaymentsRepository,
    private hostRepo: HostsRepository,
    private configService: ConfigService,
  ) {}

  async getSubscriptionsByHostId(id: string) {
    return await this.subscriptions.getSubscriptionByHostId(id);
  }

  async getSubscriptionPaymentsByHostId(id: string) {
    return await this.subscriptionPayments.getSubscriptionPaymentsByHostId(id);
  }

  async cancelSubscriptionByHostId(id: string) {
    try {
      const subscription = await this.subscriptions.getSubscriptionByHostId(id);

      let remoteSubscription: GetSubscriptionPayloadType = null;
      if (subscription) {
        remoteSubscription = await this.getSubscriptionFromPaystack(
          subscription.paystackSubscriptionCode,
        );
      }

      if (remoteSubscription.status) {
        const response = await this.cancelSubscription({
          code: subscription.paystackSubscriptionCode,
          emailToken: remoteSubscription.data.email_token,
        });
        subscription.activeStatus = SubscriptionActiveStatus.NOT_ACTIVE;
        await this.subscriptions.save(subscription);
        return response;
      }
      throw new Error('No subscription record was found');
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async getSubscriptionFromPaystack(subCode: string) {
    if (!subCode) {
      throw new Error('invalid argument');
    }
    const response = await axios.get<GetSubscriptionPayloadType>(
      `${FETCH_SUBSCRIPTION_URL}${subCode}`,
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'PAYSTACK_SECRET_KEY',
          )}`,
        },
      },
    );
    if (response.data.status) {
      return response.data;
    }
    throw new Error('unable to get subscription at the moment.');
  }

  private async cancelSubscription({
    code,
    emailToken,
  }: {
    code: string;
    emailToken: string;
  }) {
    if (!code || !emailToken) {
      throw new Error('invalid arguments');
    }
    const body = { code, token: emailToken };
    const response = await axios.post<CancelSubscriptionPayloadType>(
      CANCEL_SUBSCRIPTIONS_URL,
      body,
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'PAYSTACK_SECRET_KEY',
          )}`,
        },
      },
    );
    if (response.data.status) {
      return response.data;
    }
    throw new Error('unable to cancel subscription at the moment.');
  }
}
