import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import {
  CreateSubscription,
  SubscriptionActiveStatus,
} from '../payments/types';
import { Subscriptions } from '../payments/entities/subscription.entity';

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getSubscriptionByHostId(id: string) {
    const repo = this.getRepository(Subscriptions);
    const subscription = await repo.findOne({
      where: { hostId: id, activeStatus: SubscriptionActiveStatus.ACTIVE },
    });
    return subscription;
  }

  async createSubscription(sub: CreateSubscription) {
    const repo = this.getRepository(Subscriptions);
    const createdSubscription = repo.create(sub);
    await repo.save(createdSubscription);
  }

  async getSubscriptionByCustomerId(id: number) {
    const repo = this.getRepository(Subscriptions);
    const record = await repo.findOne({
      where: { paystackCustomerId: id },
    });
    return record;
  }

  async getSubscriptionByCustomerEmail(email: string) {
    const repo = this.getRepository(Subscriptions);
    const record = await repo.findOne({
      where: { paystackCustomerEmail: email },
    });
    return record;
  }

  async save(sub: Subscriptions) {
    const repo = this.getRepository(Subscriptions);
    return await repo.save(sub);
  }
}
