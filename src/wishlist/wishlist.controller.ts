import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishListDto } from 'src/validators/user-validators';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @UseInterceptors(TransactionInterceptor)
  @Post()
  async addToWishList(@Body() dto: AddWishListDto) {
    return await this.wishlistService.addToWishList(dto);
  }

  @Get('/user/:id')
  async getWishesByUserId(@Param('id') userId: string) {
    return await this.wishlistService.getWishListByUserId(userId);
  }
}
