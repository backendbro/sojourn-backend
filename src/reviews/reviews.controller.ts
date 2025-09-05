import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewDto } from 'src/validators/reviews-validators';
import { Public } from 'src/auth/auth-custom-decorators';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Body() dto: ReviewDto) {
    return await this.reviewsService.createReview(dto);
  }

  @Public()
  @Get()
  async getReviews() {
    return await this.reviewsService.getReviews();
  }
}
