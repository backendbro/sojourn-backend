import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository, StaticBaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { Payment as PaymentEntity } from '../payments/entities/payment.entity';
import {
  Payment,
  PaymentStatus,
  PaymentTypes,
  WithdrawalStatus,
} from '../payments/types';
import {
  transformOfficePaymentRecords,
  transformOfficeWithdrawalRecord,
  transformOfficeWithdrawalRecords,
} from 'src/utils/payment-utils';
import { Host } from 'src/users/entities/users.entity';
import { Withdrawal } from 'src/payments/entities/withdrawal.entity';

@Injectable({ scope: Scope.REQUEST })
export class PaymentRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getAllWithdrawals() {
    const paymentRepository = this.getRepository(PaymentEntity);
    return transformOfficeWithdrawalRecords(
      await paymentRepository.find({
        where: {
          paymentType: PaymentTypes.WITHDRAWAL,
        },
        select: {
          id: true,
          amount: true,
          paymentStatus: true,
          createdAt: true,
          host: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        relations: {
          host: true,
        },
        order: {
          createdAt: 'DESC',
        },
      }),
    );
  }

  async getPaymentsByHostId(hostId: string) {
    return await this.getRepository(PaymentEntity).find({ where: { hostId } });
  }

  async paymentRecordExists(paymentId: string) {
    const paymentRepository = this.getRepository(PaymentEntity);
    return await paymentRepository.exists({ where: { id: paymentId } });
  }

  async getWithdrawalRecordByPaymentId(paymentId: string, hostId: string) {
    const paymentRepository = this.getRepository(PaymentEntity);
    const result = await paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['host', 'withdrawal.account'],
    });
    const allPayments = await paymentRepository.find({
      where: { hostId },
      relations: ['host', 'withdrawal.account', 'booking.property'],
    });

    return transformOfficeWithdrawalRecord(result, allPayments);
  }

  async getAllBookingPayments() {
    const paymentRepository = this.getRepository(PaymentEntity);
    return transformOfficePaymentRecords(
      await paymentRepository.find({
        where: {
          paymentType: PaymentTypes.BOOKING,
        },
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          paymentType: true,
          paymentStatus: true,
          createdAt: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
          booking: {
            id: true,
          },
        },
        relations: {
          user: true,
          booking: true,
        },
        order: {
          createdAt: 'DESC',
        },
      }),
    );
  }

  async getAll() {
    const paymentRepository = this.getRepository(PaymentEntity);
    return await paymentRepository.find({
      where: {
        paymentStatus: PaymentStatus.COMPLETED,
        paymentType: PaymentTypes.BOOKING,
      },
    });
  }

  async createPayment(payment: Payment) {
    const paymentRepository = this.getRepository(PaymentEntity);
    const paymentObj = paymentRepository.create(payment);
    return await paymentRepository.save(paymentObj);
  }

  async getPaymentByReference(reference: string) {
    return await this.getRepository(PaymentEntity).findOne({
      where: { paystackReference: reference },
      relations: ['user.profile', 'host.profile', 'booking.property'],
    });
  }

  async save(payment: PaymentEntity) {
    return await this.getRepository(PaymentEntity).save(payment);
  }

  async updateWithdrawalById(paymentId: string) {
    const withdrawal = this.getRepository(Withdrawal);
    const payment = this.getRepository(PaymentEntity);
    await Promise.all([
      await withdrawal.update(
        { payment: { id: paymentId } },
        { status: WithdrawalStatus.PAID },
      ),
      await payment.update(paymentId, {
        paymentStatus: PaymentStatus.COMPLETED,
      }),
    ]);
  }
}

@Injectable()
export class StaticPaymentRepository extends StaticBaseRepository {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getAll() {
    const paymentRepository = this.getRepository(PaymentEntity);
    return await paymentRepository.find({ relations: { booking: true } });
  }

  async getPaymentByReference(reference: string) {
    return await this.getRepository(PaymentEntity).findOne({
      where: { paystackReference: reference },
      relations: {
        booking: true,
      },
    });
  }

  async save(payment: PaymentEntity) {
    return await this.getRepository(PaymentEntity).save(payment);
  }
}
