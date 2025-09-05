import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { Account } from '../wallet/entities/account.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { BankAccount } from '../wallet/types';
import { UserAccount } from '../wallet/entities/user-account.entity';

@Injectable({ scope: Scope.REQUEST })
export class AccountRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getAccountNumbersByHostId(
    hostId: string,
  ): Promise<[Account[], number]> {
    return await this.getRepository(Account).findAndCount({
      where: {
        hostId,
      },
    });
  }

  async addBankAccount(
    wallet: Wallet,
    bankData: {
      bankName: string;
      bankAccountNumber: string;
      hostId: string;
    },
  ) {
    const accountModel = this.getRepository(Account);
    const account = accountModel.create({ ...bankData, wallet });
    return await accountModel.save(account);
  }

  async addMoreBankAccounts(account: BankAccount) {
    const accountModel = this.getRepository(Account);
    const accountObj = accountModel.create(account);
    await accountModel.save(accountObj);
  }

  async deleteAccountById(id: string) {
    const accountModel = this.getRepository(Account);
    return await accountModel.delete(id);
  }

  async getAccountByUserId(id: string) {
    const repo = this.getRepository(UserAccount);
    return await repo.findOne({
      where: {
        userId: id,
      },
    });
  }

  async createUserAccount(dto: {
    userId: string;
    bankName: string;
    bankAccountNumber: string;
  }) {
    const repo = this.getRepository(UserAccount);
    const account = repo.create(dto);
    return await repo.save(account);
  }
}
