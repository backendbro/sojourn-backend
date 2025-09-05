import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { AddToWishListType } from '../wishlist/types';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { transformWishlist } from '../utils/user-utils';

@Injectable({ scope: Scope.REQUEST })
export class WishlistRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async addToWishList(dto: AddToWishListType) {
    const repo = this.getRepository(Wishlist);
    const doesWishExist = await repo.findOne({
      where: { userId: dto.userId, propertyId: dto.propertyId },
    });
    if (doesWishExist) {
      return await repo.delete({
        userId: dto.userId,
        propertyId: dto.propertyId,
      });
    } else {
      const wishList = repo.create(dto);
      return await repo.save(wishList);
    }
  }

  async getWishListByUserId(userId: string) {
    const repo = this.getRepository(Wishlist);
    const list = await repo.find({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        property: {
          id: true,
          title: true,
          city: true,
          country: true,
          price: true,
          photos: true,
          reviews: {
            rating: true,
          },
        },
      },
      relations: {
        property: true,
      },
    });

    return transformWishlist(list);
  }
}
