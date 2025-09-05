import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ReferalsService } from './referals.service';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { AddWithdrawalRequest } from 'src/validators/user-validators';

@Controller('referals')
export class ReferalsController {
  constructor(private referalService: ReferalsService) {}

  @Get('/:userId')
  async getReferalsByUserId(@Param('userId') userId: string) {
    return await this.referalService.getReferalsByUserId(userId);
  }
  @Get('/referal/:id')
  async getReferalById(@Param('id') id: string) {
    return await this.referalService.getReferalById(id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async addWithdrawalRequest(@Body() dto: AddWithdrawalRequest) {
    return await this.referalService.addWithdrawalRequest(dto);
  }
}
