// import {
//   BadRequestException,
//   HttpStatus,
//   Injectable,
//   Logger,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { WalletRepository } from 'src/repositories/wallet.repository';
// import {
//   BankAccount,
//   SojournCreditsType,
//   WalletPayload,
//   Withdraw,
// } from './types';
// import { AccountRepository } from 'src/repositories/account.repository';
// import { ReferalsRepository } from 'src/repositories/referals.repository';
// import { SojournCreditsRepository } from 'src/repositories/credits.repository';
// import { TransferSojournCreditsDto } from 'src/validators/wallet-validators';
// import { GuestRepository } from 'src/repositories/guest.repository';
// import { ACCESS_TOKEN, REFRESH_TOKEN } from 'src/constants';
// import { Response } from 'express';
// import { Wallet } from './entities/wallet.entity';
// import { PaymentRepository } from 'src/repositories/payment.repository';
// import { Payment } from 'src/payments/entities/payment.entity';

// @Injectable()
// export class WalletService {
//   constructor(
//     private walletRepository: WalletRepository,
//     private accountRepository: AccountRepository,
//     private referalRepository: ReferalsRepository,
//     private sojournCreditsRepository: SojournCreditsRepository,
//     private guestRepository: GuestRepository,
//     private paymentRepo: PaymentRepository,
//   ) {}

//   async addAccountDetails(payload: WalletPayload) {
//     const [, numberOfAccounts] =
//       await this.accountRepository.getAccountNumbersByHostId(payload.hostId);
//     if (numberOfAccounts >= 3) {
//       throw new BadRequestException(
//         'cannot add more accounts, limit exceeded.',
//       );
//     }
//     let wallet: Wallet;
//     wallet = await this.walletRepository.getWallet(payload.hostId);
//     if (!wallet) {
//       wallet = await this.walletRepository.createWallet(payload.hostId);
//     }
//     const payments = await this.paymentRepo.getPaymentsByHostId(payload.hostId);
//     await this.savePayments(wallet, payments);

//     const _ = await this.accountRepository.addBankAccount(wallet, payload);
//     return wallet;
//   }

//   async getPaymentsByHostId(id: string) {
//     return await this.walletRepository.getPaymentsByHostId(id);
//   }

//   async getPaymentsByGuestsId(id: string) {
//     return await this.walletRepository.getPaymentsByGuestsId(id);
//   }

//   async getWalletById(id: string) {
//     const record = await this.walletRepository.getWalletByHostId(id);
//     if (!record) {
//       const wallet = await this.walletRepository.createWallet(id);
//       const payments = await this.paymentRepo.getPaymentsByHostId(id);
//       await this.savePayments(wallet, payments);
//     }

//     const existingWallet = await this.walletRepository.getWallet(id);
//     const payments = await this.paymentRepo.getPaymentsByHostId(id);
//     await this.savePayments(existingWallet, payments);

//     return record;
//   }
//   async withdraw(payload: Withdraw) {
//     const hostWallet = await this.walletRepository.getHostWalletByHostId(
//       payload.hostId,
//     );
//     if (!hostWallet) throw new BadRequestException('host wallet not found');

//     const { availableBalance } = await this.walletRepository.getWalletByHostId(
//       payload.hostId,
//     );

//     if (availableBalance < payload.amount) {
//       throw new BadRequestException(
//         'The withdrawal amount cannot be greater than the avaialble balance.',
//       );
//     }
//     const transactionFee = payload.amount * 0.02;
//     const vat = 0.075 * payload.amount;
//     return await this.walletRepository.withdraw({
//       ...payload,
//       transactionFee,
//       vat,
//     });
//   }

//   async getWalletPaymentById(id: string) {
//     return await this.walletRepository.getWalletPaymentById(id);
//   }

//   async getSojournCreditsById(id: string) {
//     return await this.sojournCreditsRepository.getSojournCreditsByUserId(id);
//   }

