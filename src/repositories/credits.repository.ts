import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository, StaticBaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { SojournCredits } from '../wallet/entities/sojourn-credits.entity';
import { AddSojournCredits, SojournCreditsStatus } from '../wallet/types';
import {
  calculateTotalCredits,
  formatSojournCredits,
} from '../utils/wallet-utils';

@Injectable({ scope: Scope.REQUEST })
export class SojournCreditsRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getSojournCreditByPayStackReference(reference: string) {
    const creditRepo = this.getRepository(SojournCredits);
    const result = await creditRepo.find({
      where: {
        reference,
      },
    });
    return result;
  }

  async getSingleSojournCreditByPayStackReference(reference: string) {
    const creditRepo = this.getRepository(SojournCredits);
    const result = await creditRepo.findOne({
      where: {
        reference,
      },
      select: {
        status: true,
      },
    });
    return result;
  }

  async getSojournCreditsByUserId(userId: string) {
    const creditRepo = this.getRepository(SojournCredits);

    const results = await creditRepo.find({
      where: {
        userId,
        status: SojournCreditsStatus.CONFIRMED,
      },
      select: {
        amount: true,
        createdAt: true,
        id: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return formatSojournCredits(results);
  }

  async getTotalSojournCreditsByUserId(userId: string) {
    const creditRepo = this.getRepository(SojournCredits);
    const results = await creditRepo.find({
      where: {
        userId,
        status: SojournCreditsStatus.CONFIRMED,
      },
      select: {
        amount: true,
        createdAt: true,
        id: true,
      },
    });

    return calculateTotalCredits(results);
  }

  async addSojournCredits(values: AddSojournCredits) {
    const creditRepo = this.getRepository(SojournCredits);

    const creditRecord = creditRepo.create(values);
    return await creditRepo.save(creditRecord);
  }

  async save(credit: SojournCredits) {
    const creditRepo = this.getRepository(SojournCredits);
    await creditRepo.save(credit);
  }
}

@Injectable()
export class StaticSojournCreditsRepository extends StaticBaseRepository {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getSingleSojournCreditByPayStackReference(reference: string) {
    const creditRepo = this.getRepository(SojournCredits);
    const result = await creditRepo.findOne({
      where: {
        reference,
        status: SojournCreditsStatus.PENDING,
      },
    });
    return result;
  }

  async save(credit: SojournCredits) {
    const creditRepo = this.getRepository(SojournCredits);
    await creditRepo.save(credit);
  }
}
