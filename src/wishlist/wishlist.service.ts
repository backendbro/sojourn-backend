import { WishlistRepository } from 'src/repositories/wishlist.repository';
import { AddToWishListType } from './types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WishlistService {
  constructor(private wishlist: WishlistRepository) {}

  async addToWishList(dto: AddToWishListType) {
    try {
      const result = await this.wishlist.addToWishList(dto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getWishListByUserId(userId: string) {
    return await this.wishlist.getWishListByUserId(userId);
  }
}
