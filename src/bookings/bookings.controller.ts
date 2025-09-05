import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Put,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { CheckListingAvailabilityType } from 'src/properties/types';
import { Response } from 'express';
import { Public } from 'src/auth/auth-custom-decorators';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingService: BookingsService) {}

  @Get('/hosts/:id')
  async getBookingsByHostId(@Param('id') id: string) {
    return await this.bookingService.getBookingsByHostId(id);
  }

  @Get('/all')
  async getAllBookings(@Param('id') id: string) {
    return await this.bookingService.getAllBookings();
  }

  @Get('/guests/:id')
  async getBookingsByGuestId(@Param('id') id: string) {
    return await this.bookingService.getBookingsByGuestId(id);
  }

  @Get(':id')
  async getBookingsById(@Param('id') id: string) {
    return await this.bookingService.getBookingById(id);
  }

  @Get('/hosts/booking/:id')
  async getHostBookingById(@Param('id') id: string) {
    return await this.bookingService.getHostBookingById(id);
  }

  @Get()
  async checkAvailabilityOfListing(
    @Query() query: Promise<CheckListingAvailabilityType>,
  ) {
    const searchParams = await query;
    return await this.bookingService.checkListingAvailability(searchParams);
  }

  @Get('/host/invoice/:id')
  async downloadHostInvoice(@Param('id') id: string, @Res() res: Response) {
    return await this.bookingService.downloadHostBookingInvoice(id, res);
  }

  @Get('/guest/invoice/:id')
  async downloadGuestInvoice(@Param('id') id: string, @Res() res: Response) {
    return await this.bookingService.downloadGuestBookingInvoice(id, res);
  }

  @UseInterceptors(TransactionInterceptor)
  @Put('/cancel')
  async cancelBooking(@Body() { id }: { id: string }) {
    return await this.bookingService.cancelBooking(id);
  }
}
