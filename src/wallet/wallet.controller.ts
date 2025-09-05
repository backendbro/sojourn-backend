import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import {
  AddAccountDto,
  TransferSojournCreditsDto,
  WithdrawDto,
} from 'src/validators/wallet-validators';
import { WalletService } from './wallet.service';
import { BankAccount } from './types';
import { Response } from 'express';

import { SetMetadata } from '@nestjs/common';

const IS_PUBLIC_KEY = 'isPublic';
const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @UseInterceptors(TransactionInterceptor)
  @Post()
  async addAccountDetails(@Body() payload: AddAccountDto) {
    return await this.walletService.addAccountDetails(payload);
  }

  @Public()
  @Get('/:id')
  async getWalletById(@Param('id') id: string) {
    return await this.walletService.getWalletById(id);
  }

  @Public()
  @Get('/hosts/:id')
  async getPaymentsByHostId(@Param('id') id: string) {
    return await this.walletService.getPaymentsByHostId(id);
  }

  @Public()
  @Get('/guests/:id')
  async getPaymentsByGuestsId(@Param('id') id: string) {
    return await this.walletService.getPaymentsByGuestsId(id);
  }

  @Get('/guests/credits/:id')
  async getSojournCreditsById(@Param('id') id: string) {
    return await this.walletService.getSojournCreditsById(id);
  }

  @UseInterceptors(TransactionInterceptor)
  @Post('/withdraw')
  async withdraw(
    @Body()
    body: WithdrawDto,
  ) {
    return await this.walletService.withdraw(body);
  }

  @Get('/payment/:id')
  async getWalletPaymentById(@Param('id') id: string) {
    return await this.walletService.getWalletPaymentById(id);
  }

  @Get('/account/:hostId')
  async getAccountNumbersByHostId(@Param('hostId') hostId: string) {
    return await this.walletService.getAccountNumbersByHostId(hostId);
  }

  @Post('/account')
  async addAccountNumber(@Body() body: BankAccount) {
    return await this.walletService.addMoreBankAccounts(body);
  }

  @Delete('/account/:id')
  async deleteBankAccount(@Param('id') id: string) {
    return this.walletService.deleteAccountById(id);
  }

  @Get('/account/user/:id')
  async getAccountByUserId(@Param('id') id: string) {
    return await this.walletService.getAccountByUserId(id);
  }

  @Get('/credit/:id')
  async getSojournCredits(@Param('id') id: string) {
    return await this.walletService.getSojournCreditsByUserId(id);
  }

  @Post('/credit/transfer')
  async transferSojournCredits(
    @Body() body: TransferSojournCreditsDto,
    @Res() res: Response,
  ) {
    return await this.walletService.transferSojournCredits(body, res);
  }
}
