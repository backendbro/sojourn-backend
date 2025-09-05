import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository, StaticBaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { Referals } from '../referals/entities/referals.entity';
import { AddReferal, ReferalStatus, ReferalType } from '../referals/types';
import {
  calculateReferalBalance,
  transfromReferals,
} from '../utils/user-utils';

@Injectable({ scope: Scope.REQUEST })
export class ReferalsRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getReferalByUserId(refererId: string, userId: string) {
    return await this.getRepository(Referals).findOne({
      where: {
        refererId,
        userId,
      },
    });
  }

  async getReferalByUserReference(reference: string) {
    return await this.getRepository(Referals).findOne({
      where: {
        reference,
      },
    });
  }

  async addReferal(dto: AddReferal) {
    const repo = this.getRepository(Referals);
    if (dto.paymentType === ReferalType.OUTGOING) {
      const { balance } = await this.getReferalByUser(dto.refererId);
      if (dto.amount > balance) {
        throw new BadRequestException('Cannot withdraw more than your balance');
      }
    }
    const referal = repo.create(dto);
    return await this.save(referal);
  }

  async save(referal: Referals) {
    const repo = this.getRepository(Referals);
    return await repo.save(referal);
  }

  async getReferalByUser(userId: string) {
    const results = await this.getRepository(Referals).find({
      where: {
        refererId: userId,
        paystackStatus: ReferalStatus.PAID,
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        paymentType: true,
        user: {
          firstName: true,
          lastName: true,
        },
      },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    const balance = calculateReferalBalance(results);
    return { balance, data: transfromReferals(results) };
  }

  async getReferalById(id: string) {
    const repo = this.getRepository(Referals);
    const result = await repo.findOne({
      where: { id },
      select: {
        id: true,
        amount: true,
        paymentType: true,
        updatedAt: true,
        user: {
          firstName: true,
          lastName: true,
        },
      },
      relations: {
        user: true,
      },
    });
    return result;
  }
}

@Injectable()
export class StaticReferalsRepository extends StaticBaseRepository {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getReferalByUserReference(reference: string) {
    return await this.getRepository(Referals).findOne({
      where: {
        reference,
      },
    });
  }

  async save(referal: Referals) {
    const repo = this.getRepository(Referals);
    return await repo.save(referal);
  }
}
