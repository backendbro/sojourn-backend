import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  InitializeSubscription,
  initializeTransactionDto,
} from 'src/validators/payments-validators';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { PaystackCallbackDto, PaystackWebhookDto } from './types';
import { Public } from 'src/auth/auth-custom-decorators';
import { PAYSTACK_WEBHOOK_SIGNATURE_KEY } from 'src/constants';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) {}

  @UseInterceptors(TransactionInterceptor)
  @Post('/initialize')
  async initializeTransaction(@Body() dto: initializeTransactionDto) {
    return await this.paymentService.initializeTransaction(dto);
  }

  @Get('/rate')
  async getRate() {
    return await this.paymentService.getRate();
  }

  @UseInterceptors(TransactionInterceptor)
  @Get('/verify')
  async verifyTransaction(
    @Query() query: PaystackCallbackDto,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.verifyTransaction(query);
    if (result) return res.sendStatus(HttpStatus.OK);
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }

  @Get('/office/all')
  async getAllPayments() {
    return await this.paymentService.getAllPayments();
  }

  @Get('/office/withdrawals/all')
  async getAllWithdrawals() {
    return await this.paymentService.getAllWithdrawals();
  }

  @Get('/office/withdrawals/:paymentId/:hostId')
  async getWithdrawalPaymentId(
    @Param('paymentId') paymentId: string,
    @Param('hostId') hostId: string,
  ) {
    return await this.paymentService.getWithdrawalByPaymentId(
      paymentId,
      hostId,
    );
  }

  @UseInterceptors(TransactionInterceptor)
  @Put('/office/withdrawals/:paymentId')
  async updateWithdrawalStatus(@Param('paymentId') paymentId: string) {
    return this.paymentService.updateWithdrawalById(paymentId);
  }

  @Public()
  @UseInterceptors(TransactionInterceptor)
  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhookRequest(
    @Body() dto: PaystackWebhookDto,
    @Headers() headers = {},
  ) {
    const result = await this.paymentService.handlePaystackSubscriptionsWebhook(
      dto,
      `${headers[PAYSTACK_WEBHOOK_SIGNATURE_KEY]}`,
    );
    return result;
  }

  @UseInterceptors(TransactionInterceptor)
  @Post('/crypto/initialize')
  async createPayment(@Body() dto: initializeTransactionDto) {
    return await this.paymentService.initializeCryptoTransaction(dto);
  }

  @UseInterceptors(TransactionInterceptor)
  @Get('/crypto/transaction/status')
  async getTransactionStatus(
    @Query('payment_id') paymentId: string,
    @Res() res: Response,
  ) {
    const status = await this.paymentService.verifyCryptoTransaction(paymentId);
    if (status === 'finished') {
      return res.status(200).json({ message: 'completed', status });
    } else {
      return res.status(204).json({ message: 'no new data yet.', status });
    }
  }

  @UseInterceptors(TransactionInterceptor)
  @Post('/subscription/initialize')
  async subscriptions(@Body() body: InitializeSubscription) {
    return this.paymentService.initializaSubscription(body);
  }
}
