import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { Brackets, DataSource } from 'typeorm';
import { WalletPayload, Withdraw } from '../wallet/types';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Payment } from '../payments/entities/payment.entity';
import {
  applyWithdrawals,
  transformWalletRecords,
  transfromPaymentRecord,
} from '../utils/wallet-utils';
import { PaymentMethod, PaymentStatus, PaymentTypes } from '../payments/types';
import { Withdrawal } from '../payments/entities/withdrawal.entity';

@Injectable({ scope: Scope.REQUEST })
export class WalletRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async createWallet(hostId: string) {
    const wallet = this.getRepository(Wallet);
    const walletObj = wallet.create({ hostId });
    return await wallet.save(walletObj);
  }

  async getWallet(hostId: string) {
    return await this.getRepository(Wallet).findOne({ where: { hostId } });
  }

  async getNumberOfWalletsByHostId(hostId: string) {
    return await this.getRepository(Wallet).count({ where: { hostId } });
  }

  async isAccountAdded(hostId: string) {
    const wallet = this.getRepository(Wallet);
    return await wallet.findOne({
      where: {
        hostId,
      },
    });
  }

  async getPaymentsByHostId(id: string) {
    const payment = this.getRepository(Payment);
    const records = await payment
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking') // Join the 'booking' relation
      .leftJoinAndSelect('booking.property', 'property') // Join the 'property' relation
      .where('payment.hostId = :id', { id }) // Filter by hostId
      .andWhere(
        new Brackets((qb) => {
          qb.where('payment.payment_status = :status', {
            status: PaymentStatus.COMPLETED,
          })
            .orWhere('payment.payment_type = :typeWithdrawal', {
              typeWithdrawal: PaymentTypes.WITHDRAWAL,
            })
            .orWhere('payment.payment_type = :typeRefund', {
              typeRefund: PaymentTypes.REFUND,
            });
        }),
      ) // Group OR conditions
      .orderBy('payment.createdAt', 'DESC') // Order by createdAt in descending order
      .getMany();

    return transformWalletRecords(records);
  }

  async getPaymentsByGuestsId(id: string) {
    const payment = this.getRepository(Payment);
    const records = await payment.find({
      where: {
        userId: id,
      },
      select: {
        id: true,
        paymentMethod: true,
        description: true,
        paymentType: true,
        amount: true,
        paymentReference: true,
        transactionFee: true,
        booking: {
          property: {
            title: true,
          },
        },
      },
      relations: {
        booking: {
          property: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return transformWalletRecords(records);
  }

  async getWalletByHostId(id: string) {
    const wallet = this.getRepository(Wallet);
    const walletRecord = await wallet.findOne({
      where: {
        hostId: id,
      },
      select: { id: true },
    });

    if (!walletRecord) {
      return null;
    }

    const record = await wallet.findOne({
      where: {
        id: walletRecord.id,
      },
      relations: ['payments.booking.property', 'accounts'], // Load relations without selecting all fields automatically
    });

    const selectedRecord = {
      id: record.id,
      payments: record.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        paymentType: payment.paymentType,
        paymentStatus: payment.paymentStatus,
        vat: payment.vat,
        serviceFee: Number(payment.transactionFee),
        sojournCreditsAmount: payment.sojournCreditsAmount,
        cautionFee: payment.cautionFee,
        booking: payment.booking
          ? {
              id: payment.booking.id,
              status: payment.booking.status,
              checkIn: payment.booking.checkIn,
              checkOut: payment.booking.checkOut,
              property: payment.booking.property
                ? payment.booking.property
                : null,
            }
          : null,
      })),
      accounts: record.accounts.map((account) => ({
        id: account.id,
        bankName: account.bankName,
        bankAccountNumber: account.bankAccountNumber,
      })),
    };

    return applyWithdrawals(selectedRecord);
  }

  async getHostWalletByHostId(hostId: string) {
    const wallet = this.getRepository(Wallet);
    const hostWallet = await wallet.findOne({
      where: {
        hostId,
      },
    });
    if (!hostWallet) {
      return await wallet.save(wallet.create({ hostId }));
    }
    return hostWallet;
  }

  async withdraw(payload: Withdraw & { transactionFee: number; vat: number }) {
    const payment = this.getRepository(Payment);
    const withdrawal = this.getRepository(Withdrawal);

    const paymentRecord = payment.create({
      ...payload,
      paymentMethod: PaymentMethod.TRANSFER,
      paymentType: PaymentTypes.WITHDRAWAL,
    });
    const withdrawalRecord = withdrawal.create({
      accountId: payload.accountId,
    });
    const withdrawalRecordToPayment = await withdrawal.save(withdrawalRecord);
    const result = await payment.save({
      ...paymentRecord,
      withdrawal: withdrawalRecordToPayment,
    });
    result.withdrawalId = withdrawalRecordToPayment.id;
    await payment.save(result);
    return result.id;
  }

  async getWalletPaymentById(id: string) {
    const payment = this.getRepository(Payment);
    const record = await payment.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        paymentMethod: true,
        description: true,
        paymentType: true,
        amount: true,
        paymentReference: true,
        transactionFee: true,
        createdAt: true,
        sojournCreditsAmount: true,
        vat: true,
        cautionFee: true,
        user: {
          firstName: true,
          lastName: true,
          email: true,
        },
        booking: {
          property: {
            title: true,
          },
        },
      },
      relations: {
        booking: {
          property: true,
        },
        user: true,
      },
    });

    return transfromPaymentRecord(record);
  }
}
