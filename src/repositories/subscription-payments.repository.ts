import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { CreateSubscriptionPayment } from '../payments/types';
import { SubscriptionPayment } from '../payments/entities/subscription-payment.entity';
import { transformSubscriptionPayments } from '../utils/subscription-utils';

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionPaymentsRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async createSubscriptionPayment(payment: CreateSubscriptionPayment) {
    const repo = this.getRepository(SubscriptionPayment);
    const record = repo.create(payment);
    await repo.save(record);
  }

  async getSubscriptionPaymentsByHostId(id: string) {
    const repo = this.getRepository(SubscriptionPayment);
    const results = await repo.find({
      where: { subscription: { hostId: id } },
      select: {
        id: true,
        amount: true,
        paidOn: true,
        paymentStatus: true,
      },
      order: { createdAt: 'DESC' },
    });
    return transformSubscriptionPayments(results);
  }

  async getPaymentByReference(reference: string) {
    const repo = this.getRepository(SubscriptionPayment);
    return repo.findOne({ where: { paystackReference: reference } });
  }

  async save(payment: SubscriptionPayment) {
    const repo = this.getRepository(SubscriptionPayment);
    return await repo.save(payment);
  }
}