//   // async seed() {
//   //   await this.sojournCreditsRepository.addSojournCredits({
//   //     userId: '450a3e19-70d0-4424-9394-c2ae28bf561f',
//   //     amount: 1000,
//   //     bookingId: '0522c0c8-fe3c-4ecb-b0ce-df436d2a30f6',
//   //     reference: 'PAYSTACK_REFERENCE',
//   //   });
//   // }

//   async getSojournCreditsByUserId(id: string) {
//     return await this.sojournCreditsRepository.getTotalSojournCreditsByUserId(
//       id,
//     );
//   }

//   async getAccountNumbersByHostId(hostId: string) {
//     const [accountNumbers] =
//       await this.accountRepository.getAccountNumbersByHostId(hostId);
//     return accountNumbers;
//   }

//   private async savePayments(wallet: Wallet, payments: Payment[]) {
//     return await Promise.all(
//       payments.map(async (payment: Payment) => {
//         payment.wallet = wallet;
//         return await this.paymentRepo.save(payment);
//       }),
//     );
//   }

//   async addMoreBankAccounts(payload: BankAccount) {
//     let wallet = await this.walletRepository.isAccountAdded(payload.hostId);
//     if (!wallet) {
//       wallet = await this.walletRepository.createWallet(payload.hostId);
//     }

//     const payments = await this.paymentRepo.getPaymentsByHostId(payload.hostId);
//     await this.savePayments(wallet, payments);

//     const [, numberOfAccounts] =
//       await this.accountRepository.getAccountNumbersByHostId(payload.hostId);
//     if (numberOfAccounts >= 3) {
//       throw new BadRequestException(
//         'cannot add more walllets. limit exceeded.',
//       );
//     }

//     return await this.accountRepository.addMoreBankAccounts({
//       ...payload,
//       wallet,
//       walletId: wallet.id,
//     });
//   }

//   async deleteAccountById(id: string) {
//     return await this.accountRepository.deleteAccountById(id);
//   }

//   async getAccountByUserId(id: string) {
//     const account = await this.accountRepository.getAccountByUserId(id);
//     const { balance } = await this.referalRepository.getReferalByUser(id);
//     return { account, balance };
//   }

//   async transferSojournCredits(dto: TransferSojournCreditsDto, res: Response) {
//     const receipient = await this.guestRepository.getGuestByEmail(dto.to);
//     if (!receipient) {
//       throw new BadRequestException(
//         `receipient with email ${dto.to} does not exist.`,
//       );
//     }

//     const sender = await this.guestRepository.getGuestById(dto.userId);
//     if (!sender) {
//       res.clearCookie(REFRESH_TOKEN);
//       res.clearCookie(ACCESS_TOKEN);
//       throw new UnauthorizedException('This user does not exist');
//     }

//     const totalSojournCredits =
//       await this.sojournCreditsRepository.getTotalSojournCreditsByUserId(
//         dto.userId,
//       );
//     if (totalSojournCredits <= 0) {
//       Logger.log(new BadRequestException('Your balance is empty.'));
//       throw new BadRequestException('Your balance is empty.');
//     }

//     if (+dto.amount > totalSojournCredits) {
//       Logger.log(
//         new BadRequestException(
//           'Your balance is too low for this transaction.',
//         ),
//       );
//       throw new BadRequestException(
//         'Your balance is too low for this transaction.',
//       );
//     }
//     const debit = {
//       userId: sender.id,
//       amount: -dto.amount,
//       type: SojournCreditsType.OUTGOING,
//       reference: dto.to,
//     };

//     const credit = {
//       userId: receipient.id,
//       amount: dto.amount,
//       type: SojournCreditsType.INCOMING,
//       reference: sender.id,
//     };

//     await Promise.all([
//       await this.sojournCreditsRepository.addSojournCredits(debit),
//       await this.sojournCreditsRepository.addSojournCredits(credit),
//     ]);

//     return res.status(HttpStatus.OK).json({ message: HttpStatus.OK });
//   }
// }

