import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from 'src/repositories/reviews.repository';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { GuestRepository } from 'src/repositories/guest.repository';

@Module({
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    ReviewsRepository,
    BookingsRepository,
    GuestRepository,
  ],
})
export class ReviewsModule {}
