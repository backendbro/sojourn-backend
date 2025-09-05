import { Injectable, NotFoundException } from '@nestjs/common';
import { IReviews } from './types';
import { ReviewsRepository } from 'src/repositories/reviews.repository';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { ReviewDto } from 'src/validators/reviews-validators';

@Injectable()
export class ReviewsService {
  constructor(
    private reviews: ReviewsRepository,
    private bookings: BookingsRepository,
    private guest: GuestRepository,
  ) {}

  async createReview(review: ReviewDto) {
    const user = await this.guest.getGuestById(review.userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const booking = await this.bookings.getUnFormattedBookingById(
      review.bookingId,
    );
    if (!booking) {
      throw new NotFoundException('booking not found');
    }
    const reviewObj: IReviews = { ...review, propertyId: booking.property.id };
    return await this.reviews.createReview(reviewObj);
  }

  async getReviews() {
    return await this.reviews.getReviews();
  }
}