// Updated WalletService (withdraw now uses fixed ₦1500 withdrawal fee)
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { WalletRepository } from 'src/repositories/wallet.repository';
import {
  BankAccount,
  SojournCreditsType,
  WalletPayload,
  Withdraw,
} from './types';
import { AccountRepository } from 'src/repositories/account.repository';
import { ReferalsRepository } from 'src/repositories/referals.repository';
import { SojournCreditsRepository } from 'src/repositories/credits.repository';
import { TransferSojournCreditsDto } from 'src/validators/wallet-validators';
import { GuestRepository } from 'src/repositories/guest.repository';
import { ACCESS_TOKEN, REFRESH_TOKEN } from 'src/constants';
import { Response } from 'express';
import { Wallet } from './entities/wallet.entity';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { Payment } from 'src/payments/entities/payment.entity';

@Injectable()
export class WalletService {
  constructor(
    private walletRepository: WalletRepository,
    private accountRepository: AccountRepository,
    private referalRepository: ReferalsRepository,
    private sojournCreditsRepository: SojournCreditsRepository,
    private guestRepository: GuestRepository,
    private paymentRepo: PaymentRepository,
  ) {}

  async addAccountDetails(payload: WalletPayload) {
    const [, numberOfAccounts] =
      await this.accountRepository.getAccountNumbersByHostId(payload.hostId);
    if (numberOfAccounts >= 3) {
      throw new BadRequestException(
        'cannot add more accounts, limit exceeded.',
      );
    }
    let wallet: Wallet;
    wallet = await this.walletRepository.getWallet(payload.hostId);
    if (!wallet) {
      wallet = await this.walletRepository.createWallet(payload.hostId);
    }
    const payments = await this.paymentRepo.getPaymentsByHostId(payload.hostId);
    await this.savePayments(wallet, payments);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = await this.accountRepository.addBankAccount(wallet, payload);
    return wallet;
  }

  async getPaymentsByHostId(id: string) {
    return await this.walletRepository.getPaymentsByHostId(id);
  }

  async getPaymentsByGuestsId(id: string) {
    return await this.walletRepository.getPaymentsByGuestsId(id);
  }

  async getWalletById(id: string) {
    const record = await this.walletRepository.getWalletByHostId(id);
    if (!record) {
      const wallet = await this.walletRepository.createWallet(id);
      const payments = await this.paymentRepo.getPaymentsByHostId(id);
      await this.savePayments(wallet, payments);
    }

    const existingWallet = await this.walletRepository.getWallet(id);
    const payments = await this.paymentRepo.getPaymentsByHostId(id);
    await this.savePayments(existingWallet, payments);

    return record;
  }

  // === Updated withdraw method: fixed fee of ₦1500 instead of 2% commission ===
  async withdraw(payload: Withdraw) {
    const hostWallet = await this.walletRepository.getHostWalletByHostId(
      payload.hostId,
    );
    if (!hostWallet) throw new BadRequestException('host wallet not found');

    const { availableBalance } = await this.walletRepository.getWalletByHostId(
      payload.hostId,
    );

    // Normalize incoming amount (frontend may send negative values)
    const gross = Math.abs(Number(payload.amount || 0));

    const FIXED_WITHDRAWAL_FEE = 1500;
    // VAT on the fee (adjust if you want VAT on gross instead)
    const vat = Math.round(0.075 * FIXED_WITHDRAWAL_FEE);

    if (gross <= 0) {
      throw new BadRequestException(
        'Withdrawal amount must be greater than 0.',
      );
    }

    // Ensure the requested gross is greater than fee + vat
    if (gross <= FIXED_WITHDRAWAL_FEE + vat) {
      throw new BadRequestException(
        `Withdrawal amount must be greater than withdrawal fee of ₦${FIXED_WITHDRAWAL_FEE}.`,
      );
    }

    // Ensure host has enough available balance to cover gross + fee + vat
    const totalRequired = gross + FIXED_WITHDRAWAL_FEE + vat;
    if (availableBalance < totalRequired) {
      throw new BadRequestException(
        'The withdrawal amount plus fees exceed the available balance.',
      );
    }

    const netPayout = gross - FIXED_WITHDRAWAL_FEE - vat; // what gets paid out to host

    // Build payload to persist. Store amount as negative outgoing payment per existing convention
    return await this.walletRepository.withdraw({
      ...payload,
      amount: -Math.abs(netPayout),
      transactionFee: FIXED_WITHDRAWAL_FEE,
      vat,
    });
  }

