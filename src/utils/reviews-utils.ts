import { Reviews } from 'src/reviews/entities/reviews.entity';

export function transformReviews(reviews: Reviews[]) {
  return reviews.map((review) => {
    return {
      message: review.message,
      rating: review.rating,
      name: `${review.user.firstName} ${review.user.lastName}`,
    };
  });
}
