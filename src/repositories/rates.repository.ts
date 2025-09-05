import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { Rates } from 'src/admin/entities/admin.entity';
import { RATES } from 'src/admin/types';

@Injectable({ scope: Scope.REQUEST })
export class RatesRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async createOrUpdateCurrencyRate(rate: number) {
    const repo = this.getRepository(Rates);
    const nairaToDollarRate = await repo.findOne({
      where: { name: RATES.NAIRA_TO_DOLLAR },
    });
    if (nairaToDollarRate) {
      nairaToDollarRate.rate = rate;
      return await repo.save(nairaToDollarRate);
    }
    const newRate = repo.create({ rate });
    return await repo.save(newRate);
  }

  async getRate() {
    const repo = this.getRepository(Rates);
    return await repo.findOne({ where: { name: RATES.NAIRA_TO_DOLLAR } });
  }
}
