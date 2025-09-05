import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  CancelSubscriptionDto,
  UpgradeSubscriptionDto,
} from 'src/validators/subscription-validators';
import { PaymentsService } from 'src/payments/payments.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private subscriptionService: SubscriptionsService,
    private paymentService: PaymentsService,
  ) {}

  @Get('/:id')
  async getSubscriptionsByHostId(@Param('id') id: string) {
    return await this.subscriptionService.getSubscriptionsByHostId(id);
  }

  @Get('/payments/:id')
  async getSubscriptionPaymentsByHostId(@Param('id') id: string) {
    return await this.subscriptionService.getSubscriptionPaymentsByHostId(id);
  }

  @Get('/cancel/:id')
  async cancelSubscription(@Body() dto: CancelSubscriptionDto) {
    return this.subscriptionService.cancelSubscriptionByHostId(dto.hostId);
  }

  @Post('/upgrade')
  async upgradeSubscription(@Body() dto: UpgradeSubscriptionDto) {
    const isCancelled = await this.cancelSubscription({ hostId: dto.hostId });
    if (isCancelled) {
      return await this.paymentService.initializaSubscription(dto);
    }
    throw new BadRequestException(
      'could not complete upgrade request at this time',
    );
  }
}
