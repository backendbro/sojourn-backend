import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { Reviews } from '../reviews/entities/reviews.entity';
import { IReviews } from '../reviews/types';
import { transformReviews } from '../utils/reviews-utils';

@Injectable({ scope: Scope.REQUEST })
export class ReviewsRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async count() {
    return await this.getRepository(Reviews).count();
  }

  async createReview(review: IReviews) {
    const repo = this.getRepository(Reviews);
    const reviewObj = repo.create(review);
    await repo.save(reviewObj);
  }

  async getReviews() {
    const repo = this.getRepository(Reviews);
    const count = await repo.count();
    const randomOffset = Math.max(0, Math.floor(Math.random() * (count - 6)));
    const reviews = await repo.find({
      select: {
        message: true,
        rating: true,
        id: true,
        user: {
          firstName: true,
          lastName: true,
        },
      },
      relations: { user: true },
      take: 15,
      skip: randomOffset,
    });

    return transformReviews(reviews);
  }
}