  async getWalletPaymentById(id: string) {
    return await this.walletRepository.getWalletPaymentById(id);
  }

  async getSojournCreditsById(id: string) {
    return await this.sojournCreditsRepository.getSojournCreditsByUserId(id);
  }

  // async seed() {
  //   await this.sojournCreditsRepository.addSojournCredits({
  //     userId: '450a3e19-70d0-4424-9394-c2ae28bf561f',
  //     amount: 1000,
  //     bookingId: '0522c0c8-fe3c-4ecb-b0ce-df436d2a30f6',
  //     reference: 'PAYSTACK_REFERENCE',
  //   });
  // }

  async getSojournCreditsByUserId(id: string) {
    return await this.sojournCreditsRepository.getTotalSojournCreditsByUserId(
      id,
    );
  }

  async getAccountNumbersByHostId(hostId: string) {
    const [accountNumbers] =
      await this.accountRepository.getAccountNumbersByHostId(hostId);
    return accountNumbers;
  }

  private async savePayments(wallet: Wallet, payments: Payment[]) {
    return await Promise.all(
      payments.map(async (payment: Payment) => {
        payment.wallet = wallet;
        return await this.paymentRepo.save(payment);
      }),
    );
  }

  async addMoreBankAccounts(payload: BankAccount) {
    let wallet = await this.walletRepository.isAccountAdded(payload.hostId);
    if (!wallet) {
      wallet = await this.walletRepository.createWallet(payload.hostId);
    }

    const payments = await this.paymentRepo.getPaymentsByHostId(payload.hostId);
    await this.savePayments(wallet, payments);

    const [, numberOfAccounts] =
      await this.accountRepository.getAccountNumbersByHostId(payload.hostId);
    if (numberOfAccounts >= 3) {
      throw new BadRequestException(
        'cannot add more walllets. limit exceeded.',
      );
    }

    return await this.accountRepository.addMoreBankAccounts({
      ...payload,
      wallet,
      walletId: wallet.id,
    });
  }

  async deleteAccountById(id: string) {
    return await this.accountRepository.deleteAccountById(id);
  }

  async getAccountByUserId(id: string) {
    const account = await this.accountRepository.getAccountByUserId(id);
    const { balance } = await this.referalRepository.getReferalByUser(id);
    return { account, balance };
  }

  async transferSojournCredits(dto: TransferSojournCreditsDto, res: Response) {
    const receipient = await this.guestRepository.getGuestByEmail(dto.to);
    if (!receipient) {
      throw new BadRequestException(
        `receipient with email ${dto.to} does not exist.`,
      );
    }

    const sender = await this.guestRepository.getGuestById(dto.userId);
    if (!sender) {
      res.clearCookie(REFRESH_TOKEN);
      res.clearCookie(ACCESS_TOKEN);
      throw new UnauthorizedException('This user does not exist');
    }

    const totalSojournCredits =
      await this.sojournCreditsRepository.getTotalSojournCreditsByUserId(
        dto.userId,
      );
    if (totalSojournCredits <= 0) {
      Logger.log(new BadRequestException('Your balance is empty.'));
      throw new BadRequestException('Your balance is empty.');
    }

    if (+dto.amount > totalSojournCredits) {
      Logger.log(
        new BadRequestException(
          'Your balance is too low for this transaction.',
        ),
      );
      throw new BadRequestException(
        'Your balance is too low for this transaction.',
      );
    }
    const debit = {
      userId: sender.id,
      amount: -dto.amount,
      type: SojournCreditsType.OUTGOING,
      reference: dto.to,
    };

    const credit = {
      userId: receipient.id,
      amount: dto.amount,
      type: SojournCreditsType.INCOMING,
      reference: sender.id,
    };

    await Promise.all([
      await this.sojournCreditsRepository.addSojournCredits(debit),
      await this.sojournCreditsRepository.addSojournCredits(credit),
    ]);

    return res.status(HttpStatus.OK).json({ message: HttpStatus.OK });
  }
}
