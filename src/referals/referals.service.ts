import { Injectable } from '@nestjs/common';
import { AccountRepository } from 'src/repositories/account.repository';
import { ReferalsRepository } from 'src/repositories/referals.repository';
import { AddWithdrawalRequest } from 'src/validators/user-validators';
import { ReferalStatus, ReferalTransactionStatus, ReferalType } from './types';

@Injectable()
export class ReferalsService {
  constructor(
    private referalsRepo: ReferalsRepository,
    private accountRepo: AccountRepository,
  ) {}

  async getReferalsByUserId(userId: string) {
    // await this.seed();
    return await this.referalsRepo.getReferalByUser(userId);
  }

  async getReferalById(id: string) {
    return await this.referalsRepo.getReferalById(id);
  }

  async addWithdrawalRequest(dto: AddWithdrawalRequest) {
    const account = await this.accountRepo.getAccountByUserId(dto.userId);
    if (!account) {
      await this.accountRepo.createUserAccount({
        userId: dto.userId,
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
      });
    }
    const referal = await this.referalsRepo.addReferal({
      ...dto,
      paymentStatus: ReferalTransactionStatus.DEBIT,
      paystackStatus: ReferalStatus.UNPAID,
      paymentType: ReferalType.OUTGOING,
    });
    return referal;
  }
}
